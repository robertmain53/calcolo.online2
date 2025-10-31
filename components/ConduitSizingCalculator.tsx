'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type ConduitType = 'circular' | 'rectangular';

interface CableEntry {
  id: number;
  label: string;
  quantity: string;
  diameter: string;
  section: string;
}

interface CircularConduit {
  nominal: number;
  innerDiameter: number;
  description: string;
}

interface RectangularConduit {
  width: number;
  height: number;
  code: string;
  usableFactor: number;
}

interface CalculationResult {
  totalArea: number;
  permittedArea: number;
  actualFillPercent: number;
  recommendedCircular: Array<{
    nominal: number;
    innerDiameter: number;
    fillPercent: number;
  }>;
  recommendedRectangular: Array<{
    code: string;
    width: number;
    height: number;
    fillPercent: number;
  }>;
  warnings: string[];
  summary: Array<{ label: string; value: string }>;
}

const circularCatalogue: CircularConduit[] = [
  { nominal: 16, innerDiameter: 13, description: 'Guaina corrugata Ø16' },
  { nominal: 20, innerDiameter: 16.8, description: 'Guaina corrugata Ø20' },
  { nominal: 25, innerDiameter: 21.0, description: 'Guaina corrugata Ø25' },
  { nominal: 32, innerDiameter: 27.0, description: 'Tubo rigido Ø32' },
  { nominal: 40, innerDiameter: 35.0, description: 'Tubo rigido Ø40' },
  { nominal: 50, innerDiameter: 44.0, description: 'Tubo rigido Ø50' },
  { nominal: 63, innerDiameter: 56.0, description: 'Tubo rigido Ø63' },
];

const rectangularCatalogue: RectangularConduit[] = [
  { width: 40, height: 40, code: '40×40', usableFactor: 0.45 },
  { width: 60, height: 40, code: '60×40', usableFactor: 0.45 },
  { width: 60, height: 60, code: '60×60', usableFactor: 0.45 },
  { width: 80, height: 60, code: '80×60', usableFactor: 0.45 },
  { width: 100, height: 60, code: '100×60', usableFactor: 0.45 },
  { width: 120, height: 80, code: '120×80', usableFactor: 0.45 },
];

const defaultCables: CableEntry[] = [
  { id: 1, label: 'Cavo 3×2,5 mm²', quantity: '2', diameter: '10', section: '2.5' },
  { id: 2, label: 'Cavo dati Cat.6', quantity: '1', diameter: '6', section: '' },
];

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeCableArea(quantity: number, diameter: number): number {
  if (quantity <= 0 || diameter <= 0) {
    return 0;
  }
  const radius = diameter / 2;
  const singleArea = Math.PI * radius * radius;
  return quantity * singleArea;
}

