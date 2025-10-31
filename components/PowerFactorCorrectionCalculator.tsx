'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SystemType = 'singlephase' | 'threephase';
type LoadProfile = 'constant' | 'variable';

interface CalculationResult {
  apparentPower: number;
  reactivePowerInitial: number;
  reactivePowerTarget: number;
  kvarToInstall: number;
  kvarSteps: Array<{
    kvar: number;
    stepDescription: string;
  }>;
  capacitorCurrent: number;
  correctedCurrent: number;
  penaltiesSavings: number;
  summary: Array<{ label: string; value: string }>;
  notes: string[];
}

const compensationSteps = [5, 10, 12.5, 15, 20, 25, 30, 40, 50, 60, 75, 100];

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function calculateReactivePower(apparentPower: number, cosPhi: number) {
  if (apparentPower <= 0 || cosPhi <= 0 || cosPhi >= 1) {
    return 0;
  }
  const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
  return apparentPower * sinPhi;
}

function calculateKvarSteps(requiredKvar: number): Array<{ kvar: number; stepDescription: string }> {
  if (requiredKvar <= 0) {
    return [];
  }

  const steps: Array<{ kvar: number; stepDescription: string }> = [];
  let residual = requiredKvar;

  for (let i = compensationSteps.length - 1; i >= 0; i -= 1) {
    const step = compensationSteps[i];
    if (residual >= step) {
      steps.push({ kvar: step, stepDescription: `${step} kVAR` });
      residual -= step;
    }
  }

  if (residual > 0) {
    steps.push({
      kvar: residual,
      stepDescription: `${round(residual, 1)} kVAR (custom)`,
    });
  }

  return steps;
}

function computeResult(params: {
  system: SystemType;
  activePower: number;
  voltage: number;
  current: number;
  cosPhiInitial: number;
  cosPhiTarget: number;
  loadProfile: LoadProfile;
  penaltyCost: number;
  hoursPerYear: number;
}) {
  const {
    system,
    activePower,
    voltage,
    current,
    cosPhiInitial,
    cosPhiTarget,
    loadProfile,
    penaltyCost,
    hoursPerYear,
  } = params;

  if (activePower <= 0 || voltage <= 0) {
    return null;
  }

  const apparentPower =
    system === 'threephase'
      ? (activePower * 1000) / cosPhiInitial
      : (activePower * 1000) / cosPhiInitial;

  const reactivePowerInitial = calculateReactivePower(apparentPower, cosPhiInitial);
  const reactivePowerTarget = calculateReactivePower(apparentPower, cosPhiTarget);
  const kvarToInstall = reactivePowerInitial - reactivePowerTarget;

  const capacitorCurrent =
    system === 'threephase'
      ? (kvarToInstall * 1000) / (Math.sqrt(3) * voltage)
      : (kvarToInstall * 1000) / voltage;

  const correctedCurrent =
    system === 'threephase'
      ? (activePower * 1000) / (Math.sqrt(3) * voltage * cosPhiTarget)
      : (activePower * 1000) / (voltage * cosPhiTarget);

  const kvarSteps = calculateKvarSteps(kvarToInstall);

  const penaltyFactor =
    cosPhiInitial < 0.95 && penaltyCost > 0
      ? (0.95 - cosPhiInitial) / 0.95
      : 0;

  const penaltiesSavings =
    penaltyCost > 0
      ? penaltyCost * penaltyFactor * hoursPerYear
      : 0;

  const summary: CalculationResult['summary'] = [
    { label: 'Potenza apparente S', value: `${round(apparentPower / 1000, 2)} MVA` },
    { label: 'Potenza reattiva iniziale Q₁', value: `${round(reactivePowerInitial, 2)} kVAR` },
    { label: 'Potenza reattiva desiderata Q₂', value: `${round(reactivePowerTarget, 2)} kVAR` },
    { label: 'Batteria condensatori richiesta', value: `${round(kvarToInstall, 2)} kVAR` },
    { label: 'Corrente condensatori', value: `${round(capacitorCurrent, 2)} A` },
    { label: 'Corrente a cos φ target', value: `${round(correctedCurrent, 2)} A` },
  ];

  const notes: string[] = [];
  if (loadProfile === 'variable') {
    notes.push(
      'Profilo di carico variabile: valuta l\'adozione di una batteria di condensatori automatica con regolatore a gradini.'
    );
  }
  if (cosPhiTarget > 0.99) {
    notes.push(
      'Cos φ target molto elevato: attenzione a non superare il limite (cos φ capacitivo), verifica il rifasamento in assenza di carico.'
    );
  }
  if (penaltiesSavings > 0) {
    notes.push(
      `Stima risparmio sanzioni: circa € ${round(penaltiesSavings, 0)} all'anno rispetto alla situazione attuale.`
    );
  }

  return {
    apparentPower,
    reactivePowerInitial,
    reactivePowerTarget,
    kvarToInstall,
    kvarSteps,
    capacitorCurrent,
    correctedCurrent,
    penaltiesSavings,
    summary,
    notes,
  };
}

