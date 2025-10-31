'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SystemType = 'singlephase' | 'threephase';
type ConductorMaterial = 'copper' | 'aluminum';

interface CalculationResult {
  transformerShortCircuitCurrent: number;
  transformerImpedance: number;
  lineResistance: number;
  lineReactance: number;
  totalImpedance: number;
  shortCircuitCurrent: number;
  shortCircuitCurrentKA: number;
  peakCurrent: number;
  i2t1s: number;
  deviceCompliant: boolean;
  summary: Array<{ label: string; value: string }>;
  lengthScenarios: Array<{
    factor: number;
    length: number;
    currentKA: number;
  }>;
  notes: string[];
}

const baseResistivity: Record<ConductorMaterial, number> = {
  copper: 0.0225, // Ω·mm²/m @20°C
  aluminum: 0.036,
};

const temperatureCoeff: Record<ConductorMaterial, number> = {
  copper: 0.00393,
  aluminum: 0.00403,
};

const xlPerMeter = 0.08e-3; // Ω/m typical inductive reactance for LV cables

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeResult(params: {
  system: SystemType;
  voltage: number;
  transformerPower: number;
  transformerImpedancePercent: number;
  cableLength: number;
  cableSection: number;
  material: ConductorMaterial;
  temperature: number;
  protectiveIcu: number;
  faultVoltagePercent: number;
}): CalculationResult | null {
  const {
    system,
    voltage,
    transformerPower,
    transformerImpedancePercent,
    cableLength,
    cableSection,
    material,
    temperature,
    protectiveIcu,
    faultVoltagePercent,
  } = params;

  if (
    voltage <= 0 ||
    transformerPower <= 0 ||
    transformerImpedancePercent <= 0 ||
    cableLength <= 0 ||
    cableSection <= 0
  ) {
    return null;
  }

  const sqrtFactor = system === 'threephase' ? Math.sqrt(3) : 1;
  const phaseVoltage =
    system === 'threephase' ? voltage / Math.sqrt(3) : voltage;
  const sVA = transformerPower * 1000;
  const baseCurrent = sVA / (sqrtFactor * voltage);
  const transformerShortCircuitCurrent =
    baseCurrent * (100 / transformerImpedancePercent);
  const transformerImpedance =
    transformerShortCircuitCurrent > 0
      ? phaseVoltage / transformerShortCircuitCurrent
      : 0;

  const rho =
    baseResistivity[material] *
    (1 + temperatureCoeff[material] * (temperature - 20));

  const conductorMultiplier = system === 'threephase' ? 1 : 2;
  const resistancePerConductor =
    (rho * cableLength) / (cableSection * 1000); // Ω
  const lineResistance = resistancePerConductor * conductorMultiplier;
  const lineReactance = xlPerMeter * cableLength * conductorMultiplier;

  const faultVoltage = phaseVoltage * (faultVoltagePercent / 100);

  const totalReactance = lineReactance + transformerImpedance;
  const totalImpedance = Math.sqrt(
    lineResistance ** 2 + totalReactance ** 2
  );

  const shortCircuitCurrent =
    totalImpedance > 0 ? faultVoltage / totalImpedance : 0;
  const shortCircuitCurrentKA = shortCircuitCurrent / 1000;
  const peakCurrent = shortCircuitCurrent * 2.5; // conservative factor
  const i2t1s = shortCircuitCurrent ** 2;
  const deviceCompliant = protectiveIcu > 0 ? shortCircuitCurrentKA <= protectiveIcu : true;

  const lengthScenarios = [0.25, 0.5, 0.75, 1].map((factor) => {
    const adjustedLength = cableLength * factor;
    const resAdj =
      (rho * adjustedLength) / (cableSection * 1000) * conductorMultiplier;
    const reactAdj = xlPerMeter * adjustedLength * conductorMultiplier;
    const zAdj = Math.sqrt(resAdj ** 2 + (reactAdj + transformerImpedance) ** 2);
    const currentAdj = zAdj > 0 ? faultVoltage / zAdj : 0;
    return {
      factor,
      length: adjustedLength,
      currentKA: currentAdj / 1000,
    };
  });

  const summary: CalculationResult['summary'] = [
    {
      label: 'Icc a monte trasformatore',
      value: `${round(transformerShortCircuitCurrent / 1000, 2)} kA`,
    },
    {
      label: 'Impedanza totale Zk',
      value: `${round(totalImpedance, 4)} Ω`,
    },
    {
      label: 'Corrente di corto circuito Ik',
      value: `${round(shortCircuitCurrentKA, 2)} kA`,
    },
    {
      label: 'Corrente di picco Ipk',
      value: `${round(peakCurrent / 1000, 2)} kA`,
    },
    {
      label: 'I²t (1 s)',
      value: `${round(i2t1s / 1e6, 2)} kA²·s`,
    },
    {
      label: 'Verifica dispositivo',
      value: protectiveIcu > 0 ? (deviceCompliant ? 'Icu adeguata' : 'Icu insufficiente') : 'N/D',
    },
  ];

  const notes: string[] = [];
  if (!deviceCompliant && protectiveIcu > 0) {
    notes.push(
      `La corrente presunta (${round(shortCircuitCurrentKA, 2)} kA) supera il potere di interruzione del dispositivo (${protectiveIcu} kA).`
    );
  }
  if (faultVoltagePercent !== 100) {
    notes.push(
      `Il calcolo utilizza una tensione di guasto pari al ${faultVoltagePercent}% della tensione nominale, come previsto dalla CEI 64-8.`
    );
  }
  if (cableLength > 100) {
    notes.push(
      'Lunghezza tratta significativa: verifica eventuali cadute addizionali o contributi di generazione locale.'
    );
  }

  return {
    transformerShortCircuitCurrent,
    transformerImpedance,
    lineResistance,
    lineReactance,
    totalImpedance,
    shortCircuitCurrent,
    shortCircuitCurrentKA,
    peakCurrent,
    i2t1s,
    deviceCompliant,
    summary,
    lengthScenarios,
    notes,
  };
}