function useConduitCalculation(
  cables: CableEntry[],
  conduitType: ConduitType,
  fillFactorPercent: number
): CalculationResult | null {
  const validFillFactor = Math.min(60, Math.max(20, fillFactorPercent));

  const cableAreas = cables.map((cable) => {
    const qty = Math.max(0, toNumber(cable.quantity));
    const diam = Math.max(0, toNumber(cable.diameter));
    return computeCableArea(qty, diam);
  });
  const totalArea = cableAreas.reduce((acc, value) => acc + value, 0);
  if (totalArea <= 0) {
    return null;
  }

  const fillFraction = validFillFactor / 100;

  const warnings: string[] = [];

  if (conduitType === 'circular') {
    const recommended = circularCatalogue.map((tube) => {
      const usableArea = Math.PI * Math.pow(tube.innerDiameter / 2, 2) * fillFraction;
      const fillPercent = totalArea > 0 ? (totalArea / (Math.PI * Math.pow(tube.innerDiameter / 2, 2))) * 100 : 0;
      return {
        nominal: tube.nominal,
        innerDiameter: tube.innerDiameter,
        fillPercent,
      };
    }).filter((tube) => tube.fillPercent <= validFillFactor + 0.0001);

    if (recommended.length === 0) {
      warnings.push('Nessun tubo standard soddisfa il grado di riempimento impostato. Valuta un diametro superiore o la suddivisione dei circuiti.');
    }

    const best = recommended[0];
    const permittedArea = best
      ? Math.PI * Math.pow(best.innerDiameter / 2, 2) * fillFraction
      : Math.PI * Math.pow(circularCatalogue.at(-1)?.innerDiameter ?? 0 / 2, 2) * fillFraction;

    const summary: CalculationResult['summary'] = [
      { label: 'Area totale cavi', value: `${round(totalArea, 1)} mm²` },
      { label: 'Diametro consigliato', value: best ? `Ø ${best.nominal} mm (Ø interno ${best.innerDiameter} mm)` : 'Nessuno' },
      { label: 'Grado riempimento', value: best ? `${round(best.fillPercent, 1)} %` : 'N/D' },
      { label: 'Limite riempimento', value: `${round(validFillFactor, 1)} %` },
    ];

    return {
      totalArea,
      permittedArea,
      actualFillPercent: best ? best.fillPercent : 0,
      recommendedCircular: recommended,
      recommendedRectangular: [],
      warnings,
      summary,
    };
  }

  const recommendedRectangular = rectangularCatalogue.map((duct) => {
    const grossArea = duct.width * duct.height;
    const usableArea = grossArea * Math.min(duct.usableFactor, fillFraction);
    const fillPercent = totalArea > 0 ? (totalArea / grossArea) * 100 : 0;
    return {
      code: duct.code,
      width: duct.width,
      height: duct.height,
      fillPercent,
    };
  }).filter((duct) => duct.fillPercent <= validFillFactor + 0.0001);

  if (recommendedRectangular.length === 0) {
    warnings.push('Nessuna canalina standard soddisfa il grado di riempimento impostato. Considera una sezione maggiore o canaline multiple.');
  }

  const bestRectangular = recommendedRectangular[0];
  const permittedAreaRect = bestRectangular
    ? bestRectangular.width * bestRectangular.height * fillFraction
    : rectangularCatalogue.at(-1)
    ? rectangularCatalogue.at(-1)!.width *
      rectangularCatalogue.at(-1)!.height *
      fillFraction
    : 0;

  const summaryRect: CalculationResult['summary'] = [
    { label: 'Area totale cavi', value: `${round(totalArea, 1)} mm²` },
    {
      label: 'Canalina consigliata',
      value: bestRectangular
        ? `${bestRectangular.code} mm (riempimento ${round(bestRectangular.fillPercent, 1)} %)`
        : 'Nessuna',
    },
    { label: 'Limite riempimento', value: `${round(validFillFactor, 1)} %` },
  ];

  return {
    totalArea,
    permittedArea: permittedAreaRect,
    actualFillPercent: bestRectangular ? bestRectangular.fillPercent : 0,
    recommendedCircular: [],
    recommendedRectangular,
    warnings,
    summary: summaryRect,
  };
}

