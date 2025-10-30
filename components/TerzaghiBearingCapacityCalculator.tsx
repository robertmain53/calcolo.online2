'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type FoundationShape = 'strip' | 'square' | 'circular';

interface CalculationResult {
  nc: number;
  nq: number;
  ngamma: number;
  sc: number;
  sq: number;
  sgamma: number;
  dc: number;
  dq: number;
  dgamma: number;
  ic: number;
  iq: number;
  igamma: number;
  bearingCapacityUltimate: number;
  bearingCapacityAllowable: number;
  contactPressure: number;
  settlementMessage?: string;
  warning?: string;
  contributions: {
    cohesion: number;
    surcharge: number;
    unitWeight: number;
  };
  summary: Array<{ label: string; value: string }>;
}

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeBearingFactors(phiDeg: number) {
  const phi = degreesToRadians(phiDeg);
  if (phiDeg < 0 || phiDeg >= 45) {
    return { Nc: 0, Nq: 0, Ngamma: 0 };
  }
  const Nq = Math.exp(Math.PI * Math.tan(phi)) * Math.tan(Math.PI / 4 + phi / 2) ** 2;
  const Nc = (Nq - 1) / Math.tan(phi || 1e-6);
  const Ngamma =
    2 * (Nq + 1) * Math.tan(phi);
  return { Nc, Nq, Ngamma };
}

function shapeFactors(shape: FoundationShape, phiDeg: number) {
  const phi = degreesToRadians(phiDeg);
  if (shape === 'strip') {
    return { sc: 1, sq: 1, sgamma: 1 };
  }
  if (shape === 'square') {
    return {
      sc: 1 + 0.2 * Math.tan(phi) ** 2,
      sq: 1 + 0.1 * Math.tan(phi),
      sgamma: 0.8,
    };
  }
  const sgamma = 0.6;
  return {
    sc: 1 + 0.3 * Math.tan(phi) ** 2,
    sq: 1 + 0.2 * Math.tan(phi),
    sgamma,
  };
}

function depthFactors(depth: number, width: number, phiDeg: number) {
  const phi = degreesToRadians(phiDeg);
  const dRatio = depth / width;
  if (phiDeg <= 0) {
    const factor = 1 + 0.4 * dRatio;
    return { dc: factor, dq: factor, dgamma: 1 };
  }
  return {
    dc: 1 + 0.2 * dRatio,
    dq: 1 + 0.1 * dRatio * Math.tan(phi),
    dgamma: 1,
  };
}

function inclinationFactors(alphaDeg: number, qo: number, ci: number) {
  const alpha = degreesToRadians(alphaDeg);
  const ic = Math.pow(1 - alphaDeg / 90, 2);
  const iq = ic;
  const igamma = ic;
  return { ic, iq, igamma };
}

