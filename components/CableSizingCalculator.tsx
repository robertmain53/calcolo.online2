'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SystemType = 'singlephase' | 'threephase';
type ConductorMaterial = 'copper' | 'aluminum';
type InstallationMethod = 'B1' | 'B2' | 'C' | 'E';

interface InstallationData {
  label: string;
  correctionFactor: number;
}

interface SectionData {
  section: number;
  copperAmpacity: number;
  aluminumAmpacity: number;
}

interface CalculationResult {
  designCurrent: number;
  adjustedAmpacity: number;
  recommendedSection: SectionData | null;
  voltageDropVolts: number;
  voltageDropPercent: number;
  warnings: string[];
  summary: Array<{ label: string; value: string }>;
}

const installationTable: Record<InstallationMethod, InstallationData> = {
  B1: { label: 'B1 - incassato in parete isolante', correctionFactor: 0.78 },
  B2: { label: 'B2 - incassato in parete non isolante', correctionFactor: 0.87 },
  C: { label: 'C - posa su passerella/parete', correctionFactor: 1.0 },
  E: { label: 'E - posa su passerella perforata', correctionFactor: 1.04 },
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
];

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
  power: number;
  powerFactor: number;
  efficiency: number;
  userCurrent: number;
  length: number;
  material: ConductorMaterial;
  permissibleDrop: number;
  installation: InstallationMethod;
  nConductors: number;
}) {
  const {
    system,
    voltage,
    power,
    powerFactor,
    efficiency,
    userCurrent,
    length,
    material,
    permissibleDrop,
    installation,
    nConductors,
  } = params;

  const baseCurrent =
    userCurrent > 0
      ? userCurrent
      : system === 'threephase'
      ? (power * 1000) / (Math.sqrt(3) * voltage * powerFactor * efficiency)
      : (power * 1000) / (voltage * powerFactor * efficiency);

  const designCurrent = baseCurrent;
  const installationData = installationTable[installation];
  const correction = installationData?.correctionFactor ?? 1;
  const adjustedAmpacity = designCurrent / correction;

  const chosenSections = standardSections.filter((section) =>
    material === 'copper'
      ? section.copperAmpacity >= adjustedAmpacity
      : section.aluminumAmpacity >= adjustedAmpacity
  );
  const recommendedSection = chosenSections.length > 0 ? chosenSections[0] : null;

  const resistivity = material === 'copper' ? 0.0225 : 0.036; // ohm*mm2/m
  const lengthMeters = length;
  const workingVoltage = voltage;
  const conductors = Math.max(2, nConductors);
  const sectionValue = recommendedSection?.section ?? standardSections.at(-1)?.section ?? 1.5;

  const dropFactor = system === 'threephase' ? Math.sqrt(3) : 2;
  const voltageDropVolts =
    (dropFactor * resistivity * lengthMeters * designCurrent) / sectionValue;
  const voltageDropPercent = (voltageDropVolts / workingVoltage) * 100;

  const warnings: string[] = [];
  if (!recommendedSection) {
    warnings.push('Nessuna sezione standard soddisfa il valore di corrente richiesto: valutare conduttori multipli in parallelo.');
  }
  if (voltageDropPercent > permissibleDrop) {
    warnings.push(
      `Caduta di tensione ${round(voltageDropPercent, 2)} % superiore al limite impostato (${permissibleDrop} %). Aumentare la sezione.`
    );
  }
  if (conductors < 2) {
    warnings.push('Numero conduttori insufficiente per la corrente considerata.');
  }

  const summary: CalculationResult['summary'] = [
    { label: 'Corrente di progetto Ib', value: `${round(designCurrent, 2)} A` },
    { label: 'Corrente corretta per posa', value: `${round(adjustedAmpacity, 2)} A` },
    {
      label: 'Sezione consigliata',
      value: recommendedSection ? `${recommendedSection.section} mm²` : 'N/D',
    },
    {
      label: 'Portata tabellare',
      value: recommendedSection
        ? `${material === 'copper' ? recommendedSection.copperAmpacity : recommendedSection.aluminumAmpacity} A`
        : 'N/D',
    },
    {
      label: 'Caduta di tensione',
      value: `${round(voltageDropVolts, 2)} V (${round(voltageDropPercent, 2)} %)`,
    },
  ];

  return {
    designCurrent,
    adjustedAmpacity,
    recommendedSection,
    voltageDropVolts,
    voltageDropPercent,
    warnings,
    summary,
  };
}

