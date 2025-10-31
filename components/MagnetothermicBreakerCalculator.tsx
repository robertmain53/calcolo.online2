'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SystemType = 'singlephase' | 'threephase';
type ConductorMaterial = 'copper' | 'aluminum';
type InstallationMethod = 'B1' | 'B2' | 'C' | 'E';
type CurveType = 'B' | 'C' | 'D';

interface CalculationResult {
  designCurrent: number;
  cableCapacity: number;
  correctionFactor: number;
  adjustedCableCapacity: number;
  breakerRating: number | null;
  nextBreakerRating: number;
  compliant: boolean;
  thermalCheckOk: boolean;
  magneticCheckStatus: 'ok' | 'low' | 'high';
  notes: string[];
  summary: Array<{ label: string; value: string }>;
  alternativeBreakers: Array<{
    rating: number;
    compliant: boolean;
    thermalCheckOk: boolean;
    magneticCheckStatus: 'ok' | 'low' | 'high';
  }>;
}

const installationTable: Record<InstallationMethod, number> = {
  B1: 0.78,
  B2: 0.87,
  C: 1,
  E: 1.04,
};

const sectionAmpacity: Array<{
  section: number;
  copper: number;
  aluminum: number;
}> = [
  { section: 1.5, copper: 16, aluminum: 12 },
  { section: 2.5, copper: 22, aluminum: 17 },
  { section: 4, copper: 29, aluminum: 23 },
  { section: 6, copper: 36, aluminum: 30 },
  { section: 10, copper: 50, aluminum: 40 },
  { section: 16, copper: 68, aluminum: 55 },
  { section: 25, copper: 89, aluminum: 72 },
  { section: 35, copper: 111, aluminum: 90 },
  { section: 50, copper: 134, aluminum: 110 },
  { section: 70, copper: 169, aluminum: 140 },
  { section: 95, copper: 202, aluminum: 170 },
  { section: 120, copper: 230, aluminum: 195 },
  { section: 150, copper: 262, aluminum: 220 },
  { section: 185, copper: 298, aluminum: 250 },
  { section: 240, copper: 345, aluminum: 290 },
];

const breakerRatings = [
  6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400,
];

const curveInstantaneous: Record<
  CurveType,
  { minMultiple: number; maxMultiple: number }
> = {
  B: { minMultiple: 3, maxMultiple: 5 },
  C: { minMultiple: 5, maxMultiple: 10 },
  D: { minMultiple: 10, maxMultiple: 20 },
};

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getCableAmpacity(
  section: number,
  material: ConductorMaterial
): number | null {
  const row = sectionAmpacity.find(
    (item) => item.section.toFixed(2) === section.toFixed(2)
  ) ?? sectionAmpacity.find((item) => Math.abs(item.section - section) < 0.01);
  if (!row) {
    return null;
  }
  return material === 'copper' ? row.copper : row.aluminum;
}