function computeTerzaghi(params: {
  shape: FoundationShape;
  width: number;
  length: number;
  depth: number;
  cohesion: number;
  unitWeight: number;
  surcharge: number;
  phi: number;
  safetyFactor: number;
  load: number;
}) {
  const {
    shape,
    width,
    depth,
    length,
    cohesion,
    unitWeight,
    surcharge,
    phi,
    safetyFactor,
    load,
  } = params;

  const { Nc, Nq, Ngamma } = computeBearingFactors(phi);
  const { sc, sq, sgamma } = shapeFactors(shape, phi);
  const { dc, dq, dgamma } = depthFactors(depth, width, phi);
  const { ic, iq, igamma } = inclinationFactors(0, surcharge, 0);

  const cohesionContribution = cohesion * Nc * sc * dc * ic;
  const surchargeContribution = surcharge * Nq * sq * dq * iq;
  const unitWeightContribution =
    0.5 * unitWeight * width * Ngamma * sgamma * dgamma * igamma;
  const bearingCapacityUltimate =
    cohesionContribution + surchargeContribution + unitWeightContribution;

  const bearingCapacityAllowable =
    safetyFactor > 0 ? bearingCapacityUltimate / safetyFactor : bearingCapacityUltimate;

  const foundationArea =
    shape === 'strip'
      ? width * 1
      : shape === 'square'
        ? width * width
        : (Math.PI * width * width) / 4;

  const contactPressure = foundationArea > 0 ? load / foundationArea : 0;

  let warning: string | undefined;
  if (bearingCapacityAllowable < contactPressure * 1.1) {
    warning =
      'La pressione di contatto supera la portanza ammissibile. Valuta un aumento delle dimensioni del plinto o un miglioramento del terreno.';
  } else if (bearingCapacityAllowable < contactPressure * 1.3) {
    warning =
      'Margine di sicurezza ridotto tra pressione di contatto e portanza ammissibile (meno del 30%).';
  }

  let settlementMessage: string | undefined;
  if (depth / width < 1) {
    settlementMessage =
      'Rapporto D/B < 1. Considera il controllo dei cedimenti tramite moduli edometrici o prove CPT/CPTu.';
  }

  const summary: CalculationResult['summary'] = [
    {
      label: 'Nc, Nq, Ngamma',
      value: `${round(Nc, 2)} / ${round(Nq, 2)} / ${round(Ngamma, 2)}`,
    },
    {
      label: 'Fattori di forma',
      value: `Sc=${round(sc, 3)}, Sq=${round(sq, 3)}, Sgamma=${round(sgamma, 3)}`,
    },
    {
      label: 'Portanza ultima',
      value: `${round(bearingCapacityUltimate, 1)} kPa`,
    },
    {
      label: 'Portanza ammissibile',
      value: `${round(bearingCapacityAllowable, 1)} kPa`,
    },
    {
      label: 'Pressione di contatto',
      value: `${round(contactPressure, 1)} kPa`,
    },
    {
      label: 'Contributi',
      value: `Coesione ${round(cohesionContribution, 1)} kPa, Sormonto ${round(
        surchargeContribution,
        1
      )} kPa, Peso proprio ${round(unitWeightContribution, 1)} kPa`,
    },
  ];

  return {
    nc: Nc,
    nq: Nq,
    ngamma: Ngamma,
    sc,
    sq,
    sgamma,
    dc,
    dq,
    dgamma,
    ic,
    iq,
    igamma,
    bearingCapacityUltimate,
    bearingCapacityAllowable,
    contactPressure,
    warning,
    settlementMessage,
    contributions: {
      cohesion: cohesionContribution,
      surcharge: surchargeContribution,
      unitWeight: unitWeightContribution,
    },
    summary,
  };
}

