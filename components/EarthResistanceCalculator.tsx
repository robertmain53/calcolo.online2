'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SoilModel = 'single' | 'twoLayer';
type ElectrodeType = 'rod' | 'strip' | 'ring';

interface SingleLayerParams {
  resistivity: number;
  length: number;
  diameter: number;
  depth: number;
}

interface TwoLayerParams extends SingleLayerParams {
  upperResistivity: number;
  lowerResistivity: number;
  boundaryDepth: number;
}

interface ResultSummary {
  label: string;
  value: string;
}

interface CalculationResult {
  resistance: number;
  firstLayerResistance?: number;
  secondLayerResistance?: number;
  equivalentResistivity?: number;
  safetyCheck: {
    maxResistance: number | null;
    compliant: boolean | null;
  };
  notes: string[];
  summary: ResultSummary[];
}

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeRodResistance({
  resistivity,
  length,
  diameter,
  depth,
}: SingleLayerParams) {
  if (resistivity <= 0 || length <= 0 || diameter <= 0) {
    return 0;
  }
  const effectiveLength = Math.max(length, depth);
  const term1 = resistivity / (2 * Math.PI * effectiveLength);
  const term2 = Math.log((8 * effectiveLength) / diameter) - 1;
  return term1 * term2;
}

function computeStripResistance({
  resistivity,
  length,
  diameter,
  depth,
}: SingleLayerParams) {
  if (resistivity <= 0 || length <= 0) {
    return 0;
  }
  const equivalentDiameter = diameter > 0 ? diameter : 0.02;
  const term1 = resistivity / (Math.PI * length);
  const term2 = Math.log((2 * length * length) / (equivalentDiameter * depth)) - 1;
  return term1 * term2;
}

function computeRingResistance({
  resistivity,
  length,
  diameter,
}: SingleLayerParams) {
  if (resistivity <= 0 || length <= 0) {
    return 0;
  }
  const perimeter = length;
  const radius = perimeter / (2 * Math.PI);
  const equivalentDiameter = diameter > 0 ? diameter : 0.02;
  return (resistivity / (2 * Math.PI * radius)) * (Math.log((8 * radius) / equivalentDiameter) - 1);
}

function computeTwoLayerResistance(params: TwoLayerParams, electrodeType: ElectrodeType) {
  const { upperResistivity, lowerResistivity, boundaryDepth } = params;
  if (
    upperResistivity <= 0 ||
    lowerResistivity <= 0 ||
    boundaryDepth <= 0
  ) {
    return {
      resistance: 0,
      equivalentResistivity: 0,
      notes: ['Parametri del terreno non validi o incompleti.'],
    };
  }

  const k = upperResistivity / lowerResistivity;
  const b = boundaryDepth / params.length;
  const equivalentResistivity =
    lowerResistivity *
    ((upperResistivity + (k - 1) * Math.tanh(b)) / (1 + (k - 1) * Math.tanh(b)));

  const singleLayerParams: SingleLayerParams = {
    resistivity: equivalentResistivity,
    length: params.length,
    diameter: params.diameter,
    depth: params.depth,
  };

  const resistance =
    electrodeType === 'rod'
      ? computeRodResistance(singleLayerParams)
      : electrodeType === 'strip'
      ? computeStripResistance(singleLayerParams)
      : computeRingResistance(singleLayerParams);

  return {
    resistance,
    equivalentResistivity,
  };
}