export default function ShortCircuitCurrentCalculator() {
  const [system, setSystem] = useState<SystemType>('threephase');
  const [voltage, setVoltage] = useState('400');
  const [transformerPower, setTransformerPower] = useState('630');
  const [transformerImpedancePercent, setTransformerImpedancePercent] =
    useState('6');
  const [cableLength, setCableLength] = useState('30');
  const [cableSection, setCableSection] = useState('35');
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [temperature, setTemperature] = useState('40');
  const [protectiveIcu, setProtectiveIcu] = useState('10');
  const [faultVoltagePercent, setFaultVoltagePercent] = useState('95');

  const result = useMemo(
    () =>
      computeResult({
        system,
        voltage: toNumber(voltage),
        transformerPower: Math.max(1, toNumber(transformerPower)),
        transformerImpedancePercent: Math.max(
          0.1,
          toNumber(transformerImpedancePercent)
        ),
        cableLength: Math.max(1, toNumber(cableLength)),
        cableSection: Math.max(0.5, toNumber(cableSection)),
        material,
        temperature: toNumber(temperature),
        protectiveIcu: Math.max(0, toNumber(protectiveIcu)),
        faultVoltagePercent: Math.min(110, Math.max(80, toNumber(faultVoltagePercent))),
      }),
    [
      system,
      voltage,
      transformerPower,
      transformerImpedancePercent,
      cableLength,
      cableSection,
      material,
      temperature,
      protectiveIcu,
      faultVoltagePercent,
    ]
  );

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri di calcolo per Icc
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Inserisci i dati del trasformatore, della linea e del dispositivo di protezione per
          determinare la corrente di corto circuito presunta nel punto di installazione secondo CEI 64-8.
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
                  <option value="threephase">Trifase</option>
                  <option value="singlephase">Monofase</option>
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
                <label htmlFor="transformerPower" className="calculator-label">
                  Potenza trasformatore (kVA)
                </label>
                <input
                  id="transformerPower"
                  type="number"
                  min="1"
                  step="10"
                  value={transformerPower}
                  onChange={(event) => setTransformerPower(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="transformerImpedancePercent" className="calculator-label">
                  Impedenza trasformatore (%)
                </label>
                <input
                  id="transformerImpedancePercent"
                  type="number"
                  min="1"
                  step="0.1"
                  value={transformerImpedancePercent}
                  onChange={(event) =>
                    setTransformerImpedancePercent(event.target.value)
                  }
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="faultVoltagePercent" className="calculator-label">
                  Tensione di guasto (% Un)
                </label>
                <input
                  id="faultVoltagePercent"
                  type="number"
                  min="80"
                  max="110"
                  step="1"
                  value={faultVoltagePercent}
                  onChange={(event) => setFaultVoltagePercent(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="protectiveIcu" className="calculator-label">
                  Potere d&apos;interruzione dispositivo (kA)
                </label>
                <input
                  id="protectiveIcu"
                  type="number"
                  min="0"
                  step="1"
                  value={protectiveIcu}
                  onChange={(event) => setProtectiveIcu(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Imposta 0 se non vuoi eseguire la verifica sul dispositivo.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cableLength" className="calculator-label">
                  Lunghezza linea (m)
                </label>
                <input
                  id="cableLength"
                  type="number"
                  min="1"
                  step="1"
                  value={cableLength}
                  onChange={(event) => setCableLength(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="cableSection" className="calculator-label">
                  Sezione conduttore (mm²)
                </label>
                <input
                  id="cableSection"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={cableSection}
                  onChange={(event) => setCableSection(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
              <div>
                <label htmlFor="temperature" className="calculator-label">
                  Temperatura conduttore (°C)
                </label>
                <input
                  id="temperature"
                  type="number"
                  min="-10"
                  max="90"
                  step="1"
                  value={temperature}
                  onChange={(event) => setTemperature(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <>
          <section className="section-card border-green-100">
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati principali
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Analizza la corrente di corto circuito presunta, il picco e l&apos;energia termica per
              verificare l&apos;adeguatezza delle protezioni e dei componenti lungo la linea.
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
              <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
                Z linea = {round(result.lineResistance, 4)} Ω + j{round(result.lineReactance, 4)} Ω
              </span>
              {!result.deviceCompliant && toNumber(protectiveIcu) > 0 && (
                <span className="rounded-full border border-red-200 bg-red-100 px-4 py-2 text-sm font-semibold text-red-800">
                  Potere d&apos;interruzione insufficiente: selezionare un dispositivo con Icu ≥{' '}
                  {round(result.shortCircuitCurrentKA, 2)} kA
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
              Scenario corrente vs lunghezza della tratta
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Valuta come la corrente di corto circuito varia con la lunghezza del cavo per ottimizzare
              la protezione in dorsali e montanti.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Frazione lunghezza</th>
                    <th className="px-4 py-3 text-left font-semibold">L (m)</th>
                    <th className="px-4 py-3 text-left font-semibold">Ik presunta (kA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {result.lengthScenarios.map((item) => (
                    <tr
                      key={item.factor}
                      className={
                        item.factor === 1
                          ? 'bg-green-50 font-semibold'
                          : undefined
                      }
                    >
                      <td className="px-4 py-3">
                        {item.factor === 1 ? '100% (punto in esame)' : `${item.factor * 100}%`}
                      </td>
                      <td className="px-4 py-3">{round(item.length, 1)} m</td>
                      <td className="px-4 py-3">{round(item.currentKA, 2)} kA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Formule e riferimenti utilizzati
            </h2>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p>
                <strong>Corrente di cortocircuito a monte</strong>:{' '}
                <code>IkT = (S&nbsp;· 1000) / (k · V) · (100 / Z %)</code> con k = √3 (trifase) o 1 (monofase).
              </p>
              <p>
                <strong>Resistività linea</strong>:{' '}
                <code>R = ρ(T) · L / (S · 1000)</code> con ρ(T) = ρ<sub>20</sub>[1 + α (T − 20)].
              </p>
              <p>
                <strong>Corrente presunta</strong>:{' '}
                <code>Ik = U<sub>f</sub> / √(R² + (X + X<sub>T</sub>)²)</code> con U<sub>f</sub> = U · k<sub>f</sub>.
              </p>
              <p>
                <strong>Picco</strong>:{' '}
                <code>Ipk ≈ 2.5 · Ik</code> (fattore conservativo CEI 60909 per impianti BT).
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Assunzioni e limiti</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Trasformatore considerato come unica sorgente con impedenza prevalentemente induttiva.</li>
                <li>Contributi di motori o generatori locali non inclusi: aggiungerli come sorgenti equivalenti.</li>
                <li>Per linee molto lunghe valutare impedenza reattiva specifica del costruttore.</li>
              </ul>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Suggerimenti operativi
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Recupera da scheda del trasformatore potenza nominale e impedenza percentuale.</li>
              <li>Calcola Ik al punto più distante e confronta il valore con il potere d&apos;interruzione del dispositivo.</li>
              <li>Riporta nel verbale i parametri di linea e i risultati (Ik, Ipk, I²t) per la dichiarazione di conformità.</li>
              <li>Per linee a monte del quadro generale esegui una seconda verifica con Un ridotta al 80–90% come richiesto da CEI 64-8.</li>
            </ol>

            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Disclaimer professionale</p>
              <p className="mt-1">
                Il calcolo supporta la progettazione di impianti elettrici ma non sostituisce le verifiche
                previste dal DM 37/2008, dalle norme CEI 64-8 e CEI 60909, né le prove strumentali in opera.
                Utilizza sempre schede tecniche aggiornate e considera il contributo di generatori locali.
              </p>
            </div>
          </section>

          <section className="section-card space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Feedback da studi di progettazione
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 p-4">
                “Avere simultaneamente Ik, Ipk e I²t velocizza il confronto con gli interruttori MCCB durante i
                sopralluoghi.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Ing. Claudia R., progettista impianti industriali
                </span>
              </li>
              <li className="rounded-lg border border-gray-200 p-4">
                “Le note normative integrate evitano dimenticanze quando redigiamo le relazioni CEI 64-8.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Per. Ind. Stefano B., studio quadri BT
                </span>
              </li>
            </ul>
          </section>
        </>
      ) : (
        <section className="section-card border border-dashed border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900">
            Inserisci i dati per calcolare la corrente di corto circuito
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Compila i campi relativi al trasformatore e alla linea per ottenere Ik, Ipk, I²t e verificare
            la conformità con i dispositivi di protezione secondo la CEI 64-8.
          </p>
        </section>
      )}

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme e riferimenti tecnici
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>CEI 64-8, Parte 4-4 – Protezione contro le sovracorrenti.</li>
          <li>CEI 60909 – Calcolo delle correnti di cortocircuito in sistemi trifase in corrente alternata.</li>
          <li>Guida CEI 64-50 – Dimensionamento dei dispositivi di protezione in BT.</li>
          <li>DM 37/2008 – Obblighi di progetto e dichiarazione di conformità degli impianti elettrici.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Elettrotecnica"
        reviewedBy="Ing. Ugo Candido (Ordine Udine n. 2389)"
        lastReviewDate="2025-03-09"
        referenceStandard="CEI 64-8, CEI 60909, Guida CEI 64-50, DM 37/2008"
      />
    </div>
  );
}