export default function CableSizingCalculator() {
  const [system, setSystem] = useState<SystemType>('threephase');
  const [voltage, setVoltage] = useState('400');
  const [power, setPower] = useState('75');
  const [powerFactor, setPowerFactor] = useState('0.9');
  const [efficiency, setEfficiency] = useState('0.95');
  const [userCurrent, setUserCurrent] = useState('0');
  const [length, setLength] = useState('40');
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [permissibleDrop, setPermissibleDrop] = useState('4');
  const [installation, setInstallation] = useState<InstallationMethod>('C');
  const [nConductors, setNConductors] = useState('3');

  const result = useMemo<CalculationResult | null>(() => {
    const V = toNumber(voltage);
    const P = toNumber(power);
    const cosphi = Math.min(1, Math.max(0.5, toNumber(powerFactor)));
    const eta = Math.min(1, Math.max(0.7, toNumber(efficiency)));
    const Iuser = Math.max(0, toNumber(userCurrent));
    const L = Math.max(1, toNumber(length));
    const drop = Math.max(1, toNumber(permissibleDrop));
    const conductors = Math.max(2, Math.floor(toNumber(nConductors)));

    if (V <= 0 || P <= 0) {
      return null;
    }

    return computeResult({
      system,
      voltage: V,
      power: P,
      powerFactor: cosphi,
      efficiency: eta,
      userCurrent: Iuser,
      length: L,
      material,
      permissibleDrop: drop,
      installation,
      nConductors: conductors,
    });
  }, [
    system,
    voltage,
    power,
    powerFactor,
    efficiency,
    userCurrent,
    length,
    material,
    permissibleDrop,
    installation,
    nConductors,
  ]);

  const alternativeSections = useMemo(() => {
    if (!result) {
      return [];
    }
    return standardSections
      .filter((section) =>
        material === 'copper'
          ? section.copperAmpacity >= result.adjustedAmpacity
          : section.aluminumAmpacity >= result.adjustedAmpacity
      )
      .slice(0, 5);
  }, [result, material]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dati di progetto per la sezione dei cavi
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Seleziona tipologia di rete, potenza o corrente, lunghezza e parametri di posa per stimare la sezione minima del cavo in conformita a NTC 2018 e CEI 64-8.
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
                  step="10"
                  min="100"
                  value={voltage}
                  onChange={(event) => setVoltage(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="power" className="calculator-label">
                  Potenza installata (kW)
                </label>
                <input
                  id="power"
                  type="number"
                  step="1"
                  min="1"
                  value={power}
                  onChange={(event) => setPower(event.target.value)}
                  className="calculator-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Imposta a zero per inserire direttamente la corrente.
                </p>
              </div>
              <div>
                <label htmlFor="userCurrent" className="calculator-label">
                  Corrente nominale (A)
                </label>
                <input
                  id="userCurrent"
                  type="number"
                  step="1"
                  min="0"
                  value={userCurrent}
                  onChange={(event) => setUserCurrent(event.target.value)}
                  className="calculator-input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se diverso da 0, il calcolo usa questo valore al posto della potenza.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="powerFactor" className="calculator-label">
                  cos&nbsp;phi
                </label>
                <input
                  id="powerFactor"
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="1"
                  value={powerFactor}
                  onChange={(event) => setPowerFactor(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="efficiency" className="calculator-label">
                  Rendimento
                </label>
                <input
                  id="efficiency"
                  type="number"
                  step="0.01"
                  min="0.7"
                  max="1"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="nConductors" className="calculator-label">
                  N. conduttori attivi
                </label>
                <input
                  id="nConductors"
                  type="number"
                  step="1"
                  min="2"
                  value={nConductors}
                  onChange={(event) => setNConductors(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="length" className="calculator-label">
                  Lunghezza tratta (m)
                </label>
                <input
                  id="length"
                  type="number"
                  step="1"
                  min="1"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="permissibleDrop" className="calculator-label">
                  Caduta max (%) 
                </label>
                <input
                  id="permissibleDrop"
                  type="number"
                  step="0.5"
                  min="1"
                  value={permissibleDrop}
                  onChange={(event) => setPermissibleDrop(event.target.value)}
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
                <label htmlFor="installation" className="calculator-label">
                  Metodo di posa
                </label>
                <select
                  id="installation"
                  value={installation}
                  onChange={(event) => setInstallation(event.target.value as InstallationMethod)}
                  className="calculator-input"
                >
                  {Object.entries(installationTable).map(([key, data]) => (
                    <option key={key} value={key}>
                      {data.label}
                    </option>
                  ))}
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
              Risultati principali
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              La sezione suggerita rispetta la portata Iz corretta per il metodo di posa scelto e
              confronta la caduta di tensione con il limite impostato.
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

          <section className="section-card">
            <h2 className="text-2xl font-semibold text-gray-900">
              Tabelle di verifica sezioni disponibili
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Le sezioni sotto riportate derivano dalle tabelle CEI 64-8 per conduttori unipolari.
              Applica ulteriori coefficienti nel caso di posa di più circuiti affiancati o temperatura
              ambiente anomala.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Sezione (mm²)</th>
                    <th className="px-4 py-3 text-left font-semibold">Portata rame (A)</th>
                    <th className="px-4 py-3 text-left font-semibold">Portata alluminio (A)</th>
                    <th className="px-4 py-3 text-left font-semibold">Idoneità</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {alternativeSections.map((section) => {
                    const copperCheck = section.copperAmpacity >= result.adjustedAmpacity;
                    const aluminumCheck = section.aluminumAmpacity >= result.adjustedAmpacity;
                    const isRecommended =
                      result.recommendedSection &&
                      result.recommendedSection.section === section.section;
                    return (
                      <tr
                        key={section.section}
                        className={isRecommended ? 'bg-green-50' : undefined}
                      >
                        <td className="px-4 py-3 font-medium">
                          {section.section} mm²
                          {isRecommended && (
                            <span className="ml-2 rounded-full bg-green-200 px-2 py-0.5 text-xs font-semibold text-green-900">
                              Consigliata
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{section.copperAmpacity} A</td>
                        <td className="px-4 py-3">{section.aluminumAmpacity} A</td>
                        <td className="px-4 py-3">
                          {material === 'copper'
                            ? copperCheck
                              ? 'Sì'
                              : 'No'
                            : aluminumCheck
                            ? 'Sì'
                            : 'No'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <h3 className="text-base font-semibold text-gray-900">
                Suggerimento professionale
              </h3>
              <p className="mt-2">
                Mantieni un margine di sicurezza sulla portata progettuale e verifica la coordinazione
                con le protezioni magnetotermiche. Se la caduta di tensione è elevata valuta sezioni
                superiori, l&apos;uso del rame o la distribuzione dei carichi su più linee.
              </p>
            </div>
          </section>
        </>
      ) : (
        <section className="section-card border border-dashed border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900">
            Inserisci i dati per avviare il dimensionamento
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Compila tensione, potenza o corrente e scegli il metodo di posa per ottenere la sezione
            minima del cavo e la verifica della caduta di tensione secondo CEI 64-8.
          </p>
        </section>
      )}

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme e riferimenti tecnici
        </h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>CEI 64-8, Cap. 52 — Scelta e posa dei componenti elettrici.</li>
          <li>CEI UNEL 35024 — Portata dei cavi isolati in PVC per posa fissa.</li>
          <li>Guida CEI 64-50 — Limiti di caduta di tensione negli impianti BT.</li>
          <li>DM 37/2008 — Dichiarazione di conformità degli impianti elettrici.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Elettrotecnica"
        reviewedBy="Ing. Ugo Candido (Ordine Udine n. 2389)"
        lastReviewDate="2025-03-09"
        referenceStandard="CEI 64-8, CEI UNEL 35024, DM 37/2008"
      />
    </div>
  );
}