function computeResult(params: {
  system: SystemType;
  voltage: number;
  power: number;
  userCurrent: number;
  powerFactor: number;
  efficiency: number;
  cableSection: number;
  material: ConductorMaterial;
  installation: InstallationMethod;
  ambientTemperature: number;
  shortCircuitCurrent: number;
  curve: CurveType;
  simultaneousFactor: number;
}): CalculationResult | null {
  const {
    system,
    voltage,
    power,
    userCurrent,
    powerFactor,
    efficiency,
    cableSection,
    material,
    installation,
    ambientTemperature,
    shortCircuitCurrent,
    curve,
    simultaneousFactor,
  } = params;

  if (voltage <= 0 || cableSection <= 0) {
    return null;
  }

  const cosphi = Math.min(1, Math.max(0.1, powerFactor));
  const eta = Math.min(1, Math.max(0.4, efficiency));
  const diversity = Math.min(1, Math.max(0.1, simultaneousFactor));

  const designCurrentRaw =
    userCurrent > 0
      ? userCurrent
      : system === 'threephase'
      ? (power * 1000) / (Math.sqrt(3) * voltage * cosphi * eta)
      : (power * 1000) / (voltage * cosphi * eta);

  const designCurrent = designCurrentRaw * diversity;
  if (!Number.isFinite(designCurrent) || designCurrent <= 0) {
    return null;
  }

  const baseIz = getCableAmpacity(cableSection, material);
  const correction = installationTable[installation] ?? 1;
  const temperatureFactor = ambientTemperature > 40 ? 0.94 : 1;
  const cableCapacity = baseIz ?? 0;
  const adjustedCapacity = cableCapacity * correction * temperatureFactor;

  const availableRatings = breakerRatings.filter((rating) => rating >= designCurrent);
  const breakerRating = availableRatings.length > 0 ? availableRatings[0] : null;
  const nextBreakerRating =
    availableRatings.length > 1 ? availableRatings[1] : breakerRatings.at(-1) ?? 400;

  const thermalLimit = 1.45 * adjustedCapacity;
  const thermalCheckOk =
    breakerRating !== null ? 1.45 * breakerRating <= thermalLimit + 1e-6 : false;
  const compliant =
    breakerRating !== null &&
    designCurrent <= breakerRating + 1e-6 &&
    breakerRating <= adjustedCapacity + 1e-6 &&
    thermalCheckOk;

  const instantSettings = curveInstantaneous[curve];
  const ik = shortCircuitCurrent * 1000; // from kA to A
  const minTrip = breakerRating ? instantSettings.minMultiple * breakerRating : 0;
  const maxTrip = breakerRating ? instantSettings.maxMultiple * breakerRating : Infinity;
  let magneticCheckStatus: 'ok' | 'low' | 'high' = 'ok';
  if (breakerRating) {
    if (ik < minTrip) {
      magneticCheckStatus = 'low';
    } else if (ik > maxTrip) {
      magneticCheckStatus = 'high';
    }
  }

  const notes: string[] = [];
  if (!baseIz) {
    notes.push(
      'Sezione non presente in tabella CEI 64-8: inserisci la portata manualmente o scegli una sezione standard.'
    );
  }
  if (!thermalCheckOk && breakerRating) {
    notes.push(
      `Il requisito I₂ ≤ 1,45·Iz non è rispettato (1,45·${breakerRating} A > ${round(
        thermalLimit,
        1
      )} A).`
    );
  }
  if (magneticCheckStatus === 'low') {
    notes.push(
      'La corrente di corto circuito presunta è inferiore alla soglia magnetica: verifica la selezione oppure aumenta la sensibilità usando un curve B.'
    );
  }
  if (magneticCheckStatus === 'high') {
    notes.push(
      'La corrente di corto circuito supera il limite massimo della curva scelta: verifica il potere di interruzione e l’eventuale coordinamento a valle.'
    );
  }

  const alternativeBreakers = breakerRatings.map((rating) => {
    const thermalOk =
      1.45 * rating <= thermalLimit + 1e-6 && rating <= adjustedCapacity + 1e-6;
    const withinDesign = designCurrent <= rating + 1e-6;
    const minMag = instantSettings.minMultiple * rating;
    const maxMag = instantSettings.maxMultiple * rating;
    let magneticStatus: 'ok' | 'low' | 'high' = 'ok';
    if (ik < minMag) {
      magneticStatus = 'low';
    } else if (ik > maxMag) {
      magneticStatus = 'high';
    }
    return {
      rating,
      compliant: thermalOk && withinDesign,
      thermalCheckOk: thermalOk,
      magneticCheckStatus: magneticStatus,
    };
  });

  const summary: CalculationResult['summary'] = [
    { label: 'Corrente di impiego Ib', value: `${round(designCurrent, 2)} A` },
    {
      label: 'Portata cavo Iz corretta',
      value: baseIz
        ? `${round(adjustedCapacity, 2)} A (k=${round(correction, 2)})`
        : 'N/D',
    },
    {
      label: 'Interruttore selezionato In',
      value: breakerRating ? `${breakerRating} A (${curve})` : 'Nessuna taglia disponibile',
    },
    {
      label: 'Verifica I₂ ≤ 1,45·Iz',
      value: thermalCheckOk ? 'OK' : 'Non conforme',
    },
    {
      label: 'Controllo soglia magnetica',
      value:
        magneticCheckStatus === 'ok'
          ? 'OK'
          : magneticCheckStatus === 'low'
          ? 'Icc insufficiente'
          : 'Icc elevata',
    },
    {
      label: 'Fattore di contemporaneità',
      value: `${round(diversity, 2)}`,
    },
  ];

  return {
    designCurrent,
    cableCapacity: cableCapacity,
    correctionFactor: correction,
    adjustedCableCapacity: adjustedCapacity,
    breakerRating,
    nextBreakerRating,
    compliant,
    thermalCheckOk,
    magneticCheckStatus,
    notes,
    summary,
    alternativeBreakers,
  };
}