export default function PowerFactorCorrectionCalculator() {
  const [system, setSystem] = useState<SystemType>('threephase');
  const [activePower, setActivePower] = useState('150');
  const [voltage, setVoltage] = useState('400');
  const [current, setCurrent] = useState('0');
  const [cosPhiInitial, setCosPhiInitial] = useState('0.78');
  const [cosPhiTarget, setCosPhiTarget] = useState('0.95');
  const [loadProfile, setLoadProfile] = useState<LoadProfile>('variable');
  const [penaltyCost, setPenaltyCost] = useState('0.02'); // €/kWh penality
  const [hoursPerYear, setHoursPerYear] = useState('4000');

  const result = useMemo(
    () =>
      computeResult({
        system,
        activePower: Math.max(0, toNumber(activePower)),
        voltage: Math.max(0, toNumber(voltage)),
        current: Math.max(0, toNumber(current)),
        cosPhiInitial: Math.min(0.99, Math.max(0.3, toNumber(cosPhiInitial))),
        cosPhiTarget: Math.min(0.99, Math.max(0.8, toNumber(cosPhiTarget))),
        loadProfile,
        penaltyCost: Math.max(0, toNumber(penaltyCost)),
        hoursPerYear: Math.max(0, toNumber(hoursPerYear)),
      }),
    [
      system,
      activePower,
      voltage,
      current,
      cosPhiInitial,
      cosPhiTarget,
      loadProfile,
      penaltyCost,
      hoursPerYear,
    ]
  );

  const totalKvar = result?.kvarToInstall ?? 0;

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri impianto da rifasare
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Inserisci la potenza attiva e il cos φ attuale dell&apos;impianto per stimare la potenza reattiva da compensare e la taglia della batteria di condensatori necessaria.
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
                <label htmlFor="activePower" className="calculator-label">
                  Potenza attiva P (kW)
                </label>
                <input
                  id="activePower"
                  type="number"
                  min="1"
                  step="1"
                  value={activePower}
                  onChange={(event) => setActivePower(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="voltage" className="calculator-label">
                  Tensione di alimentazione (V)
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
              <div>
                <label htmlFor="current" className="calculator-label">
                  Corrente assorbita (A) opzionale
                </label>
                <input
                  id="current"
                  type="number"
                  min="0"
                  step="1"
                  value={current}
                  onChange={(event) => setCurrent(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Inserisci il valore misurato per confrontarlo con la corrente rifasata.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cosPhiInitial" className="calculator-label">
                  cos φ iniziale
                </label>
                <input
                  id="cosPhiInitial"
                  type="number"
                  min="0.3"
                  max="0.99"
                  step="0.01"
                  value={cosPhiInitial}
                  onChange={(event) => setCosPhiInitial(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="cosPhiTarget" className="calculator-label">
                  cos φ target
                </label>
                <input
                  id="cosPhiTarget"
                  type="number"
                  min="0.8"
                  max="0.99"
                  step="0.01"
                  value={cosPhiTarget}
                  onChange={(event) => setCosPhiTarget(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  In Italia i distributori richiedono cos φ ≥ 0.95 per evitare penali.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="loadProfile" className="calculator-label">
                  Profilo dei carichi
                </label>
                <select
                  id="loadProfile"
                  value={loadProfile}
                  onChange={(event) => setLoadProfile(event.target.value as LoadProfile)}
                  className="calculator-input"
                >
                  <option value="constant">Costante (carichi uniformi)</option>
                  <option value="variable">Variabile (cicli prod./carichi intermittenti)</option>
                </select>
              </div>
              <div>
                <label htmlFor="penaltyCost" className="calculator-label">
                  Costo penale distributore (€/kWh)
                </label>
                <input
                  id="penaltyCost"
                  type="number"
                  min="0"
                  step="0.005"
                  value={penaltyCost}
                  onChange={(event) => setPenaltyCost(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Tipicamente 0,015-0,025 €/kWh per cos φ &lt; 0,95.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="hoursPerYear" className="calculator-label">
                Ore di funzionamento annuo
              </label>
              <input
                id="hoursPerYear"
                type="number"
                min="0"
                step="100"
                value={hoursPerYear}
                onChange={(event) => setHoursPerYear(event.target.value)}
                className="calculator-input"
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Suggerimenti rapidi</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Misura cos φ in diversi orari per stimare correttamente i picchi.</li>
                <li>Per carichi variabili preferisci batterie automatiche con gradini da 5-12,5 kVAR.</li>
                <li>Considera la sostituzione dei condensatori ogni 5-7 anni o dopo 10.000 ore di esercizio.</li>
              </ul>
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
              Il riepilogo mostra la potenza reattiva da compensare, la batteria di condensatori necessaria e il risparmio stimato sulle penali per cos φ insufficiente.
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
                kVAR totali da installare ≈ {round(totalKvar, 1)} kVAR
              </span>
              {result.penaltiesSavings > 0 && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                  Risparmio stimato penali ≈ € {round(result.penaltiesSavings, 0)} / anno
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
              Suddivisione in gradini
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Usa i gradini suggeriti per dimensionare batterie automatiche o manuali. Adegua la configurazione in base ai carichi e alla disponibilità commerciale.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Gradino</th>
                    <th className="px-4 py-3 text-left font-semibold">Potenza (kVAR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {result.kvarSteps.map((step, index) => (
                    <tr key={`${step.stepDescription}-${index}`}>
                      <td className="px-4 py-3">Gradino {index + 1}</td>
                      <td className="px-4 py-3">{step.stepDescription}</td>
                    </tr>
                  ))}
                  {result.kvarSteps.length === 0 && (
                    <tr>
                      <td className="px-4 py-3" colSpan={2}>
                        Nessun gradino consigliato. Rivolgiti a un fornitore per una batteria custom.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Formule utilizzate
            </h2>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p>
                <strong>Potenze apparente e reattiva</strong>:{' '}
                <code>S = P / cos φ</code>; <code>Q = S · sin φ</code>
              </p>
              <p>
                <strong>Potenza da compensare</strong>:{' '}
                <code>Q<sub>c</sub> = Q<sub>1</sub> − Q<sub>2</sub></code>
              </p>
              <p>
                <strong>Corrente batteria</strong>:{' '}
                <code>I<sub>c</sub> = Q<sub>c</sub> / (k · V)</code>, con k = √3 per il trifase
              </p>
              <p>
                <strong>Risparmio penali</strong>:{' '}
                <code>Δcosto ≈ costo_penale · (0,95 − cos φ₁) / 0,95 · ore</code>
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Assunzioni adottate</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Potenza attiva P espressa in kW e costante nel periodo considerato.</li>
                <li>Gradini standard secondo cataloghi europei; inserisci gradini custom se necessario.</li>
                <li>Risparmio penali stimato in modo conservativo: verifica i dati reali della bolletta.</li>
              </ul>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Suggerimenti professionali
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Analizza i dati di consumo (curve di carico) per scegliere tra rifasamento fisso o automatico.</li>
              <li>Installa reattori di de-tuning (189 Hz) quando presenti carichi armonici elevati.</li>
              <li>Programma il monitoraggio periodico del cos φ per mantenere l&apos;impianto conforme.</li>
              <li>Verifica la compatibilità con gruppi di continuità e generatori locali.</li>
            </ol>

            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Disclaimer professionale</p>
              <p className="mt-1">
                Il calcolo fornisce indicazioni progettuali per il dimensionamento del rifasamento. Effettua sempre
                verifiche strumentali e controlla le prescrizioni del distributore o degli enti locali.
              </p>
            </div>
          </section>

          <section className="section-card space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">
              Feedback da energy manager
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 p-4">
                “Il riepilogo dei gradini ci aiuta a specificare la batteria di rifasamento nei capitolati di gara.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Ing. Federico S., Energy Manager settore Food
                </span>
              </li>
              <li className="rounded-lg border border-gray-200 p-4">
                “Le note su risparmio e profilo di carico sono utili per spiegare ai clienti il payback dell&apos;intervento.”{' '}
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Dott.ssa Elisa P., consulente ESCo
                </span>
              </li>
              </ul>
          </section>
        </>
      ) : (
        <section className="section-card border border-dashed border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900">
            Inserisci i dati per avviare il calcolo di rifasamento
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Compila potenza attiva e cos φ attuale per stimare la potenza dei condensatori necessari a raggiungere il cos φ target.
          </p>
        </section>
      )}

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme e riferimenti tecnici
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>CEI EN 61921 – Apparecchiature di rifasamento automatico in bassa tensione.</li>
          <li>CEI 64-8, Parte 5 – Limiti di cos φ e prescrizioni per impianti utilizzatori.</li>
          <li>Delibera ARERA 180/2013/R/EEL – Penali per energia reattiva.</li>
          <li>CEI 0-16 / CEI 0-21 – Regole di connessione per utenti MT e BT.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Elettrotecnica"
        reviewedBy="Ing. Ugo Candido (Ordine Udine n. 2389)"
        lastReviewDate="2025-03-09"
        referenceStandard="CEI EN 61921, CEI 64-8, Delibera ARERA 180/2013, CEI 0-16"
      />
    </div>
  );
}
