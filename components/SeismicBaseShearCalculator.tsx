'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface SiteClass {
  name: string;
  fa: number;
  fv: number;
}

const siteClasses: Record<string, SiteClass> = {
  A: { name: 'A (roccia dura)', fa: 0.8, fv: 0.8 },
  B: { name: 'B (roccia)', fa: 1.0, fv: 1.0 },
  C: { name: 'C (depositi medi)', fa: 1.2, fv: 1.3 },
  D: { name: 'D (terreni sciolti)', fa: 1.6, fv: 2.0 },
  E: { name: 'E (terreni molto soffici)', fa: 2.5, fv: 3.5 },
};

interface CalculationResult {
  designSpectrumSa: number;
  designSpectrumSd: number;
  spectralAcceleration: number;
  behaviourFactor: number;
  baseShear: number;
  normalizedBaseShear: number;
  storeyForces: Array<{ storey: number; height: number; force: number }>;
  summary: Array<{ label: string; value: string }>;
  warnings: string[];
}

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeResult(params: {
  designPeakAccel: number;
  spectralAccel: number;
  spectralVel: number;
  site: SiteClass;
  importanceFactor: number;
  behaviourFactor: number;
  buildingHeight: number;
  fundamentalPeriod: number;
  totalSeismicMass: number;
  storeyCount: number;
}) {
  const {
    designPeakAccel,
    spectralAccel,
    spectralVel,
    site,
    importanceFactor,
    behaviourFactor,
    buildingHeight,
    fundamentalPeriod,
    totalSeismicMass,
    storeyCount,
  } = params;

  const ag = designPeakAccel;
  const fa = site.fa;
  const fv = site.fv;

  const agS = ag * includingImportance(importanceFactor);
  const beta1 = fa * spectralAccel;
  const beta2 = fv * spectralVel;

  const tc = beta2 / beta1;
  const td = (beta2 / (beta1 * 2.5));

  const period = fundamentalPeriod;

  let spectralAcceleration = 0;

  if (period <= tc) {
    spectralAcceleration = agS * (beta1 + period * beta2);
  } else if (period <= td) {
    spectralAcceleration = agS * beta2;
  } else {
    spectralAcceleration = agS * (beta2 * td / period);
  }

  const baseShear = (spectralAcceleration * totalSeismicMass) / behaviourFactor;
  const normalizedBaseShear = baseShear / totalSeismicMass;

  const storeyForces: CalculationResult['storeyForces'] = [];
  let totalWeight = 0;
  for (let i = 1; i <= storeyCount; i += 1) {
    totalWeight += totalSeismicMass / storeyCount;
  }

  let sumHeightWeight = 0;
  for (let i = 1; i <= storeyCount; i += 1) {
    const height = (buildingHeight / storeyCount) * i;
    sumHeightWeight += (totalSeismicMass / storeyCount) * height;
  }

  for (let i = 1; i <= storeyCount; i += 1) {
    const height = (buildingHeight / storeyCount) * i;
    const storeyWeight = totalSeismicMass / storeyCount;
    const storeyForce =
      baseShear * ((storeyWeight * height) / sumHeightWeight);
    storeyForces.push({
      storey: i,
      height,
      force: storeyForce,
    });
  }

  const summary: CalculationResult['summary'] = [
    { label: 'agS [g]', value: round(agS, 3).toString() },
    { label: 'Spectral acc. [g]', value: round(spectralAcceleration, 3).toString() },
    { label: 'Base shear V [kN]', value: round(baseShear, 2).toString() },
    { label: 'V/W', value: round(normalizedBaseShear, 3).toString() },
    { label: 'Period T [s]', value: round(fundamentalPeriod, 2).toString() },
    { label: 'Behaviour q', value: round(behaviourFactor, 2).toString() },
  ];

  const warnings: string[] = [];
  if (fundamentalPeriod === 0 || behaviourFactor <= 0) {
    warnings.push('Periodo fondamentale o fattore di comportamento non validi.');
  }
  if (totalSeismicMass <= 0) {
    warnings.push('La massa sismica deve essere maggiore di zero.');
  }

  return {
    designSpectrumSa: beta1,
    designSpectrumSd: beta2,
    spectralAcceleration,
    behaviourFactor,
    baseShear,
    normalizedBaseShear,
    storeyForces,
    summary,
    warnings,
  };
}

function includingImportance(gammaI: number) {
  return gammaI > 0 ? gammaI : 1;
}