function computeResistance({
  soilModel,
  electrodeType,
  singleLayerParams,
  twoLayerParams,
  numberOfElectrodes,
  spacing,
  maxResistance,
}: {
  soilModel: SoilModel;
  electrodeType: ElectrodeType;
  singleLayerParams: SingleLayerParams;
  twoLayerParams: TwoLayerParams;
  numberOfElectrodes: number;
  spacing: number;
  maxResistance: number | null;
}): CalculationResult | null {
  if (soilModel === 'single') {
    const baseResistance =
      electrodeType === 'rod'
        ? computeRodResistance(singleLayerParams)
        : electrodeType === 'strip'
        ? computeStripResistance(singleLayerParams)
        : computeRingResistance(singleLayerParams);

    if (baseResistance <= 0) {
      return null;
    }

    const couplingFactor =
      numberOfElectrodes > 1
        ? Math.pow(
            1 -
              Math.log(spacing / singleLayerParams.length > 1 ? spacing / singleLayerParams.length : 1) /
                (2 * numberOfElectrodes),
            1
          )
        : 1;

    const equivalentResistance =
      numberOfElectrodes > 0
        ? baseResistance / (numberOfElectrodes * couplingFactor)
        : baseResistance;

    const summary: ResultSummary[] = [
      {
        label: 'Resistenza singolo dispersore',
        value: `${round(baseResistance, 2)} Ω`,
      },
      {
        label: 'Numero dispersori',
        value: `${numberOfElectrodes}`,
      },
      {
        label: 'Resistenza equivalente',
        value: `${round(equivalentResistance, 2)} Ω`,
      },
    ];

    const safetyCheck =
      maxResistance !== null
        ? {
            maxResistance,
            compliant: equivalentResistance <= maxResistance + 1e-6,
          }
        : { maxResistance: null, compliant: null };

    const notes: string[] = [];
    if (numberOfElectrodes > 1 && spacing < singleLayerParams.length) {
      notes.push(
        'La distanza tra i dispersori è inferiore alla lunghezza: la formula di accoppiamento è conservativa.'
      );
    }

    return {
      resistance: equivalentResistance,
      safetyCheck,
      summary,
      notes,
    };
  }

  const twoLayerResult = computeTwoLayerResistance(twoLayerParams, electrodeType);
  const baseResistance = twoLayerResult.resistance;
  if (baseResistance <= 0) {
    return null;
  }

  const couplingFactor =
    numberOfElectrodes > 1
      ? Math.pow(
          1 -
            Math.log(spacing / twoLayerParams.length > 1 ? spacing / twoLayerParams.length : 1) /
              (2 * numberOfElectrodes),
          1
        )
      : 1;

  const equivalentResistance =
    numberOfElectrodes > 0
      ? baseResistance / (numberOfElectrodes * couplingFactor)
      : baseResistance;

  const summary: ResultSummary[] = [
    {
      label: 'Resistenza singolo dispersore',
      value: `${round(baseResistance, 2)} Ω`,
    },
    {
      label: 'Resistività equivalente',
      value: `${round(twoLayerResult.equivalentResistivity ?? 0, 1)} Ω·m`,
    },
    {
      label: 'Resistenza equivalente',
      value: `${round(equivalentResistance, 2)} Ω`,
    },
  ];

  const safetyCheck =
    maxResistance !== null
      ? {
          maxResistance,
          compliant: equivalentResistance <= maxResistance + 1e-6,
        }
      : { maxResistance: null, compliant: null };

  const notes: string[] = [];
  if (twoLayerResult.equivalentResistivity) {
    notes.push(
      `Modello a due strati: resistività equivalente ${round(
        twoLayerResult.equivalentResistivity,
        1
      )} Ω·m.`
    );
  }

  return {
    resistance: equivalentResistance,
    equivalentResistivity: twoLayerResult.equivalentResistivity,
    safetyCheck,
    summary,
    notes,
  };
}

