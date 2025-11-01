'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SystemType = 'singlephase' | 'threephase';
type ConductorMaterial = 'copper' | 'aluminum';
type InsulationType = 'PVC' | 'XLPE';
type InstallationMethod = 'B1' | 'B2' | 'C' | 'E' | 'F';

type SectionData = {
  section: number;
  copperAmpacity: number;
  aluminumAmpacity: number;
};

type SectionEvaluation = {
  section: number;
  iz: number;
  dropVolts: number;
  dropPercent: number;
  maxLength: number;
  meetsIb: boolean;
  meetsIn: boolean;
  meetsDrop: boolean;
  meetsShortCircuit: boolean | null;
};

type CalculationResult = {
  designCurrent: number;
  requiredAmpacity: number;
  correctionFactors: {
    installation: number;
    temperature: number;
    grouping: number;
    overall: number;
  };
  evaluations: SectionEvaluation[];
  recommended: SectionEvaluation | null;
  protectiveCheck: {
    in: number | null;
    ok: boolean | null;
    message: string | null;
  };
  voltageDropLimit: number;
  shortCircuitCheck: {
    faultCurrent: number;
    allowable: number;
    time: number;
  } | null;
  warnings: string[];
};

const standardSections: SectionData[] = [
  { section: 1.5, copperAmpacity: 16, aluminumAmpacity: 12 },
  { section: 2.5, copperAmpacity: 22, aluminumAmpacity: 17 },
  { section: 4, copperAmpacity: 29, aluminumAmpacity: 23 },
  { section: 6, copperAmpacity: 36, aluminumAmpacity: 30 },
  { section: 10, copperAmpacity: 50, aluminumAmpacity: 40 },
  { section: 16, copperAmpacity: 68, aluminumAmpacity: 55 },
  { section: 25, copperAmpacity: 89, aluminumAmpacity: 72 },
  { section: 35, copperAmpacity: 111, aluminumAmpacity: 90 },
  { section: 50, copperAmpacity: 134, aluminumAmpacity: 110 },
  { section: 70, copperAmpacity: 169, aluminumAmpacity: 140 },
  { section: 95, copperAmpacity: 202, aluminumAmpacity: 170 },
  { section: 120, copperAmpacity: 230, aluminumAmpacity: 195 },
  { section: 150, copperAmpacity: 262, aluminumAmpacity: 220 },
  { section: 185, copperAmpacity: 298, aluminumAmpacity: 250 },
  { section: 240, copperAmpacity: 345, aluminumAmpacity: 290 },
  { section: 300, copperAmpacity: 390, aluminumAmpacity: 330 },
];

const installationFactor: Record<InstallationMethod, number> = {
  B1: 0.78,
  B2: 0.87,
  C: 1,
  E: 1.04,
  F: 1.17,
};

const groupingFactor: Record<number, number> = {
  1: 1,
  2: 0.8,
  3: 0.7,
  4: 0.65,
  5: 0.6,
  6: 0.57,
} as const;

const temperatureFactor: Record<InsulationType, Array<{ ambient: number; copper: number; aluminum: number }>> = {
  PVC: [
    { ambient: 25, copper: 1.03, aluminum: 1.06 },
    { ambient: 30, copper: 1, aluminum: 1 },
    { ambient: 35, copper: 0.94, aluminum: 0.96 },
    { ambient: 40, copper: 0.87, aluminum: 0.91 },
    { ambient: 45, copper: 0.79, aluminum: 0.87 },
    { ambient: 50, copper: 0.71, aluminum: 0.82 },
    { ambient: 55, copper: 0.61, aluminum: 0.76 },
  ],
  XLPE: [
    { ambient: 30, copper: 1.03, aluminum: 1.04 },
    { ambient: 35, copper: 1, aluminum: 1 },
    { ambient: 40, copper: 0.96, aluminum: 0.97 },
    { ambient: 45, copper: 0.92, aluminum: 0.94 },
    { ambient: 50, copper: 0.88, aluminum: 0.9 },
    { ambient: 55, copper: 0.84, aluminum: 0.86 },
    { ambient: 60, copper: 0.79, aluminum: 0.82 },
  ],
};

const kShortCircuit: Record<InsulationType, Record<ConductorMaterial, number>> = {
  PVC: { copper: 115, aluminum: 76 },
  XLPE: { copper: 143, aluminum: 94 },
};

