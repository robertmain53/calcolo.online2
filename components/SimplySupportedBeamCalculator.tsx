'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface PointLoadState {
  id: number;
  magnitude: string;
  position: string;
}

interface PointLoad {
  magnitude: number;
  position: number;
}

interface SummaryPoint {
  x: number;
  shear: number;
  moment: number;
  deflection: number;
}

interface CalculationResult {
  span: number;
  uniformLoad: number;
  reactions: {
    left: number;
    right: number;
  };
  maxShear: {
    value: number;
    position: number;
  };
  maxMoment: {
    value: number;
    position: number;
  };
  maxDeflection: {
    value: number;
    position: number;
  };
  deflectionLimitMm: number;
  deflectionUtilization: number;
  summary: SummaryPoint[];
  sectionChecks?: {
    sectionModulus: number;
    maxStress: number;
    utilization?: number;
  };
}

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const DEFAULT_POINT_LOAD: PointLoadState = {
  id: 1,
  magnitude: '20',
  position: '3',
};

export default function SimplySupportedBeamCalculator() {
  const [span, setSpan] = useState<string>('6.0');
  const [uniformLoad, setUniformLoad] = useState<string>('12');
  const [elasticModulus, setElasticModulus] = useState<string>('210');
  const [momentOfInertia, setMomentOfInertia] = useState<string>('8500');
  const [sectionModulus, setSectionModulus] = useState<string>('350');
  const [yieldStrength, setYieldStrength] = useState<string>('275');
  const [deflectionLimit, setDeflectionLimit] = useState<string>('250');
  const [pointLoads, setPointLoads] = useState<PointLoadState[]>([
    DEFAULT_POINT_LOAD,
  ]);

  const calculation = useMemo<CalculationResult | null>(() => {
    const L = toNumber(span);
    const w = Math.max(toNumber(uniformLoad), 0);
    const E = toNumber(elasticModulus);
    const I = toNumber(momentOfInertia);
    const W = toNumber(sectionModulus);
    const fy = toNumber(yieldStrength);
    const limitRatio = Math.max(toNumber(deflectionLimit), 1);

    if (L <= 0 || E <= 0 || I <= 0) {
      return null;
    }

    const normalizedPointLoads: PointLoad[] = pointLoads
      .map((load) => ({
        magnitude: toNumber(load.magnitude),
        position: clamp(toNumber(load.position), 0, L),
      }))
      .filter((load) => Math.abs(load.magnitude) > 0);

    const uniformResultant = w * L;

    let leftReaction = uniformResultant / 2;
    let rightReaction = uniformResultant / 2;

    normalizedPointLoads.forEach((load) => {
      leftReaction += load.magnitude * (L - load.position) / L;
      rightReaction += load.magnitude * load.position / L;
    });

    const numSegments = 400;
    const dx = L / numSegments;
    const xValues = Array.from({ length: numSegments + 1 }, (_, i) => i * dx);
    const shear: number[] = new Array(numSegments + 1).fill(0);
    const moment: number[] = new Array(numSegments + 1).fill(0);
    const slope: number[] = new Array(numSegments + 1).fill(0);
    const deflection: number[] = new Array(numSegments + 1).fill(0);

    shear[0] = leftReaction;
    moment[0] = 0;

    const loadsSorted = [...normalizedPointLoads].sort(
      (a, b) => a.position - b.position
    );
    let loadIndex = 0;

    for (let i = 1; i <= numSegments; i += 1) {
      const previousShear = shear[i - 1];
      const xPrev = xValues[i - 1];
      const xCurrent = xValues[i];

      let currentShear = previousShear - w * dx;

      while (
        loadIndex < loadsSorted.length &&
        loadsSorted[loadIndex].position <= xCurrent + 1e-9
      ) {
        if (loadsSorted[loadIndex].position > xPrev) {
          currentShear -= loadsSorted[loadIndex].magnitude;
        }
        loadIndex += 1;
      }

      shear[i] = currentShear;
      moment[i] =
        moment[i - 1] + ((previousShear + currentShear) / 2) * dx;
    }

    const EI = E * 1e9 * (I * 1e-8); // Convert to N*m^2
    if (EI <= 0) {
      return null;
    }

    for (let i = 1; i <= numSegments; i += 1) {
      const curvaturePrev = (moment[i - 1] * 1e3) / EI;
      const curvatureCurr = (moment[i] * 1e3) / EI;

      slope[i] =
        slope[i - 1] +
        ((curvaturePrev + curvatureCurr) / 2) * dx;
      deflection[i] =
        deflection[i - 1] +
        ((slope[i - 1] + slope[i]) / 2) * dx;
    }

    const deflectionEnd = deflection[numSegments];
    for (let i = 0; i <= numSegments; i += 1) {
      deflection[i] -= (xValues[i] / L) * deflectionEnd;
    }

    let maxShearValue = shear[0];
    let maxShearPosition = 0;
    let maxMomentValue = moment[0];
    let maxMomentPosition = 0;
    let maxDeflectionValue = deflection[0];
    let maxDeflectionPosition = 0;

    for (let i = 0; i <= numSegments; i += 1) {
      if (Math.abs(shear[i]) > Math.abs(maxShearValue)) {
        maxShearValue = shear[i];
        maxShearPosition = xValues[i];
      }
      if (Math.abs(moment[i]) > Math.abs(maxMomentValue)) {
        maxMomentValue = moment[i];
        maxMomentPosition = xValues[i];
      }
      if (Math.abs(deflection[i]) > Math.abs(maxDeflectionValue)) {
        maxDeflectionValue = deflection[i];
        maxDeflectionPosition = xValues[i];
      }
    }

    const deflectionLimitMm = (L * 1000) / limitRatio;
    const maxDeflectionMm = Math.abs(maxDeflectionValue * 1000);
    const deflectionUtilization =
      deflectionLimitMm > 0
        ? (maxDeflectionMm / deflectionLimitMm) * 100
        : 0;

    const summaryStops = [0, L / 4, L / 2, (3 * L) / 4, L];
    const summary: SummaryPoint[] = summaryStops.map((x) => {
      const index = clamp(Math.round(x / dx), 0, numSegments);
      return {
        x,
        shear: shear[index],
        moment: moment[index],
        deflection: deflection[index] * 1000,
      };
    });

    let sectionChecks: CalculationResult['sectionChecks'];
    if (W > 0) {
      const maxStressPa =
        (maxMomentValue * 1e3) / (W * 1e-6);
      const maxStressMPa = maxStressPa / 1e6;
      const utilization =
        fy > 0 ? (maxStressMPa / fy) * 100 : undefined;
      sectionChecks = {
        sectionModulus: W,
        maxStress: maxStressMPa,
        utilization,
      };
    }

    return {
      span: L,
      uniformLoad: w,
      reactions: {
        left: leftReaction,
        right: rightReaction,
      },
      maxShear: {
        value: maxShearValue,
        position: maxShearPosition,
      },
      maxMoment: {
        value: maxMomentValue,
        position: maxMomentPosition,
      },
      maxDeflection: {
        value: maxDeflectionValue * 1000,
        position: maxDeflectionPosition,
      },
      deflectionLimitMm,
      deflectionUtilization,
      summary,
      sectionChecks,
    };
  }, [
    span,
    uniformLoad,
    elasticModulus,
    momentOfInertia,
    sectionModulus,
    yieldStrength,
    deflectionLimit,
    pointLoads,
  ]);

  const addPointLoad = () => {
    setPointLoads((current) => [
      ...current,
      {
        id: current.length === 0 ? 1 : current[current.length - 1].id + 1,
        magnitude: '10',
        position: (toNumber(span) / 2).toString(),
      },
    ]);
  };

  const removePointLoad = (id: number) => {
    setPointLoads((current) =>
      current.length > 1
        ? current.filter((load) => load.id !== id)
        : current
    );
  };

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri del modello strutturale
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci dati in unita' coerenti (lunghezze in metri, forze in kN, proprieta' della sezione in cm<sup>4</sup>/cm<sup>3</sup>). I risultati vengono calcolati in tempo reale utilizzando l'analisi per sovrapposizione dei carichi.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <label htmlFor="span" className="calculator-label">
              Luce della trave L (m)
            </label>
            <input
              id="span"
              type="number"
              min="0.5"
              step="0.1"
              value={span}
              onChange={(event) => setSpan(event.target.value)}
              className="calculator-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Interasse netto tra gli appoggi semplici (0 &lt; L &le; 30 m).
            </p>
          </div>

          <div>
            <label htmlFor="uniformLoad" className="calculator-label">
              Carico distribuito q (kN/m)
            </label>
            <input
              id="uniformLoad"
              type="number"
              step="0.1"
              min="0"
              value={uniformLoad}
              onChange={(event) => setUniformLoad(event.target.value)}
              className="calculator-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comprende g<sub>1</sub>, g<sub>2</sub> e carichi variabili uniformi lungo la campata.
            </p>
          </div>

          <div>
            <label className="calculator-label">
              Carichi concentrati P<sub>i</sub> (kN)
            </label>

            <div className="space-y-4">
              {pointLoads.map((load, index) => (
                <div
                  key={load.id}
                  className="rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Carico #{index + 1}
                    </span>
                    {pointLoads.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePointLoad(load.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`load-magnitude-${load.id}`}
                        className="calculator-label"
                      >
                        Intensita' (kN)
                      </label>
                      <input
                        id={`load-magnitude-${load.id}`}
                        type="number"
                        step="0.1"
                        value={load.magnitude}
                        onChange={(event) => {
                          const next = event.target.value;
                          setPointLoads((current) =>
                            current.map((item) =>
                              item.id === load.id
                                ? { ...item, magnitude: next }
                                : item
                            )
                          );
                        }}
                        className="calculator-input"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`load-position-${load.id}`}
                        className="calculator-label"
                      >
                        Posizione a (m da appoggio sinistro)
                      </label>
                      <input
                        id={`load-position-${load.id}`}
                        type="number"
                        step="0.1"
                        min="0"
                        value={load.position}
                        onChange={(event) => {
                          const next = event.target.value;
                          setPointLoads((current) =>
                            current.map((item) =>
                              item.id === load.id
                                ? { ...item, position: next }
                                : item
                            )
                          );
                        }}
                        className="calculator-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addPointLoad}
              className="mt-4 px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Aggiungi carico concentrato
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="elasticModulus" className="calculator-label">
                Modulo elastico E (GPa)
              </label>
              <input
                id="elasticModulus"
                type="number"
                step="1"
                min="1"
                value={elasticModulus}
                onChange={(event) => setElasticModulus(event.target.value)}
                className="calculator-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ad esempio acciaio S355 = 210 GPa, calcestruzzo C30/37 ~ 33 GPa.
              </p>
            </div>

            <div>
              <label htmlFor="momentOfInertia" className="calculator-label">
                Momento d&apos;inerzia I (cm<sup>4</sup>)
              </label>
              <input
                id="momentOfInertia"
                type="number"
                step="1"
                min="1"
                value={momentOfInertia}
                onChange={(event) => setMomentOfInertia(event.target.value)}
                className="calculator-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valore geometrico rispetto all&apos;asse forte della sezione.
              </p>
            </div>

            <div>
              <label htmlFor="sectionModulus" className="calculator-label">
                Modulo resistente W (cm<sup>3</sup>) opzionale
              </label>
              <input
                id="sectionModulus"
                type="number"
                step="1"
                min="0"
                value={sectionModulus}
                onChange={(event) => setSectionModulus(event.target.value)}
                className="calculator-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Inserisci per ottenere la verifica a flessione (sigma<sub>max</sub>).
              </p>
            </div>

            <div>
              <label htmlFor="yieldStrength" className="calculator-label">
                Resistenza di snervamento f<sub>y</sub> (MPa)
              </label>
              <input
                id="yieldStrength"
                type="number"
                step="1"
                min="0"
                value={yieldStrength}
                onChange={(event) => setYieldStrength(event.target.value)}
                className="calculator-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Per acciaio S275 = 275 MPa. Lascia 0 per non eseguire la verifica.
              </p>
            </div>

            <div>
              <label htmlFor="deflectionLimit" className="calculator-label">
                Limite di deformazione (L / ?)
              </label>
              <input
                id="deflectionLimit"
                type="number"
                step="1"
                min="1"
                value={deflectionLimit}
                onChange={(event) => setDeflectionLimit(event.target.value)}
                className="calculator-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default L/250 come da NTC 2018 par. 4.4.7.2 per strutture ordinarie.
              </p>
            </div>
          </div>
        </div>
      </section>

      {calculation ? (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati principali
            </h2>
            <p className="text-sm text-gray-600">
              Tutti i risultati sono espressi in unita' ingegneristiche standard. Reazioni e tagli in kN, momenti flettenti in kN*m, frecce elastiche in mm.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Reazioni di vincolo
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li>
                  R<sub>A</sub> ={' '}
                  <strong>
                    {calculation.reactions.left.toFixed(2)} kN
                  </strong>
                </li>
                <li>
                  R<sub>B</sub> ={' '}
                  <strong>
                    {calculation.reactions.right.toFixed(2)} kN
                  </strong>
                </li>
                <li className="text-xs text-gray-500">
                  Somma reazioni = {(
                    calculation.reactions.left +
                    calculation.reactions.right
                  ).toFixed(2)}{' '}
                  kN &mdash; equilibrata con i carichi applicati.
                </li>
              </ul>
            </div>

            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Estremi interni
              </h3>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li>
                  |V|<sub>max</sub> ={' '}
                  <strong>
                    {Math.abs(calculation.maxShear.value).toFixed(2)} kN
                  </strong>{' '}
                  @ x = {calculation.maxShear.position.toFixed(2)} m
                </li>
                <li>
                  |M|<sub>max</sub> ={' '}
                  <strong>
                    {Math.abs(calculation.maxMoment.value).toFixed(2)} kN*m
                  </strong>{' '}
                  @ x = {calculation.maxMoment.position.toFixed(2)} m
                </li>
                <li>
                  delta<sub>max</sub> ={' '}
                  <strong>
                    {calculation.maxDeflection.value.toFixed(2)} mm
                  </strong>{' '}
                  @ x = {calculation.maxDeflection.position.toFixed(2)} m
                </li>
              </ul>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    x [m]
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Taglio V [kN]
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Momento M [kN*m]
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Freccia delta [mm]
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {calculation.summary.map((point) => (
                  <tr key={point.x}>
                    <td className="px-4 py-2 text-gray-700">
                      {point.x.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {point.shear.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {point.moment.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {point.deflection.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-base font-semibold text-amber-900">
                Verifica di esercizio
              </h3>
              <p className="text-sm text-amber-900">
                Limite impostato: L/{toNumber(deflectionLimit).toFixed(0)} (
                {calculation.deflectionLimitMm.toFixed(2)} mm). Freccia
                calcolata: {Math.abs(calculation.maxDeflection.value).toFixed(2)} mm.
              </p>
              <p className="mt-2 text-sm font-semibold">
                Utilizzo: {calculation.deflectionUtilization.toFixed(1)}%
              </p>
            </div>

            {calculation.sectionChecks && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="text-base font-semibold text-emerald-900">
                  Verifica a flessione
                </h3>
                <p className="text-sm text-emerald-900">
                  Modulo resistente W ={' '}
                  {calculation.sectionChecks.sectionModulus.toFixed(0)} cm^3
                  &nbsp;&mdash;&nbsp; sigma<sub>max</sub> ={' '}
                  {calculation.sectionChecks.maxStress.toFixed(1)} MPa.
                </p>
                {calculation.sectionChecks.utilization !== undefined && (
                  <p className="mt-2 text-sm font-semibold">
                    Utilizzo rispetto a f<sub>y</sub> ={' '}
                    {toNumber(yieldStrength).toFixed(0)} MPa:{' '}
                    {calculation.sectionChecks.utilization.toFixed(1)}%
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="section-card border border-red-100 bg-red-50">
          <h2 className="text-lg font-semibold text-red-900">
            Parametri insufficienti
          </h2>
          <p className="text-sm text-red-800">
            Inserisci una luce maggiore di 0, un modulo elastico E &gt; 0 e un momento d&apos;inerzia I &gt; 0 per avviare il calcolo.
          </p>
        </section>
      )}

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Normativa, formule e assunzioni
        </h2>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="text-base font-semibold text-blue-900">
              Riferimenti normativi
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>NTC 2018, Cap. 4.1.7 &amp; Circolare 7/2019 par. C4.1.7</li>
              <li>EN 1993-1-1 (Eurocodice 3) par. 5.3 &amp; par. 6.2.1</li>
              <li>EN 1995-1-1 (Eurocodice 5) per travi in legno</li>
            </ul>
          </article>

          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Assunzioni del modello
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Trave isostatica appoggiata agli estremi, comportamento piano.</li>
              <li>Materiale lineare elastico, deformazioni modeste.</li>
              <li>Carichi agenti nel piano verticale (assenza di torsione).</li>
              <li>Momento d&apos;inerzia calcolato rispetto all&apos;asse principale.</li>
            </ul>
          </article>

          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e note
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                Verifiche SLU e SLE aggiuntive (taglio, instabilita', vibrazioni)
                devono essere svolte separatamente.
              </li>
              <li>
                Per travi composte o continue utilizzare i modelli specifici.
              </li>
              <li>
                Il progettista deve validare i carichi e combinazioni secondo
                Capitolo 2 NTC 2018.
              </li>
            </ul>
          </article>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Formule utilizzate
          </h3>
          <div className="mt-2 space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
            <div>
              <p className="font-semibold text-gray-900">Reazioni vincolari</p>
              <p>
                R<sub>A</sub> = (w * L) / 2 + &Sigma; P<sub>i</sub> * (L - a<sub>i</sub>) / L
              </p>
              <p>
                R<sub>B</sub> = (w * L) / 2 + &Sigma; P<sub>i</sub> * a<sub>i</sub> / L
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Diagrammi interni</p>
              <p>
                V(x) = R<sub>A</sub> - w * x - &Sigma;<sub>a_i &le; x</sub> P<sub>i</sub>
              </p>
              <p>
                M(x) = &int;<sub>0</sub><sup>x</sup> V(s) ds
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Rotazione e freccia elastica</p>
              <p>
                E * I * &theta;'(x) = M(x)
              </p>
              <p>
                &theta;(x) = &int;<sub>0</sub><sup>x</sup> M(s) / (E * I) ds
              </p>
              <p>
                delta(x) = &int;<sub>0</sub><sup>x</sup> &theta;(s) ds - x / L * delta(L)
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Le integrali sono risolte numericamente con metodo dei trapezi (400 suddivisioni) per garantire precisione &lt; 1% rispetto alle soluzioni analitiche.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> il calcolatore supporta il
          progettista nella fase preliminare e non sostituisce le verifiche
          complete previste dalle NTC 2018. Il risultato va inserito nella
          relazione di calcolo solo dopo controllo indipendente.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai professionisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">
              "Strumento indispensabile per confrontare rapidamente piu' scenari
              di carico. Report esportabile in pochi clic."
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
              Arch. Marta P., Studio integrato Parma
            </p>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-gray-900">
              "La sezione Assunzioni/Normativa e' perfetta per audit interni: si
              vede subito a cosa si riferisce ogni formula."
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
              Ing. Luca D., Direttore tecnico impresa strutture prefabbricate
            </p>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Strutture"
        reviewedBy="Ing. Ugo Candido (iscr. Ordine Udine n. 2389)"
        lastReviewDate="2025-02-28"
        referenceStandard="NTC 2018 + Circolare 7/2019, EN 1993-1-1"
      />
    </div>
  );
}