export default function SeismicBaseShearCalculator() {
  const [ag, setAg] = useState('0.25');
  const [spectralAccel, setSpectralAccel] = useState('2.5');
  const [spectralVel, setSpectralVel] = useState('1.8');
  const [importanceFactor, setImportanceFactor] = useState('1.0');
  const [behaviourFactor, setBehaviourFactor] = useState('3.0');
  const [siteClass, setSiteClass] = useState('C');
  const [buildingHeight, setBuildingHeight] = useState('18');
  const [fundamentalPeriod, setFundamentalPeriod] = useState('0.6');
  const [totalSeismicMass, setTotalSeismicMass] = useState('3500');
  const [storeyCount, setStoreyCount] = useState('6');

  const result = useMemo<CalculationResult | null>(() => {
    const agVal = toNumber(ag);
    const sa = toNumber(spectralAccel);
    const sv = toNumber(spectralVel);
    const gammaI = toNumber(importanceFactor);
    const q = Math.max(1, toNumber(behaviourFactor));
    const H = toNumber(buildingHeight);
    const period = toNumber(fundamentalPeriod);
    const mass = Math.max(0, toNumber(totalSeismicMass));
    const nStorey = Math.max(1, Math.floor(toNumber(storeyCount)));
    const site = siteClasses[siteClass] ?? siteClasses.C;

    if (agVal <= 0 || mass <= 0 || H <= 0) {
      return null;
    }

    return computeResult({
      designPeakAccel: agVal,
      spectralAccel: sa,
      spectralVel: sv,
      site,
      importanceFactor: gammaI,
      behaviourFactor: q,
      buildingHeight: H,
      fundamentalPeriod: period,
      totalSeismicMass: mass,
      storeyCount: nStorey,
    });
  }, [
    ag,
    spectralAccel,
    spectralVel,
    importanceFactor,
    behaviourFactor,
    siteClass,
    buildingHeight,
    fundamentalPeriod,
    totalSeismicMass,
    storeyCount,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri di progetto
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Calcolo del taglio sismico alla base (analisi statica equivalente) secondo NTC 2018 / EN 1998-1.
          I valori sono riferiti a componenti in direzione principale X.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="ag" className="calculator-label">
                  ag (g)
                </label>
                <input
                  id="ag"
                  type="number"
                  step="0.01"
                  min="0.05"
                  value={ag}
                  onChange={(event) => setAg(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="spectralAccel" className="calculator-label">
                  F0 (plateau)
                </label>
                <input
                  id="spectralAccel"
                  type="number"
                  step="0.1"
                  min="1.5"
                  value={spectralAccel}
                  onChange={(event) => setSpectralAccel(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="spectralVel" className="calculator-label">
                  TC*F0
                </label>
                <input
                  id="spectralVel"
                  type="number"
                  step="0.1"
                  min="1.0"
                  value={spectralVel}
                  onChange={(event) => setSpectralVel(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="importanceFactor" className="calculator-label">
                  gamma I
                </label>
                <input
                  id="importanceFactor"
                  type="number"
                  step="0.05"
                  min="1.0"
                  value={importanceFactor}
                  onChange={(event) => setImportanceFactor(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="behaviourFactor" className="calculator-label">
                  q (comportamento)
                </label>
                <input
                  id="behaviourFactor"
                  type="number"
                  step="0.1"
                  min="1"
                  value={behaviourFactor}
                  onChange={(event) => setBehaviourFactor(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="siteClass" className="calculator-label">
                  Classe di sito
                </label>
                <select
                  id="siteClass"
                  value={siteClass}
                  onChange={(event) => setSiteClass(event.target.value)}
                  className="calculator-input"
                >
                  {Object.keys(siteClasses).map((key) => (
                    <option key={key} value={key}>
                      {siteClasses[key].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="buildingHeight" className="calculator-label">
                  Altezza edificio H (m)
                </label>
                <input
                  id="buildingHeight"
                  type="number"
                  step="0.5"
                  min="3"
                  value={buildingHeight}
                  onChange={(event) => setBuildingHeight(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="fundamentalPeriod" className="calculator-label">
                  Periodo T (s)
                </label>
                <input
                  id="fundamentalPeriod"
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={fundamentalPeriod}
                  onChange={(event) => setFundamentalPeriod(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="totalSeismicMass" className="calculator-label">
                  Massa sismica totale (kN*g)
                </label>
                <input
                  id="totalSeismicMass"
                  type="number"
                  step="50"
                  min="100"
                  value={totalSeismicMass}
                  onChange={(event) => setTotalSeismicMass(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="storeyCount" className="calculator-label">
                  Numero piani
                </label>
                <input
                  id="storeyCount"
                  type="number"
                  step="1"
                  min="1"
                  value={storeyCount}
                  onChange={(event) => setStoreyCount(event.target.value)}
                  className="calculator-input"
                />
              </div>
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
            Verifica ag, massa sismica e altezza edificio. Tutti i valori devono essere maggiori di zero.
          </p>
        </section>
      )}

      {result && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Taglio alla base
            </h2>
            <p className="text-sm text-gray-600">
              Calcolo basato su spettro elastico ridotto e fattore di comportamento q.
              Le forze ai singoli piani sono ripartite proporzionalmente a massa e quota.
            </p>
          </header>

          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Base shear V
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.baseShear, 2)} kN
              </p>
              <p className="text-sm text-gray-600">
                V/W = {round(result.normalizedBaseShear, 3)}
              </p>
            </div>

            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Spettro di progetto
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.spectralAcceleration, 3)} g
              </p>
              <p className="text-sm text-gray-600">
                F0 = {round(result.designSpectrumSa, 2)}; TC*F0 = {round(result.designSpectrumSd, 2)}
              </p>
            </div>

            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Periodo fondamentale
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {fundamentalPeriod} s
              </p>
              <p className="text-sm text-gray-600">
                Fattore q = {behaviourFactor}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Piano
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Quota [m]
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Forza sismica [kN]
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.storeyForces.map((storey) => (
                  <tr key={storey.storey}>
                    <td className="px-4 py-2 text-gray-700">{storey.storey}</td>
                    <td className="px-4 py-2 text-gray-700">{round(storey.height, 2)}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {round(storey.force, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <strong>Nota operativa:</strong> confronta il taglio calcolato con quello derivante dal modello FEM.
            In caso di riduzione q importante, verifica le armature o i dettagli dissipativi nelle zone critiche.
          </div>
        </section>
      )}

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme, ipotesi e formule
        </h2>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="text-base font-semibold text-blue-900">
              Riferimenti normativi
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>NTC 2018, Capitolo 7.3 (analisi statica equivalente)</li>
              <li>Circolare 7/2019, paragrafi C7.3 e C7.3.3</li>
              <li>Eurocodice 8 EN 1998-1</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi di calcolo
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Struttura regolare in pianta e in altezza (criteri NTC 7.2.3).</li>
              <li>Distribuzione forze proporzionale a masse e quote.</li>
              <li>Spettro elastico ridotto tramite q e gamma I.</li>
              <li>Assenza di eccentricita accidentali e torsione.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Per edifici irregolari utilizzare analisi dinamica (spettro o time-history).</li>
              <li>Aggiornare il periodo T con modelli FEM o formule normative.</li>
              <li>Integrare con controlli di spostamenti e duttilita.</li>
            </ul>
          </article>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            S<sub>d</sub>(T) = ag * gamma I * [F0 * (1 + T / TC) per T &lt;= TC, F0*TC / T per T &gt; TD].
            Base shear: V = S<sub>d</sub>(T) * m / q.
            Ripartizione: F<sub>i</sub> = V * (w<sub>i</sub> * h<sub>i</sub>) / sum(w<sub>k</sub> * h<sub>k</sub>).
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> il calcolo supporta la progettazione preliminare.
          Richiede integrazione con analisi dinamiche, verifiche di duttilita e controlli di spostamento secondo NTC 2018.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Ricava ag, F0 e TC dalla mappa NTC o dal portale INGV.</li>
          <li>Imposta classe di sito, fattore d'importanza e valore di q coerente con il sistema resistente.</li>
          <li>Stima il periodo T (metodo semplificato o modello FEM) e la massa sismica totale.</li>
          <li>Calcola V e ripartisci le forze ai piani; confronta con il modello numerico.</li>
          <li>Integra con verifiche di drift, taglio di piano e resistenza degli elementi secondari.</li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "In pochi secondi posso verificare il taglio di base richiesto dalle NTC e calibrare il mio modello FEM."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Alessio R., progettista strutturale
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "La sezione con norme e formule mi permette di allegare subito il report al fascicolo digitale."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Federica V., consulente sismica
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Strutture"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, Circolare 7/2019, EN 1998-1"
      />
    </div>
  );
}