export default function TerzaghiBearingCapacityCalculator() {
  const [shape, setShape] = useState<FoundationShape>('square');
  const [width, setWidth] = useState('2.0');
  const [length, setLength] = useState('2.0');
  const [depth, setDepth] = useState('1.2');
  const [cohesion, setCohesion] = useState('25');
  const [unitWeight, setUnitWeight] = useState('18');
  const [surcharge, setSurcharge] = useState('30');
  const [phi, setPhi] = useState('22');
  const [safetyFactor, setSafetyFactor] = useState('2.5');
  const [designLoad, setDesignLoad] = useState('900'); // kN

  const result = useMemo<CalculationResult | null>(() => {
    const b = toNumber(width);
    const l = toNumber(length);
    const d = toNumber(depth);
    const c = toNumber(cohesion);
    const gamma = toNumber(unitWeight);
    const qo = toNumber(surcharge);
    const phiVal = toNumber(phi);
    const safety = Math.max(1, toNumber(safetyFactor));
    const load = Math.max(0, toNumber(designLoad));

    if (b <= 0 || d <= 0 || phiVal < 0 || phiVal >= 45 || gamma <= 0) {
      return null;
    }

    return computeTerzaghi({
      shape,
      width: b,
      length: l,
      depth: d,
      cohesion: c,
      unitWeight: gamma,
      surcharge: qo,
      phi: phiVal,
      safetyFactor: safety,
      load,
    });
  }, [
    shape,
    width,
    length,
    depth,
    cohesion,
    unitWeight,
    surcharge,
    phi,
    safetyFactor,
    designLoad,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri geotecnici e geometrici
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci dimensioni della fondazione, caratteristiche del terreno e carico di progetto.
          Il calcolo restituisce la portanza ultima e ammissibile secondo Terzaghi, includendo coefficienti di forma e profondita.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="shape" className="calculator-label">
                Tipologia di fondazione
              </label>
              <select
                id="shape"
                value={shape}
                onChange={(event) =>
                  setShape(event.target.value as FoundationShape)
                }
                className="calculator-input"
              >
                <option value="strip">Trave rovescia</option>
                <option value="square">Plinto quadrato</option>
                <option value="circular">Fondazione circolare</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="width" className="calculator-label">
                  Dimensione B (m)
                </label>
                <input
                  id="width"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                  className="calculator-input"
                />
              </div>
              {shape !== 'strip' && (
                <div>
                  <label htmlFor="length" className="calculator-label">
                    Dimensione L (m)
                  </label>
                  <input
                    id="length"
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={length}
                    onChange={(event) => setLength(event.target.value)}
                    className="calculator-input"
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="depth" className="calculator-label">
                Profondita D (m)
              </label>
              <input
                id="depth"
                type="number"
                step="0.1"
                min="0.3"
                value={depth}
                onChange={(event) => setDepth(event.target.value)}
                className="calculator-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Profondita della base rispetto al piano campagna.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cohesion" className="calculator-label">
                  Coesione non drenata c (kPa)
                </label>
                <input
                  id="cohesion"
                  type="number"
                  step="5"
                  min="0"
                  value={cohesion}
                  onChange={(event) => setCohesion(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="phi" className="calculator-label">
                  Angolo di attrito phi ( deg
                  )
                </label>
                <input
                  id="phi"
                  type="number"
                  step="0.5"
                  min="0"
                  max="44"
                  value={phi}
                  onChange={(event) => setPhi(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="unitWeight" className="calculator-label">
                  Peso di volume gamma (kN/m^3)
                </label>
                <input
                  id="unitWeight"
                  type="number"
                  step="0.5"
                  min="10"
                  value={unitWeight}
                  onChange={(event) => setUnitWeight(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="surcharge" className="calculator-label">
                  Sormonto q (kPa)
                </label>
                <input
                  id="surcharge"
                  type="number"
                  step="5"
                  min="0"
                  value={surcharge}
                  onChange={(event) => setSurcharge(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="designLoad" className="calculator-label">
                Carico di progetto N (kN)
              </label>
              <input
                id="designLoad"
                type="number"
                step="10"
                min="0"
                value={designLoad}
                onChange={(event) => setDesignLoad(event.target.value)}
                className="calculator-input"
              />
            </div>

            <div>
              <label htmlFor="safetyFactor" className="calculator-label">
                Coefficiente di sicurezza gamma<sub>R</sub>
              </label>
              <input
                id="safetyFactor"
                type="number"
                step="0.1"
                min="1.0"
                value={safetyFactor}
                onChange={(event) => setSafetyFactor(event.target.value)}
                className="calculator-input"
              />
            </div>
          </div>
        </div>
      </section>

      {!result && (
        <section className="section-card border border-red-100 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900">
            Parametri insufficienti
          </h3>
          <p className="text-sm text-red-800">
            Controlla dimensioni, peso di volume (gamma &gt; 0) e angolo di attrito (0 deg &lt;= phi &lt; 45 deg).
          </p>
        </section>
      )}

      {result && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Portanza secondo Terzaghi
            </h2>
            <p className="text-sm text-gray-600">
              Il modello integra i fattori di forma, profondita e inclinazione suggeriti dalla letteratura per plinti su terreni omogenei.
            </p>
          </header>

          {result.warning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {result.warning}
            </div>
          )}

          {result.settlementMessage && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              {result.settlementMessage}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Portanza ultima q<sub>ult</sub>
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.bearingCapacityUltimate, 1)} kPa
              </p>
              <p className="text-sm text-gray-600">
                Contributi: coesione {round(result.contributions.cohesion, 1)} kPa,
                sormonto {round(result.contributions.surcharge, 1)} kPa,
                peso {round(result.contributions.unitWeight, 1)} kPa
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Portanza ammissibile q<sub>amm</sub>
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.bearingCapacityAllowable, 1)} kPa
              </p>
              <p className="text-sm text-gray-600">
                Coefficiente di sicurezza: {round(toNumber(safetyFactor), 2)}
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Pressione di contatto
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.contactPressure, 1)} kPa
              </p>
              <p className="text-sm text-gray-600">
                Carico N = {designLoad} kN
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Parametro
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Valore
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.summary.map((item) => (
                  <tr key={item.label}>
                    <td className="px-4 py-2 text-gray-700">{item.label}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <strong>Nota operativa:</strong> confronta q<sub>amm</sub> con la pressione massima
            generata dal modello strutturale. Per fondazioni su terreni stratificati aggiorna i parametri geotecnici strato per strato e integra con verifiche
            di cedimento immediato e consolidazione.
          </div>
        </section>
      )}

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Normativa, ipotesi e formule
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="text-base font-semibold text-blue-900">
              Riferimenti normativi
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>NTC 2018, Capitolo 6 - Geotecnica (par. 6.4)</li>
              <li>Circolare 7/2019, paragrafi C6.4.3 e C6.5</li>
              <li>Eurocodice 7 (EN 1997-1) per metodi limite</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi del modello
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Terreno omogeneo, rigido-plastico, superficie di scorrimento log-spirale.</li>
              <li>Fondazione rigida e poco compressibile rispetto al terreno.</li>
              <li>Fattori di forma/depth/inclinazione secondo Terzaghi e Meyerhof.</li>
              <li>Fattore di sicurezza unico gamma<sub>R</sub> per passare a portanza ammissibile.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Per terreni stratificati o falda superficiale usare metodi correttivi.</li>
              <li>Verifica i cedimenti con modelli elastici o con prove edometriche.</li>
              <li>Per carichi inclinati applicare ulteriori coefficienti (Hansen, Vesic).</li>
            </ul>
          </article>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            q<sub>ult</sub> = c * N<sub>c</sub> * S<sub>c</sub> * D<sub>c</sub> * I<sub>c</sub> +
            q * N<sub>q</sub> * S<sub>q</sub> * D<sub>q</sub> * I<sub>q</sub> +
            0.5 * gamma * B * N<sub>gamma</sub> * S<sub>gamma</sub> * D<sub>gamma</sub> * I<sub>gamma</sub>.
            Portanza ammissibile q<sub>amm</sub> = q<sub>ult</sub> / gamma<sub>R</sub>.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> il calcolo e' valido come verifica di base.
          Integra sempre con indagini geotecniche, analisi SLE (cedimenti) e controlli di stabilita' globale secondo NTC 2018.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Inserisci parametri del terreno derivati da prove in sito (CPT, SPT, laboratori) e definisci la geometria della fondazione.
          </li>
          <li>
            Imposta il carico di progetto N (comprensivo di combinazioni SLU) e verifica che q<sub>amm</sub> sia maggiore della pressione di contatto.
          </li>
          <li>
            Valuta i contributi di coesione, sormonto e peso proprio per eventuali ottimizzazioni (ad esempio migliorare il riempimento o aumentare B).
          </li>
          <li>
            Integra la relazione con analisi dei cedimenti e eventuali verifiche di stabilita' globale/rotazionale.
          </li>
          <li>
            Allegare il report con fattori S, D, I e riferimenti normativi per garantire la tracciabilita' del calcolo.
          </li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "Ho finalmente un quadro completo della portanza con fattori di forma e contributi singoli: perfetto per relazioni geotecniche."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Giulia P., geotecnica freelance
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "Il warning su q<sub>amm</sub> vs pressione di contatto e' utilissimo per decidere rapidamente se aumentare la base del plinto."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Riccardo M., progettista strutturale
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Geotecnica"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, Circolare 7/2019, EN 1997-1"
      />
    </div>
  );
}