export default function MagnetothermicBreakerCalculator() {
  const [system, setSystem] = useState<SystemType>('threephase');
  const [voltage, setVoltage] = useState('400');
  const [power, setPower] = useState('45');
  const [userCurrent, setUserCurrent] = useState('0');
  const [powerFactor, setPowerFactor] = useState('0.9');
  const [efficiency, setEfficiency] = useState('0.95');
  const [simultaneousFactor, setSimultaneousFactor] = useState('1');
  const [cableSection, setCableSection] = useState('16');
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [installation, setInstallation] = useState<InstallationMethod>('C');
  const [ambientTemp, setAmbientTemp] = useState('40');
  const [shortCircuitCurrent, setShortCircuitCurrent] = useState('6');
  const [curve, setCurve] = useState<CurveType>('C');

  const result = useMemo<CalculationResult | null>(() =>
    computeResult({
      system,
      voltage: toNumber(voltage),
      power: Math.max(0, toNumber(power)),
      userCurrent: Math.max(0, toNumber(userCurrent)),
      powerFactor: toNumber(powerFactor),
      efficiency: toNumber(efficiency),
      cableSection: Math.max(0.5, toNumber(cableSection)),
      material,
      installation,
      ambientTemperature: toNumber(ambientTemp),
      shortCircuitCurrent: Math.max(0.1, toNumber(shortCircuitCurrent)),
      curve,
      simultaneousFactor: Math.max(0.1, toNumber(simultaneousFactor)),
    })
  , [
    system,
    voltage,
    power,
    userCurrent,
    powerFactor,
    efficiency,
    cableSection,
    material,
    installation,
    ambientTemp,
    shortCircuitCurrent,
    curve,
    simultaneousFactor,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri di progetto per l&apos;interruttore magnetotermico
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Dimensiona l&apos;interruttore automatico in accordo con i requisiti CEI 64-8 verificando
          il coordinamento Ib ≤ In ≤ Iz e I₂ ≤ 1,45·Iz, oltre alla soglia magnetica rispetto alla
          corrente di corto circuito presunta.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="system" className="calculator-label">
                  Sistema elettrico
                </label>
                <select
                  id="system"
                  value={system}
                  onChange={(event) => setSystem(event.target.value as SystemType)}
                  className="calculator-input"
                >
                  <option value="singlephase">Monofase</option>
                  <option value="threephase">Trifase</option>
                </select>
              </div>
              <div>
                <label htmlFor="voltage" className="calculator-label">
                  Tensione nominale (V)
                </label>
                <input
                  id="voltage"
                  type="number"
                  min="100"
                  step="10"
                  value={voltage}
                  onChange={(event) => setVoltage(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="power" className="calculator-label">
                  Potenza assorbita (kW)
                </label>
                <input
                  id="power"
                  type="number"
                  min="0"
                  step="1"
                  value={power}
                  onChange={(event) => setPower(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Imposta a 0 per inserire direttamente la corrente nominale.
                </p>
              </div>
              <div>
                <label htmlFor="userCurrent" className="calculator-label">
                  Corrente nominale (A)
                </label>
                <input
                  id="userCurrent"
                  type="number"
                  min="0"
                  step="1"
                  value={userCurrent}
                  onChange={(event) => setUserCurrent(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Se diverso da 0 il calcolo usa questo valore per Ib.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="powerFactor" className="calculator-label">
                  cos&nbsp;φ
                </label>
                <input
                  id="powerFactor"
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.01"
                  value={powerFactor}
                  onChange={(event) => setPowerFactor(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="efficiency" className="calculator-label">
                  Rendimento (η)
                </label>
                <input
                  id="efficiency"
                  type="number"
                  min="0.4"
                  max="1"
                  step="0.01"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="simultaneousFactor" className="calculator-label">
                  Fattore contemporaneità
                </label>
                <input
                  id="simultaneousFactor"
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={simultaneousFactor}
                  onChange={(event) => setSimultaneousFactor(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cableSection" className="calculator-label">
                  Sezione cavo (mm²)
                </label>
                <input
                  id="cableSection"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={cableSection}
                  onChange={(event) => setCableSection(event.target.value)}
                  list="cable-sections"
                  className="calculator-input"
                />
                <datalist id="cable-sections">
                  {sectionAmpacity.map((row) => (
                    <option key={row.section} value={row.section}>
                      {row.section}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <label htmlFor="material" className="calculator-label">
                  Materiale conduttore
                </label>
                <select
                  id="material"
                  value={material}
                  onChange={(event) => setMaterial(event.target.value as ConductorMaterial)}
                  className="calculator-input"
                >
                  <option value="copper">Rame</option>
                  <option value="aluminum">Alluminio</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="installation" className="calculator-label">
                  Metodo di posa
                </label>
                <select
                  id="installation"
                  value={installation}
                  onChange={(event) => setInstallation(event.target.value as InstallationMethod)}
                  className="calculator-input"
                >
                  <option value="B1">B1 – incassato in parete isolante</option>
                  <option value="B2">B2 – incassato parete non isolante</option>
                  <option value="C">C – posa su passerella/parete</option>
                  <option value="E">E – passerella perforata</option>
                </select>
              </div>
              <div>
                <label htmlFor="ambientTemp" className="calculator-label">
                  Temperatura ambiente (°C)
                </label>
                <input
                  id="ambientTemp"
                  type="number"
                  min="-10"
                  max="80"
                  step="1"
                  value={ambientTemp}
                  onChange={(event) => setAmbientTemp(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="shortCircuitCurrent" className="calculator-label">
                  Icc presunta (kA)
                </label>
                <input
                  id="shortCircuitCurrent"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={shortCircuitCurrent}
                  onChange={(event) => setShortCircuitCurrent(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Valore di corto circuito nel punto in esame per la verifica della soglia magnetica.
                </p>
              </div>
              <div>
                <label htmlFor="curve" className="calculator-label">
                  Curva di intervento
                </label>
                <select
                  id="curve"
                  value={curve}
                  onChange={(event) => setCurve(event.target.value as CurveType)}
                  className="calculator-input"
                >
                  <option value="B">Curva B (3–5·In)</option>
                  <option value="C">Curva C (5–10·In)</option>
                  <option value="D">Curva D (10–20·In)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <>
          <section className="section-card border-green-100">
            <h2 className="text-2xl font-semibold text-gray-900">
              Esito del dimensionamento
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Verifica immediatamente il rispetto delle condizioni normative CEI 64-8 per la scelta
              dell&apos;interruttore automatico e individua eventuali criticità da sanare.
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

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  result.compliant
                    ? 'border border-green-200 bg-green-100 text-green-800'
                    : 'border border-red-200 bg-red-100 text-red-800'
                }`}
              >
                {result.compliant
                  ? 'Coordinamento Ib ≤ In ≤ Iz conforme'
                  : 'Coordinamento da rivedere'}
              </span>
              {result.breakerRating && !result.compliant && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
                  Valuta taglia {result.nextBreakerRating} A o aumento sezione
                </span>
              )}
            </div>

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

          <section className="section-card">
            <h2 className="text-2xl font-semibold text-gray-900">
              Confronto taglie interruttore disponibili
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Analizza le principali taglie commerciali e verifica per ciascuna il rispetto dei criteri
              Ib ≤ In ≤ Iz, I₂ ≤ 1,45·Iz e soglia magnetica rispetto all&apos;Icc presunta.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Taglia In (A)</th>
                    <th className="px-4 py-3 text-left font-semibold">Ib ≤ In ≤ Iz</th>
                    <th className="px-4 py-3 text-left font-semibold">I₂ ≤ 1,45·Iz</th>
                    <th className="px-4 py-3 text-left font-semibold">Verifica magnetica</th>
                    <th className="px-4 py-3 text-left font-semibold">Esito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {result.alternativeBreakers.map((item) => (
                    <tr
                      key={item.rating}
                      className={
                        item.compliant
                          ? 'bg-green-50 font-semibold'
                          : item.thermalCheckOk
                          ? 'bg-yellow-50'
                          : undefined
                      }
                    >
                      <td className="px-4 py-3">{item.rating} A</td>
                      <td className="px-4 py-3">
                        {item.rating >= (result.designCurrent || 0) &&
                        item.rating <= result.adjustedCableCapacity + 1e-6
                          ? 'OK'
                          : 'No'}
                      </td>
                      <td className="px-4 py-3">
                        {item.thermalCheckOk ? 'OK' : 'No'}
                      </td>
                      <td className="px-4 py-3">
                        {item.magneticCheckStatus === 'ok'
                          ? 'Icc adeguata'
                          : item.magneticCheckStatus === 'low'
                          ? 'Icc insufficiente'
                          : 'Icc elevata'}
                      </td>
                      <td className="px-4 py-3">
                        {item.compliant ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                            Conforme
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                            Non conforme
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Formule e riferimenti normativi
            </h2>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p>
                <strong>Corrente di impiego</strong>:{' '}
                <code>
                  Ib ={' '}
                  {system === 'threephase'
                    ? 'P · 1000 / (√3 · V · cosφ · η)'
                    : 'P · 1000 / (V · cosφ · η)'}
                </code>
              </p>
              <p>
                <strong>Coordinamento termico</strong>:{' '}
                <code>Ib ≤ In ≤ Iz</code> e <code>I₂ ≤ 1,45 · Iz</code>
              </p>
              <p>
                <strong>Verifica magnetica</strong>:{' '}
                <code>Icc</code> deve risultare tra{' '}
                <code>{curveInstantaneous[curve].minMultiple} · In</code> e{' '}
                <code>{curveInstantaneous[curve].maxMultiple} · In</code>
              </p>
              <p>
                <strong>Fattori correttivi</strong> secondo CEI 64-8, Cap. 52 per posa, temperatura
                e contemporaneità dei carichi.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Assunzioni e limiti</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Portate cavi riferite a posa singola: applicare ulteriori coefficienti per raggruppamento.</li>
                <li>Il potere di interruzione dell&apos;interruttore deve essere verificato rispetto all&apos;Icc.</li>
                <li>Non sono considerate protezioni differenziali o selettività cronometrica.</li>
              </ul>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Suggerimenti applicativi
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Calcola Ib con il reale profilo dei carichi e applica il fattore di contemporaneità.</li>
              <li>
                Scegli l&apos;interruttore con In più vicino a Ib ma non superiore alla portata del cavo
                dopo i coefficienti correttivi.
              </li>
              <li>
                Verifica la soglia magnetica confrontando l&apos;Icc presunta con i limiti della curva B, C o D.
              </li>
              <li>Annota nel verbale tecnico i riferimenti normativi, i coefficienti adottati e i risultati.</li>
            </ol>

            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Disclaimer professionale</p>
              <p className="mt-1">
                I risultati supportano il progettista nella scelta dell&apos;interruttore ma non
                sostituiscono le verifiche previste dal DM 37/2008, dalla CEI 64-8 e dalle specifiche
                del costruttore. Effettua sempre controlli incrociati su potere di interruzione,
                selettività e condizioni reali di posa.
              </p>
            </div>
          </section>

          <section className="section-card space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Feedback da progettisti elettrici
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 p-4">
                “Il confronto simultaneo tra Ib, Iz e soglia magnetica riduce gli errori in fase di
                preventivo ed evita sovradimensionamenti.”
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Ing. Mauro P., studio impianti civili
                </span>
              </li>
              <li className="rounded-lg border border-gray-200 p-4">
                “Finalmente un tool che richiama chiaramente i vincoli CEI 64-8 e suggerisce la taglia
                successiva in automatico.”
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Per. Ind. Laura G., consulente quadri elettrici
                </span>
              </li>
            </ul>
          </section>
        </>
      ) : (
        <section className="section-card border border-dashed border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900">
            Inserisci i dati per dimensionare l&apos;interruttore
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Definisci potenza o corrente, parametri del cavo e corrente di corto circuito presunta
            per ottenere la taglia dell&apos;interruttore e le verifiche richieste dalla CEI 64-8.
          </p>
        </section>
      )}

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme e riferimenti tecnici
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>CEI 64-8 (ed. 2023) – Art. 433 e 434, scelta delle protezioni contro sovraccarico e corto circuito.</li>
          <li>Guida CEI 64-50 – Selezione dei dispositivi di protezione per impianti in bassa tensione.</li>
          <li>CEI EN 60898-1 – Interruttori automatici per uso domestico e similare.</li>
          <li>DM 37/2008 – Obblighi di progettazione e dichiarazione di conformità degli impianti elettrici.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Elettrotecnica"
        reviewedBy="Ing. Ugo Candido (Ordine Udine n. 2389)"
        lastReviewDate="2025-03-09"
        referenceStandard="CEI 64-8, CEI EN 60898-1, Guida CEI 64-50, DM 37/2008"
      />
    </div>
  );
}