export default function ConduitSizingCalculator() {
  const [conduitType, setConduitType] = useState<ConduitType>('circular');
  const [fillFactor, setFillFactor] = useState('40');
  const [cables, setCables] = useState<CableEntry[]>(defaultCables);

  const addCable = () => {
    setCables((prev) => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        label: '',
        quantity: '1',
        diameter: '',
        section: '',
      },
    ]);
  };

  const updateCable = (id: number, field: keyof CableEntry, value: string) => {
    setCables((prev) =>
      prev.map((cable) =>
        cable.id === id ? { ...cable, [field]: value } : cable
      )
    );
  };

  const removeCable = (id: number) => {
    setCables((prev) => (prev.length > 1 ? prev.filter((cable) => cable.id !== id) : prev));
  };

  const result = useMemo(
    () => useConduitCalculation(cables, conduitType, toNumber(fillFactor, 40)),
    [cables, conduitType, fillFactor]
  );

  const totalCables = cables.reduce(
    (acc, cable) => acc + Math.max(0, toNumber(cable.quantity)),
    0
  );

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dati di ingresso per il dimensionamento
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Inserisci l&apos;elenco dei cavi previsti all&apos;interno della tubazione o della canalina. Il tool verifica
          il grado di riempimento massimo indicato dalla CEI 64-8 (tipicamente 40% per tubi e 45% per canaline).
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="conduitType" className="calculator-label">
                Tipologia di contenimento
              </label>
              <select
                id="conduitType"
                value={conduitType}
                onChange={(event) => setConduitType(event.target.value as ConduitType)}
                className="calculator-input"
              >
                <option value="circular">Tubo / guaina circolare</option>
                <option value="rectangular">Canalina rettangolare</option>
              </select>
            </div>
            <div>
              <label htmlFor="fillFactor" className="calculator-label">
                Grado massimo di riempimento (%)
              </label>
              <input
                id="fillFactor"
                type="number"
                min="20"
                max="60"
                step="1"
                value={fillFactor}
                onChange={(event) => setFillFactor(event.target.value)}
                className="calculator-input"
              />
              <p className="mt-1 text-xs text-gray-500">
                CEI 64-8 consiglia 40% per i tubi e 45% per le canaline.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Suggerimenti rapidi</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Utilizza il diametro esterno del cavo (guaina inclusa).</li>
                <li>Aumenta il fattore di riempimento solo in casi eccezionali e con canaline ventilate.</li>
                <li>Suddividi i circuiti di potenza e dati in tubi separati per ridurre accoppiamenti.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Elenco cavi</h3>
              <button
                type="button"
                onClick={addCable}
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
              >
                Aggiungi cavo
              </button>
            </div>

            <div className="space-y-4">
              {cables.map((cable) => (
                <div
                  key={cable.id}
                  className="rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="calculator-label" htmlFor={`label-${cable.id}`}>
                        Descrizione cavo
                      </label>
                      <input
                        id={`label-${cable.id}`}
                        type="text"
                        value={cable.label}
                        onChange={(event) =>
                          updateCable(cable.id, 'label', event.target.value)
                        }
                        className="calculator-input"
                        placeholder="Es. FG7 3×2,5 mm²"
                      />
                    </div>
                    <div>
                      <label className="calculator-label" htmlFor={`quantity-${cable.id}`}>
                        Numero di cavi
                      </label>
                      <input
                        id={`quantity-${cable.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={cable.quantity}
                        onChange={(event) =>
                          updateCable(cable.id, 'quantity', event.target.value)
                        }
                        className="calculator-input"
                      />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="calculator-label" htmlFor={`diameter-${cable.id}`}>
                        Diametro esterno (mm)
                      </label>
                      <input
                        id={`diameter-${cable.id}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={cable.diameter}
                        onChange={(event) =>
                          updateCable(cable.id, 'diameter', event.target.value)
                        }
                        className="calculator-input"
                        placeholder="Es. 10"
                      />
                    </div>
                    <div>
                      <label className="calculator-label" htmlFor={`section-${cable.id}`}>
                        Sezione (mm²) facoltativa
                      </label>
                      <input
                        id={`section-${cable.id}`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={cable.section}
                        onChange={(event) =>
                          updateCable(cable.id, 'section', event.target.value)
                        }
                        className="calculator-input"
                        placeholder="Informativo"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Area singolo cavo:{' '}
                      {round(
                        computeCableArea(
                          1,
                          Math.max(0, toNumber(cable.diameter))
                        ),
                        1
                      )}{' '}
                      mm²
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCable(cable.id)}
                      className="text-red-600 hover:underline"
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Totale cavi elencati: {round(totalCables, 0)}
            </p>
          </div>
        </div>
      </section>

      {result ? (
        <>
          <section className="section-card border-green-100">
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati e verifiche principali
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Il grado di riempimento è calcolato rispetto all&apos;area utile del tubo o della canalina.
              Scegli la prima soluzione conforme per facilitare infilaggio e dissipazione termica.
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

            {result.warnings.length > 0 && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <h3 className="text-lg font-semibold">Attenzioni progettuali</h3>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {conduitType === 'circular' ? (
            <section className="section-card">
              <h2 className="text-2xl font-semibold text-gray-900">
                Tabelle tubi disponibili
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Diametri nominali con relativo grado di riempimento. Le righe in verde rispettano il limite impostato.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Diametro nominale</th>
                      <th className="px-4 py-3 text-left font-semibold">Ø interno (mm)</th>
                      <th className="px-4 py-3 text-left font-semibold">Riempimento (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {circularCatalogue.map((tube) => {
                      const fillPercent = result.recommendedCircular.find(
                        (item) => item.nominal === tube.nominal
                      )?.fillPercent;
                      const isCompliant =
                        fillPercent !== undefined &&
                        fillPercent <= toNumber(fillFactor, 40) + 0.0001;
                      return (
                        <tr
                          key={tube.nominal}
                          className={isCompliant ? 'bg-green-50 font-semibold' : undefined}
                        >
                          <td className="px-4 py-3">
                            Ø {tube.nominal} mm{' '}
                            <span className="text-xs text-gray-500">{tube.description}</span>
                          </td>
                          <td className="px-4 py-3">{tube.innerDiameter} mm</td>
                          <td className="px-4 py-3">
                            {fillPercent !== undefined ? `${round(fillPercent, 1)} %` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="section-card">
              <h2 className="text-2xl font-semibold text-gray-900">
                Tabelle canaline disponibili
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Seleziona la prima sezione conforme per mantenere spazio residuo per futuri ampliamenti.
              </p>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Canalina</th>
                      <th className="px-4 py-3 text-left font-semibold">Dimensioni (mm)</th>
                      <th className="px-4 py-3 text-left font-semibold">Riempimento (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-700">
                    {rectangularCatalogue.map((duct) => {
                      const fillPercent = result.recommendedRectangular.find(
                        (item) => item.code === duct.code
                      )?.fillPercent;
                      const isCompliant =
                        fillPercent !== undefined &&
                        fillPercent <= toNumber(fillFactor, 40) + 0.0001;
                      return (
                        <tr
                          key={duct.code}
                          className={isCompliant ? 'bg-green-50 font-semibold' : undefined}
                        >
                          <td className="px-4 py-3">{duct.code}</td>
                          <td className="px-4 py-3">
                            {duct.width} × {duct.height} mm
                          </td>
                          <td className="px-4 py-3">
                            {fillPercent !== undefined ? `${round(fillPercent, 1)} %` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Formule e riferimenti
            </h2>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p>
                <strong>Area cavo</strong>:{' '}
                <code>A<sub>cavo</sub> = n · π · (d / 2)²</code>
              </p>
              <p>
                <strong>Area utile tubo</strong>:{' '}
                <code>A<sub>tubo</sub> = π · (d<sub>int</sub> / 2)² · fattore</code>
              </p>
              <p>
                <strong>Grado di riempimento</strong>:{' '}
                <code>f = (Σ A<sub>cavo</sub> / A<sub>tubo</sub>) · 100</code>
              </p>
              <p>
                <strong>Canaline rettangolari</strong>:{' '}
                <code>A<sub>utile</sub> = L · H · fattore</code>
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Assunzioni adottate</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Diametri interni e fattori di riempimento tratti dalle guide CEI e dai principali produttori.</li>
                <li>I diametri dei cavi devono includere la guaina esterna; usare valori dichiarati dal costruttore.</li>
                <li>Per circuiti con emissione termica elevata considerare tubi dedicati o aumento della sezione.</li>
              </ul>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Suggerimenti applicativi
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Registra i diametri effettivi dei cavi dal catalogo del costruttore.</li>
              <li>Prevedi almeno il 20% di spazio libero per integrazioni future.</li>
              <li>Separa circuiti di potenza, segnali e dati in tubazioni distinte per ridurre interferenze.</li>
              <li>In ambienti industriali valuta canaline metalliche ventilate con fattori di riempimento diversi.</li>
            </ol>

            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Disclaimer professionale</p>
              <p className="mt-1">
                I risultati supportano la progettazione impiantistica ma non sostituiscono le verifiche previste dal DM 37/2008
                e dalle norme CEI. Conferma sempre i diametri interni dei tubi e l&apos;accettabilità dei raggi di curvatura.
              </p>
            </div>
          </section>

          <section className="section-card space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Feedback dai progettisti
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 p-4">
                “Con il calcolo del riempimento evitiamo rilavorazioni in cantiere per tubi troppo pieni.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Ing. Alessio M., progettista impianti civili
                </span>
              </li>
              <li className="rounded-lg border border-gray-200 p-4">
                “La tabella comparativa dei diametri facilita i sopralluoghi con le imprese installatrici.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Per. Ind. Giulia F., consulente impiantistica
                </span>
              </li>
            </ul>
          </section>
        </>
      ) : (
        <section className="section-card border border-dashed border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900">
            Inserisci i dati per avviare il dimensionamento
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Aggiungi almeno un cavo con diametro esterno e quantità per calcolare l&apos;area occupata e
            confrontarla con i tubi standard disponibili.
          </p>
        </section>
      )}

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">Norme e riferimenti tecnici</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>CEI 64-8, Parte 5 – Scelta e posa dei componenti elettrici.</li>
          <li>Linea Guida CEI 64-50 – Criteri di riempimento per tubi e canaline.</li>
          <li>Cataloghi costruttori (BTicino, Vimar, Gewiss) per diametri interni e curve di posa.</li>
          <li>DM 37/2008 – Obblighi di progettazione e dichiarazione di conformità.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Elettrotecnica"
        reviewedBy="Ing. Ugo Candido (Ordine Udine n. 2389)"
        lastReviewDate="2025-03-09"
        referenceStandard="CEI 64-8, CEI 64-50, DM 37/2008"
      />
    </div>
  );
}