function toNumber(value: string, fallback = 0): number {
  const numeric = Number(value.replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function interpolateTemperatureFactor(
  insulation: InsulationType,
  material: ConductorMaterial,
  ambient: number
) {
  const table = temperatureFactor[insulation];
  const sorted = [...table].sort((a, b) => a.ambient - b.ambient);
  if (ambient <= sorted[0].ambient) {
    return material === 'copper' ? sorted[0].copper : sorted[0].aluminum;
  }
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    if (ambient >= current.ambient && ambient <= next.ambient) {
      const ratio = (ambient - current.ambient) / (next.ambient - current.ambient);
      const start = material === 'copper' ? current.copper : current.aluminum;
      const end = material === 'copper' ? next.copper : next.aluminum;
      return start + ratio * (end - start);
    }
  }
  const last = sorted.at(-1)!;
  return material === 'copper' ? last.copper : last.aluminum;
}

function evaluateSections(params: {
  material: ConductorMaterial;
  installation: InstallationMethod;
  insulation: InsulationType;
  ambient: number;
  grouping: number;
  system: SystemType;
  voltage: number;
  length: number;
  designCurrent: number;
  permissibleDrop: number;
  faultCurrent: number | null;
  faultTime: number;
}) {
  const {
    material,
    installation,
    insulation,
    ambient,
    grouping,
    system,
    voltage,
    length,
    designCurrent,
    permissibleDrop,
    faultCurrent,
    faultTime,
  } = params;

  const methodFactor = installationFactor[installation] ?? 1;
  const tempFactor = interpolateTemperatureFactor(insulation, material, ambient);
  const groupingFactorValue = groupingFactor[grouping] ?? groupingFactor[6];
  const correction = methodFactor * tempFactor * groupingFactorValue;
  const dropFactor = system === 'threephase' ? Math.sqrt(3) : 2;
  const resistivity = material === 'copper' ? 0.0225 : 0.036;
  const kFactor = kShortCircuit[insulation][material];

  const evaluations: SectionEvaluation[] = standardSections.map((sectionData) => {
    const baseAmpacity =
      material === 'copper' ? sectionData.copperAmpacity : sectionData.aluminumAmpacity;
    const iz = baseAmpacity * correction;
    const dropVolts =
      (dropFactor * resistivity * length * designCurrent) / sectionData.section;
    const dropPercent = (dropVolts / voltage) * 100;
    const permissibleDropVolts = (permissibleDrop / 100) * voltage;
    const maxLength =
      designCurrent > 0
        ? (permissibleDropVolts * sectionData.section) /
          (dropFactor * resistivity * designCurrent)
        : 0;

    let meetsShortCircuit: boolean | null = null;
    if (faultCurrent && faultCurrent > 0 && faultTime > 0) {
      const allowable = (kFactor * sectionData.section) / Math.sqrt(faultTime);
      meetsShortCircuit = faultCurrent <= allowable;
    }

    return {
      section: sectionData.section,
      iz,
      dropVolts,
      dropPercent,
      maxLength,
      meetsIb: iz >= designCurrent,
      meetsIn: true,
      meetsDrop: dropPercent <= permissibleDrop,
      meetsShortCircuit,
    };
  });

  return {
    evaluations,
    factors: {
      methodFactor,
      tempFactor,
      groupingFactorValue,
      correction,
    },
  };
}

export default function LowVoltageCableCalculator() {
  const [system, setSystem] = useState<SystemType>('threephase');
  const [voltage, setVoltage] = useState('400');
  const [power, setPower] = useState('55');
  const [powerFactor, setPowerFactor] = useState('0.9');
  const [efficiency, setEfficiency] = useState('0.94');
  const [userCurrent, setUserCurrent] = useState('0');
  const [length, setLength] = useState('45');
  const [permissibleDrop, setPermissibleDrop] = useState('4');
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [insulation, setInsulation] = useState<InsulationType>('PVC');
  const [installation, setInstallation] = useState<InstallationMethod>('C');
  const [ambient, setAmbient] = useState('35');
  const [grouping, setGrouping] = useState('3');
  const [protectiveIn, setProtectiveIn] = useState('80');
  const [faultCurrent, setFaultCurrent] = useState('10');
  const [faultTime, setFaultTime] = useState('0.3');

  const numericInputs = useMemo(() => {
    const V = Math.max(0, toNumber(voltage, 400));
    const P = Math.max(0, toNumber(power, 0));
    const cosphi = clamp(toNumber(powerFactor, 0.9), 0.4, 1);
    const eta = clamp(toNumber(efficiency, 0.94), 0.6, 1);
    const Iuser = Math.max(0, toNumber(userCurrent, 0));
    const lengthValue = Math.max(1, toNumber(length, 1));
    const dropLimit = Math.max(0.5, toNumber(permissibleDrop, 4));
    const ambientValue = clamp(toNumber(ambient, 35), 20, 60);
    const groupingValue = Math.min(6, Math.max(1, Math.round(toNumber(grouping, 3))));
    const In = Math.max(0, toNumber(protectiveIn, 0));
    const fault = Math.max(0, toNumber(faultCurrent, 0)) * 1000; // convert kA to A
    const faultDuration = Math.max(0.05, toNumber(faultTime, 0.3));

    const designCurrent =
      Iuser > 0
        ? Iuser
        : system === 'threephase'
        ? (P * 1000) / (Math.sqrt(3) * V * cosphi * eta)
        : (P * 1000) / (V * cosphi * eta);

    return {
      voltage: V,
      power: P,
      cosphi,
      eta,
      designCurrent,
      length: lengthValue,
      dropLimit,
      ambient: ambientValue,
      grouping: groupingValue,
      protectiveIn: In,
      faultCurrentA: fault,
      faultTimeValue: faultDuration,
    };
  }, [
    voltage,
    power,
    powerFactor,
    efficiency,
    userCurrent,
    system,
    length,
    permissibleDrop,
    ambient,
    grouping,
    protectiveIn,
    faultCurrent,
    faultTime,
  ]);

  const result = useMemo<CalculationResult | null>(() => {
    const { voltage: V, designCurrent, length: L, dropLimit, ambient: Ta, grouping: G, protectiveIn, faultCurrentA, faultTimeValue } =
      numericInputs;

    if (V <= 0 || designCurrent <= 0) {
      return null;
    }

    const { evaluations, factors } = evaluateSections({
      material,
      installation,
      insulation,
      ambient: Ta,
      grouping: G,
      system,
      voltage: V,
      length: L,
      designCurrent,
      permissibleDrop: dropLimit,
      faultCurrent: faultCurrentA > 0 ? faultCurrentA : null,
      faultTime: faultTimeValue,
    });

    const requiredAmpacity = designCurrent / factors.correction;
    const protectiveCheck = (() => {
      if (protectiveIn <= 0) {
        return { in: null, ok: null, message: null };
      }
      const meets = protectiveIn >= designCurrent;
      return {
        in: protectiveIn,
        ok: meets,
        message: meets
          ? 'La corrente nominale del dispositivo è coerente con Ib.'
          : 'In del dispositivo è inferiore a Ib: aumenta la taglia o riduci il carico sul circuito.',
      };
    })();

    let recommended: SectionEvaluation | null = null;
    for (const evaluation of evaluations) {
      const meetsIn = protectiveCheck.in ? evaluation.iz >= protectiveCheck.in : true;
      evaluation.meetsIn = meetsIn;
      const meetsAll =
        evaluation.meetsIb && meetsIn && evaluation.meetsDrop &&
        (evaluation.meetsShortCircuit !== false);
      if (!recommended && meetsAll) {
        recommended = evaluation;
      }
    }

    const faultCurrentKA = faultCurrentA > 0 ? faultCurrentA / 1000 : null;

    if (!recommended) {
      recommended = evaluations.find((item) => item.meetsIb) ?? evaluations.at(-1) ?? null;
    }

    const warnings: string[] = [];
    if (!recommended) {
      warnings.push('Nessuna sezione standard soddisfa i requisiti richiesti. Valuta conduttori in parallelo o verifica progettuale avanzata.');
    } else {
      if (!recommended.meetsDrop) {
        warnings.push(
          `La sezione ${recommended.section} mm² non rispetta la caduta di tensione impostata (${round(
            recommended.dropPercent,
            2
          )}% > ${dropLimit}%).`);
      }
      if (protectiveCheck.in && recommended && !recommended.meetsIn) {
        warnings.push(
          `La portata Iz della sezione ${recommended.section} mm² (${round(
            recommended.iz,
            1
          )} A) è inferiore alla corrente nominale della protezione (${protectiveCheck.in} A).`
        );
      }
      if (recommended.meetsShortCircuit === false && faultCurrentKA !== null) {
        warnings.push(
          `Verifica corto circuito: la sezione ${recommended.section} mm² non sopporta il corto circuito indicato (${round(
            faultCurrentKA,
            2
          )} kA per ${round(faultTimeValue, 2)} s).`
        );
      }
    }

    if (protectiveCheck.ok === false) {
      warnings.push('In del dispositivo di protezione è inferiore alla corrente di progetto: rivedere la scelta del magnetotermico.');
    }

    const shortCircuitCheck = faultCurrentA > 0
      ? {
          faultCurrent: faultCurrentA,
          allowable:
            recommended && faultTimeValue > 0
              ? (kShortCircuit[insulation][material] * recommended.section) /
                Math.sqrt(faultTimeValue)
              : 0,
          time: faultTimeValue,
        }
      : null;

    return {
      designCurrent,
      requiredAmpacity,
      correctionFactors: {
        installation: factors.methodFactor,
        temperature: factors.tempFactor,
        grouping: factors.groupingFactorValue,
        overall: factors.correction,
      },
      evaluations,
      recommended,
      protectiveCheck,
      voltageDropLimit: dropLimit,
      shortCircuitCheck,
      warnings,
    };
  }, [numericInputs, material, installation, insulation, system, faultCurrent, faultTime]);

  const advisoryNotes = useMemo(() => {
    if (!result) {
      return [];
    }
    const notes: string[] = [];
    notes.push('Assicurati che In ≤ Iz e che la protezione soddisfi la condizione I₂ ≤ 1,45 · Iz (CEI 64-8 art. 433).');
    if (numericInputs.dropLimit <= 4) {
      notes.push('Per circuiti di illuminazione imposta un limite del 3% come suggerito da CEI 64-8 Tab. 525.1.');
    }
    if (material === 'aluminum') {
      notes.push('Per alluminio considera terminali, crimpare e manutenzione specifica per evitare allentamenti nel tempo.');
    }
    if (result.shortCircuitCheck && result.shortCircuitCheck.faultCurrent / 1000 > 15) {
      notes.push('Con corti circuito elevati verifica anche il contributo della rete MT/BT e dei motori in parallelo.');
    }
    return notes;
  }, [result, numericInputs.dropLimit, material]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">Parametri di dimensionamento del cavo BT</h2>
        <p className="mt-1 text-sm text-gray-600">
          Inserisci i dati di progetto del circuito trifase o monofase, la posa e i fattori correttivi previsti dalla CEI 64-8.
          Il calcolatore restituisce la sezione minima, la caduta di tensione e verifica protezioni e corto circuito secondo le norme.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="system" className="calculator-label">Tipo di circuito</label>
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
                <label htmlFor="voltage" className="calculator-label">Tensione (V)</label>
                <input
                  id="voltage"
                  type="number"
                  min="110"
                  step="5"
                  value={voltage}
                  onChange={(event) => setVoltage(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="power" className="calculator-label">Potenza assorbita (kW)</label>
                <input
                  id="power"
                  type="number"
                  min="0"
                  step="1"
                  value={power}
                  onChange={(event) => setPower(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Imposta a 0 per inserire direttamente la corrente nominale.</p>
              </div>
              <div>
                <label htmlFor="userCurrent" className="calculator-label">Corrente nominale (A)</label>
                <input
                  id="userCurrent"
                  type="number"
                  min="0"
                  step="0.1"
                  value={userCurrent}
                  onChange={(event) => setUserCurrent(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Quando diverso da 0, il calcolo utilizza questo valore per Ib.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="powerFactor" className="calculator-label">cos&nbsp;φ</label>
                <input
                  id="powerFactor"
                  type="number"
                  min="0.4"
                  max="1"
                  step="0.01"
                  value={powerFactor}
                  onChange={(event) => setPowerFactor(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="efficiency" className="calculator-label">Rendimento η</label>
                <input
                  id="efficiency"
                  type="number"
                  min="0.6"
                  max="1"
                  step="0.01"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="length" className="calculator-label">Lunghezza tratta (m)</label>
                <input
                  id="length"
                  type="number"
                  min="1"
                  step="1"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="permissibleDrop" className="calculator-label">Caduta max ammessa (%)</label>
                <input
                  id="permissibleDrop"
                  type="number"
                  min="1"
                  max="15"
                  step="0.1"
                  value={permissibleDrop}
                  onChange={(event) => setPermissibleDrop(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="protectiveIn" className="calculator-label">Protezione magnetotermica In (A)</label>
                <input
                  id="protectiveIn"
                  type="number"
                  min="0"
                  step="1"
                  value={protectiveIn}
                  onChange={(event) => setProtectiveIn(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Inserisci la taglia dell&apos;interruttore o del relè termico.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="material" className="calculator-label">Materiale conduttore</label>
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
                <label htmlFor="insulation" className="calculator-label">Isolamento</label>
                <select
                  id="insulation"
                  value={insulation}
                  onChange={(event) => setInsulation(event.target.value as InsulationType)}
                  className="calculator-input"
                >
                  <option value="PVC">PVC (70°C)</option>
                  <option value="XLPE">XLPE (90°C)</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="installation" className="calculator-label">Metodo di posa (CEI 64-8)</label>
                <select
                  id="installation"
                  value={installation}
                  onChange={(event) => setInstallation(event.target.value as InstallationMethod)}
                  className="calculator-input"
                >
                  <option value="B1">B1 - incasso parete isolante</option>
                  <option value="B2">B2 - incasso parete non isolante</option>
                  <option value="C">C - su passerella/parete</option>
                  <option value="E">E - su canale perforato</option>
                  <option value="F">F - in aria libera</option>
                </select>
              </div>
              <div>
                <label htmlFor="ambient" className="calculator-label">Temperatura ambiente (°C)</label>
                <input
                  id="ambient"
                  type="number"
                  min="20"
                  max="60"
                  step="1"
                  value={ambient}
                  onChange={(event) => setAmbient(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="grouping" className="calculator-label">Numero circuiti affiancati</label>
                <input
                  id="grouping"
                  type="number"
                  min="1"
                  max="6"
                  step="1"
                  value={grouping}
                  onChange={(event) => setGrouping(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label className="calculator-label" htmlFor="faultCurrent">Corrente di corto circuito (kA)</label>
                <input
                  id="faultCurrent"
                  type="number"
                  min="0"
                  step="0.1"
                  value={faultCurrent}
                  onChange={(event) => setFaultCurrent(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Valore presunto sul punto del circuito (facoltativo).</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="calculator-label" htmlFor="faultTime">Tempo di intervento protezione (s)</label>
                <input
                  id="faultTime"
                  type="number"
                  min="0.05"
                  step="0.05"
                  value={faultTime}
                  onChange={(event) => setFaultTime(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Usa il tempo di sgancio in cortocircuito del magnetotermico o fusibile.</p>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">Linee guida</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Applica i coefficienti correttivi CEI 64-8 Tab. 52F (temperatura) e 52D (raggruppamento).</li>
                <li>Verifica il coordinamento con il dispositivo di protezione: Ib ≤ In ≤ Iz.</li>
                <li>Controlla la caduta di tensione su linee lunghe e, se necessario, aumenta la sezione o riduci la lunghezza dei tratti.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="section-card border-green-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Risultati principali</h3>
              <p className="text-sm text-gray-600">
                Riepilogo delle verifiche Ib, Iz, caduta di tensione e corto circuito in accordo con CEI 64-8 Capitolo 43 e Allegato 52.
              </p>
            </div>
            <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Ib = {round(result.designCurrent, 2)} A • Iz richiesta ≥ {round(result.requiredAmpacity, 1)} A
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Sezione consigliata</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {result.recommended ? `${result.recommended.section} mm²` : '—'}
              </p>
              {result.recommended && (
                <p className="mt-2 text-sm text-gray-600">
                  Iz = {round(result.recommended.iz, 1)} A • ΔV = {round(result.recommended.dropPercent, 2)}%
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Fattori correttivi</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                Ftot = {round(result.correctionFactors.overall, 3)}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Posa {round(result.correctionFactors.installation, 2)} • Temperatura {round(result.correctionFactors.temperature, 2)} • Raggruppamento {round(result.correctionFactors.grouping, 2)}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Verifica protezione</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {result.protectiveCheck.in ? `${round(result.protectiveCheck.in, 0)} A` : 'In non impostata'}
              </p>
              {result.protectiveCheck.message && (
                <p className="mt-2 text-sm text-gray-600">{result.protectiveCheck.message}</p>
              )}
            </div>

            {result.shortCircuitCheck && result.recommended && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">Verifica corto circuito</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  Ik = {round(result.shortCircuitCheck.faultCurrent / 1000, 2)} kA
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  I<sub>amm</sub> = {round(result.shortCircuitCheck.allowable / 1000, 2)} kA per {round(result.shortCircuitCheck.time, 2)} s
                </p>
              </div>
            )}

            {result.recommended && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">Lunghezza massima con ΔV</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {round(result.recommended.maxLength, 1)} m
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Valore utile se la tratta dovesse aumentare mantenendo gli stessi parametri.
                </p>
              </div>
            )}
          </div>

          {result.warnings.length > 0 && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-800">Avvertenze progettuali</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Sezione (mm²)</th>
                  <th className="px-3 py-2">Iz (A)</th>
                  <th className="px-3 py-2">ΔV (V)</th>
                  <th className="px-3 py-2">ΔV (%)</th>
                  <th className="px-3 py-2">L max (m)</th>
                  <th className="px-3 py-2">Ib</th>
                  <th className="px-3 py-2">In</th>
                  <th className="px-3 py-2">C.C.</th>
                </tr>
              </thead>
              <tbody>
                {result.evaluations.slice(0, 6).map((evaluation) => (
                  <tr key={evaluation.section} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">{evaluation.section}</td>
                    <td className="px-3 py-2">{round(evaluation.iz, 1)}</td>
                    <td className="px-3 py-2">{round(evaluation.dropVolts, 2)}</td>
                    <td className="px-3 py-2">{round(evaluation.dropPercent, 2)}</td>
                    <td className="px-3 py-2">{round(evaluation.maxLength, 1)}</td>
                    <td className="px-3 py-2">{evaluation.meetsIb ? '✓' : '✗'}</td>
                    <td className="px-3 py-2">{evaluation.meetsIn ? '✓' : '✗'}</td>
                    <td className="px-3 py-2">
                      {evaluation.meetsShortCircuit === null ? '—' : evaluation.meetsShortCircuit ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {advisoryNotes.length > 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-700">
              <h4 className="text-base font-semibold text-gray-900">Suggerimenti pratici</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {advisoryNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <section className="section-card border-amber-100">
          <h3 className="text-lg font-semibold text-gray-900">Completa i dati di ingresso</h3>
          <p className="mt-2 text-sm text-gray-600">
            Imposta almeno potenza o corrente e la tensione di alimentazione per calcolare la corrente di progetto Ib.
            Aggiungi le informazioni di posa per applicare i fattori correttivi CEI 64-8.
          </p>
        </section>
      )}

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Formule e criteri utilizzati</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-600">
          <p>Corrente di progetto Ib = P · 1000 / (k · V · cosφ · η) con k = √3 (trifase) o 1 (monofase).</p>
          <p>Portata corretta Iz = Iz<sub>tab</sub> · F<sub>posa</sub> · F<sub>temp</sub> · F<sub>raggr</sub>.</p>
          <p>
            Caduta di tensione ΔV = k · ρ · L · Ib / S, limite secondo CEI 64-8 Tab. 525.1 (4% FM, 3% illuminazione).
          </p>
          <p>Verifica corto circuito: S ≥ I<sub>cc</sub> · √t / k (CEI 64-8 art. 434.3).</p>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Riferimenti normativi</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>CEI 64-8:2017 – Capitolo 52 (scelta e posa dei cavi) e Capitolo 43 (protezione dai sovraccarichi).</li>
          <li>CEI UNEL 35024/1 – Tabelle di portata per cavi isolati in PVC e XLPE.</li>
          <li>CEI EN 60287 – Calcolo termico della portata dei cavi.</li>
          <li>CEI EN 50565 – Guida alla posa dei cavi elettrici.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Integra il risultato con il coordinamento elettrodinamico delle protezioni e, per linee lunghe, considera le armoniche generate da inverter o carichi elettronici.</p>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Limitazioni e buone pratiche</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>I fattori correttivi adottati sono indicativi: utilizzare i valori aggiornati dai cataloghi dei produttori di cavi.</li>
          <li>Per posa in ambienti industriali gravosi verifica anche fattori chimici, UV e resistenza al fuoco (CEI 20-22).</li>
          <li>Quando i cavi sono in parallelo occorre garantire lunghezze identiche e stesso percorso per uniformare l&apos;impedenza.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Ing. Alessio Bianchi, Progettista impianti elettrici"
        reviewedBy="Ing. Ugo Candido, Revisore Tecnico Capo"
        lastReviewDate="Marzo 2025"
        referenceStandard="CEI 64-8, CEI UNEL 35024/1, CEI EN 60287"
      />

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Disclaimer professionale</h3>
        <p className="mt-2 text-sm text-gray-600">
          Lo strumento fornisce un pre-dimensionamento. Prima di validare il progetto, confronta i risultati con le curve ufficiali del
          costruttore dei cavi e con il software aziendale, valutando selettività, corti circuito e condizioni ambientali specifiche.
        </p>
      </section>
    </div>
  );
}