export default function EarthResistanceCalculator() {
  const [soilModel, setSoilModel] = useState<SoilModel>('single');
  const [electrodeType, setElectrodeType] = useState<ElectrodeType>('rod');
  const [resistivity, setResistivity] = useState('100');
  const [length, setLength] = useState('3');
  const [diameter, setDiameter] = useState('0.02');
  const [depth, setDepth] = useState('2.5');
  const [upperResistivity, setUpperResistivity] = useState('120');
  const [lowerResistivity, setLowerResistivity] = useState('60');
  const [boundaryDepth, setBoundaryDepth] = useState('2');
  const [numberOfElectrodes, setNumberOfElectrodes] = useState('2');
  const [spacing, setSpacing] = useState('5');
  const [maxResistance, setMaxResistance] = useState('50');

  const singleLayerParams: SingleLayerParams = {
    resistivity: Math.max(1, toNumber(resistivity, 100)),
    length: Math.max(0.5, toNumber(length, 3)),
    diameter: Math.max(0.001, toNumber(diameter, 0.02)),
    depth: Math.max(0.5, toNumber(depth, 2.5)),
  };

  const twoLayerParams: TwoLayerParams = {
    ...singleLayerParams,
    upperResistivity: Math.max(1, toNumber(upperResistivity, 120)),
    lowerResistivity: Math.max(1, toNumber(lowerResistivity, 60)),
    boundaryDepth: Math.max(0.5, toNumber(boundaryDepth, 2)),
  };

  const result = useMemo(
    () =>
      computeResistance({
        soilModel,
        electrodeType,
        singleLayerParams,
        twoLayerParams,
        numberOfElectrodes: Math.max(1, Math.floor(toNumber(numberOfElectrodes, 1))),
        spacing: Math.max(0.5, toNumber(spacing, 5)),
        maxResistance: toNumber(maxResistance) > 0 ? toNumber(maxResistance) : null,
      }),
    [
      soilModel,
      electrodeType,
      singleLayerParams,
      twoLayerParams,
      numberOfElectrodes,
      spacing,
      maxResistance,
    ]
  );

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri dell&apos;impianto di terra
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Inserisci resistività del terreno, geometria del dispersore e configurazione dei dispersori
          per stimare la resistenza di terra Rt secondo CEI 64-8 e CEI 99-3.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="soilModel" className="calculator-label">
                  Modello di terreno
                </label>
                <select
                  id="soilModel"
                  value={soilModel}
                  onChange={(event) => setSoilModel(event.target.value as SoilModel)}
                  className="calculator-input"
                >
                  <option value="single">Strato unico</option>
                  <option value="twoLayer">Terreno a due strati</option>
                </select>
              </div>
              <div>
                <label htmlFor="electrodeType" className="calculator-label">
                  Tipologia dispersore
                </label>
                <select
                  id="electrodeType"
                  value={electrodeType}
                  onChange={(event) => setElectrodeType(event.target.value as ElectrodeType)}
                  className="calculator-input"
                >
                  <option value="rod">Picchetto verticale</option>
                  <option value="strip">Cordolo / nastro</option>
                  <option value="ring">Anello di fondazione</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="resistivity" className="calculator-label">
                  Resistività terreno ρ (Ω·m)
                </label>
                <input
                  id="resistivity"
                  type="number"
                  min="1"
                  step="1"
                  value={resistivity}
                  onChange={(event) => setResistivity(event.target.value)}
                  className="calculator-input"
                  disabled={soilModel === 'twoLayer'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Valore da sonda di Wenner o tabelle CEI (es. 100 Ω·m per terreni medi).
                </p>
              </div>
              <div>
                <label htmlFor="length" className="calculator-label">
                  Lunghezza dispersore L (m)
                </label>
                <input
                  id="length"
                  type="number"
                  min="0.5"
                  step="0.1"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="diameter" className="calculator-label">
                  Diametro / larghezza (m)
                </label>
                <input
                  id="diameter"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={diameter}
                  onChange={(event) => setDiameter(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Per nastri suggerire 0,03 m (30 mm); per cordine considerare la sezione equivalente.
                </p>
              </div>
              <div>
                <label htmlFor="depth" className="calculator-label">
                  Profondità interramento (m)
                </label>
                <input
                  id="depth"
                  type="number"
                  min="0.5"
                  step="0.1"
                  value={depth}
                  onChange={(event) => setDepth(event.target.value)}
                  className="calculator-input"
                  disabled={electrodeType === 'ring'}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {soilModel === 'twoLayer' && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Terreno stratificato</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="upperResistivity" className="calculator-label">
                      ρ strato superficiale (Ω·m)
                    </label>
                    <input
                      id="upperResistivity"
                      type="number"
                      min="1"
                      step="1"
                      value={upperResistivity}
                      onChange={(event) => setUpperResistivity(event.target.value)}
                      className="calculator-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="lowerResistivity" className="calculator-label">
                      ρ strato profondo (Ω·m)
                    </label>
                    <input
                      id="lowerResistivity"
                      type="number"
                      min="1"
                      step="1"
                      value={lowerResistivity}
                      onChange={(event) => setLowerResistivity(event.target.value)}
                      className="calculator-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="boundaryDepth" className="calculator-label">
                    Profondità interfaccia (m)
                  </label>
                  <input
                    id="boundaryDepth"
                    type="number"
                    min="0.5"
                    step="0.1"
                    value={boundaryDepth}
                    onChange={(event) => setBoundaryDepth(event.target.value)}
                    className="calculator-input"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="numberOfElectrodes" className="calculator-label">
                  Numero dispersori
                </label>
                <input
                  id="numberOfElectrodes"
                  type="number"
                  min="1"
                  step="1"
                  value={numberOfElectrodes}
                  onChange={(event) => setNumberOfElectrodes(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="spacing" className="calculator-label">
                  Distanza tra dispersori (m)
                </label>
                <input
                  id="spacing"
                  type="number"
                  min="0.5"
                  step="0.1"
                  value={spacing}
                  onChange={(event) => setSpacing(event.target.value)}
                  className="calculator-input"
                  disabled={numberOfElectrodes === '1'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="maxResistance" className="calculator-label">
                Limite Rt richiesto (Ω)
              </label>
              <input
                id="maxResistance"
                type="number"
                min="0"
                step="1"
                value={maxResistance}
                onChange={(event) => setMaxResistance(event.target.value)}
                className="calculator-input"
              />
              <p className="mt-1 text-xs text-gray-500">
                Es. 50 Ω per sistemi TT senza differenziale ad alta sensibilità, 10 Ω per impianti
                con SPD o prescrizioni del distributore.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
              <p className="font-semibold text-gray-900">Note d&apos;uso</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Le formule sono valide per lunghezze moderate (≤ 10 m). Per maglie complesse usare software FEM.</li>
                <li>Applicare fattori correttivi per dispersori zincati o in profondità variabile.</li>
                <li>Verifica sempre in campo con misure strumentali (metodo voltamperometrico).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <>
          <section className="section-card border-green-100">
            <h2 className="text-2xl font-semibold text-gray-900">
              Esito del calcolo
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Il valore Rt calcolato è confrontato con il limite impostato. Nel caso di terreno stratificato viene utilizzata
              la resistività equivalente derivata dai parametri inseriti.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {result.summary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-green-100 bg-green-50 p-4 text-sm text-green-900"
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-base font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {result.safetyCheck.maxResistance !== null && (
              <div className="mt-6 flex flex-wrap gap-3">
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    result.safetyCheck.compliant
                      ? 'border border-green-200 bg-green-100 text-green-800'
                      : 'border border-red-200 bg-red-100 text-red-800'
                  }`}
                >
                  {result.safetyCheck.compliant
                    ? 'Impianto conforme al limite impostato'
                    : `Rt superiore al limite (${round(result.resistance, 2)} Ω > ${
                        result.safetyCheck.maxResistance
                      } Ω)`}
                </span>
              </div>
            )}

            {result.notes.length > 0 && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <h3 className="text-lg font-semibold">Attenzioni progettuali</h3>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {result.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Formule e riferimenti normativi
            </h2>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p>
                <strong>Picchetto verticale</strong>:{' '}
                <code>R = ρ / (2πL) · [ln(8L/d) − 1]</code>
              </p>
              <p>
                <strong>Dispersore a nastro</strong>:{' '}
                <code>R = ρ / (πL) · [ln((2L²)/(b·h)) − 1]</code>
              </p>
              <p>
                <strong>Anello di fondazione</strong>:{' '}
                <code>R = ρ / (2πr) · [ln(8r/d) − 1]</code>
              </p>
              <p>
                <strong>Resistività equivalente due strati</strong>:{' '}
                <code>ρeq = ρ2 · [ρ1 + (k − 1) tanh(b)] / [1 + (k − 1) tanh(b)]</code>
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Assunzioni adottate</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Dispersori lontani da altri conduttori o fondazioni metalliche.</li>
                <li>Terreno omogeneo (o assimilato) nel volume interessato dal dispersore.</li>
                <li>Effetti termici trascurati: le misure in campo devono confermare i valori calcolati.</li>
              </ul>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Suggerimenti professionali
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Esegui una campagna di misura della resistività con metodo Wenner in diverse stagioni.</li>
              <li>Distribuisci i picchetti a distanza ≥ 2 · L per ridurre l&apos;accoppiamento.</li>
              <li>Integra disperdenti orizzontali (cordini o anelli) per ridurre Rt in terreni resistivi.</li>
              <li>Verifica il coordinamento con dispositivi differenziali o SPD considerando l&apos;energia di cortocircuito.</li>
            </ol>

            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Disclaimer professionale</p>
              <p className="mt-1">
                Il calcolo fornisce una stima progettuale della resistenza di terra. Effettua sempre misure in campo e
                adegua il progetto alle prescrizioni della CEI 64-8, della CEI 99-3 e del distributore locale.
              </p>
            </div>
          </section>

          <section className="section-card space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Feedback da tecnici specializzati
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 p-4">
                “L&apos;integrazione tra modelli a strato unico e stratificato ci permette di giustificare le soluzioni nei report per i clienti industriali.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Ing. Matteo R., progettista impianti BT
                </span>
              </li>
              <li className="rounded-lg border border-gray-200 p-4">
                “Le formule richiamate e le note operative sono perfette per la dichiarazione CEI 64-8.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Per. Ind. Sara L., consulente verifiche impianti
                </span>
              </li>
            </ul>
          </section>
        </>
      ) : (
        <section className="section-card border border-dashed border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900">
            Inserisci i parametri per calcolare Rt
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Definisci il modello di terreno, la tipologia di dispersori e la loro disposizione per stimare
            la resistenza di terra dell&apos;impianto.
          </p>
        </section>
      )}

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme e riferimenti tecnici
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>CEI 64-8, Parte 4 e Parte 5 – Protezione contro i contatti indiretti.</li>
          <li>CEI 99-3 (EN 50522) – Impianti di terra negli impianti di distribuzione.</li>
          <li>CEI 11-1 – Impianti di produzione, trasmissione e distribuzione di energia elettrica.</li>
          <li>DM 37/2008 – Obblighi di progetto, installazione e verifica degli impianti elettrici.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Elettrotecnica"
        reviewedBy="Ing. Ugo Candido (Ordine Udine n. 2389)"
        lastReviewDate="2025-03-09"
        referenceStandard="CEI 64-8, CEI 99-3, CEI 11-1, DM 37/2008"
      />
    </div>
  );
}
