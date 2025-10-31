'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type SystemType = 'singlephase' | 'threephase';
type ConductorMaterial = 'copper' | 'aluminum';
type DropPreset = 'general' | 'lighting' | 'custom';

interface CalculationResult {
  loadCurrent: number;
  resistivity: number;
  voltageDropVolts: number;
  voltageDropPercent: number;
  loadVoltage: number;
  allowableDropVolts: number;
  compliant: boolean;
  maxLength: number;
  recommendedSection: number | null;
  summary: Array<{ label: string; value: string }>;
  altSections: Array<{
    section: number;
    dropVolts: number;
    dropPercent: number;
    compliant: boolean;
  }>;
  warnings: string[];
}

const standardSections = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240,
];

const baseResistivity: Record<ConductorMaterial, number> = {
  copper: 0.017241, // Ω·mm²/m @20°C
  aluminum: 0.028264,
};

const tempCoefficient: Record<ConductorMaterial, number> = {
  copper: 0.00393,
  aluminum: 0.00403,
};

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeVoltageDrop(params: {
  system: SystemType;
  voltage: number;
  power: number;
  userCurrent: number;
  powerFactor: number;
  efficiency: number;
  length: number;
  section: number;
  material: ConductorMaterial;
  temperature: number;
  permissibleDrop: number;
}): CalculationResult | null {
  const {
    system,
    voltage,
    power,
    userCurrent,
    powerFactor,
    efficiency,
    length,
    section,
    material,
    temperature,
    permissibleDrop,
  } = params;

  if (voltage <= 0 || length <= 0 || section <= 0) {
    return null;
  }

  const cosphi = Math.min(1, Math.max(0.2, powerFactor));
  const eta = Math.min(1, Math.max(0.5, efficiency));

  const loadCurrent =
    userCurrent > 0
      ? userCurrent
      : system === 'threephase'
      ? (power * 1000) / (Math.sqrt(3) * voltage * cosphi * eta)
      : (power * 1000) / (voltage * cosphi * eta);

  if (!Number.isFinite(loadCurrent) || loadCurrent <= 0) {
    return null;
  }

  const baseRho = baseResistivity[material];
  const alpha = tempCoefficient[material];
  const resistivity = baseRho * (1 + alpha * (temperature - 20));

  const circuitFactor = system === 'threephase' ? Math.sqrt(3) : 2;

  const voltageDropVolts =
    (circuitFactor * resistivity * length * loadCurrent) / section;
  const voltageDropPercent = (voltageDropVolts / voltage) * 100;
  const loadVoltage = voltage - voltageDropVolts;

  const allowableDropVolts = (voltage * permissibleDrop) / 100;
  const compliant = voltageDropVolts <= allowableDropVolts;

  const maxLength =
    (allowableDropVolts * section) / (circuitFactor * resistivity * loadCurrent);

  const altSections = standardSections.map((sec) => {
    const dropV = (circuitFactor * resistivity * length * loadCurrent) / sec;
    const dropP = (dropV / voltage) * 100;
    return {
      section: sec,
      dropVolts: dropV,
      dropPercent: dropP,
      compliant: dropV <= allowableDropVolts,
    };
  });

  const recommendedSection =
    altSections.find((sec) => sec.compliant)?.section ?? null;

  const summary: CalculationResult['summary'] = [
    { label: 'Corrente di progetto Ib', value: `${round(loadCurrent, 2)} A` },
    { label: 'Resistività equivalente ρ', value: `${round(resistivity, 4)} Ω·mm²/m` },
    {
      label: 'Caduta di tensione ΔV',
      value: `${round(voltageDropVolts, 2)} V (${round(voltageDropPercent, 2)} %)`,
    },
    {
      label: 'Tensione al carico',
      value: `${round(loadVoltage, 1)} V`,
    },
    {
      label: 'Limite normativo',
      value: `${round(allowableDropVolts, 2)} V (${round(permissibleDrop, 2)} %)`,
    },
    {
      label: 'Lunghezza massima ammessa',
      value: `${round(maxLength, 1)} m`,
    },
  ];

  const warnings: string[] = [];
  if (!compliant) {
    warnings.push(
      `La caduta di tensione supera il limite impostato (${round(
        voltageDropPercent,
        2
      )}% > ${round(permissibleDrop, 2)}%).`
    );
  }
  if (recommendedSection && recommendedSection > section + 0.1) {
    warnings.push(
      `Considera di aumentare la sezione almeno a ${recommendedSection} mm² per rientrare nel limite.`
    );
  }
  if (temperature >= 70) {
    warnings.push(
      'Resistività elevata: verifica che il cavo sia idoneo per la temperatura operativa indicata.'
    );
  }

  return {
    loadCurrent,
    resistivity,
    voltageDropVolts,
    voltageDropPercent,
    loadVoltage,
    allowableDropVolts,
    compliant,
    maxLength,
    recommendedSection,
    summary,
    altSections,
    warnings,
  };
}

export default function VoltageDropCalculator() {
  const [system, setSystem] = useState<SystemType>('threephase');
  const [voltage, setVoltage] = useState('400');
  const [power, setPower] = useState('45');
  const [userCurrent, setUserCurrent] = useState('0');
  const [powerFactor, setPowerFactor] = useState('0.9');
  const [efficiency, setEfficiency] = useState('0.95');
  const [length, setLength] = useState('30');
  const [section, setSection] = useState('16');
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [temperature, setTemperature] = useState('40');
  const [dropPreset, setDropPreset] = useState<DropPreset>('general');
  const [permissibleDrop, setPermissibleDrop] = useState('4');

  const numericDrop = useMemo(() => {
    const value = toNumber(permissibleDrop, 4);
    return Math.min(10, Math.max(1, value));
  }, [permissibleDrop]);

  const result = useMemo(
    () =>
      computeVoltageDrop({
        system,
        voltage: toNumber(voltage),
        power: Math.max(0, toNumber(power)),
        userCurrent: Math.max(0, toNumber(userCurrent)),
        powerFactor: toNumber(powerFactor),
        efficiency: toNumber(efficiency),
        length: Math.max(0.1, toNumber(length)),
        section: Math.max(0.1, toNumber(section)),
        material,
        temperature: Math.max(-10, toNumber(temperature)),
        permissibleDrop: numericDrop,
      }),
    [
      system,
      voltage,
      power,
      userCurrent,
      powerFactor,
      efficiency,
      length,
      section,
      material,
      temperature,
      numericDrop,
    ]
  );

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri di linea per la caduta di tensione
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Valuta la caduta di tensione su circuiti monofase e trifase secondo CEI 64-8 impostando
          geometria, carichi e condizioni di esercizio della linea.
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
                  Tensione a monte (V)
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
                  Se diverso da 0 il calcolo usa questo valore al posto della potenza.
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
                  min="0.2"
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
                  min="0.5"
                  max="1"
                  step="0.01"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="length" className="calculator-label">
                  Lunghezza tratta (m)
                </label>
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
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="section" className="calculator-label">
                  Sezione cavo (mm²)
                </label>
                <input
                  id="section"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={section}
                  onChange={(event) => setSection(event.target.value)}
                  list="sections"
                  className="calculator-input"
                />
                <datalist id="sections">
                  {standardSections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
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
              <div>
                <label htmlFor="dropPreset" className="calculator-label">
                  Limite caduta tensione
                </label>
                <select
                  id="dropPreset"
                  value={dropPreset}
                  onChange={(event) => {
                    const value = event.target.value as DropPreset;
                    setDropPreset(value);
                    if (value === 'general') {
                      setPermissibleDrop('4');
                    } else if (value === 'lighting') {
                      setPermissibleDrop('3');
                    }
                  }}
                  className="calculator-input"
                >
                  <option value="general">Impianti di forza motrice (4%)</option>
                  <option value="lighting">Impianti di illuminazione (3%)</option>
                  <option value="custom">Personalizzato</option>
                </select>
                {dropPreset === 'custom' && (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={permissibleDrop}
                    onChange={(event) => setPermissibleDrop(event.target.value)}
                    className="calculator-input mt-2"
                    aria-label="Caduta massima personalizzata (%)"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <>
          <section className="section-card border-green-100">
            <h2 className="text-2xl font-semibold text-gray-900">Risultati principali</h2>
            <p className="mt-1 text-sm text-gray-600">
              Verifica immediatamente la conformità della linea confrontando la caduta di tensione con i
              limiti CEI 64-8 e valuta la lunghezza massima ammessa.
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
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {result.compliant
                  ? 'Linea conforme al limite di caduta impostato'
                  : 'Attenzione: caduta di tensione oltre il limite'}
              </span>
              {result.recommendedSection && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
                  Sezione consigliata ≥ {result.recommendedSection} mm²
                </span>
              )}
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
            <h2 className="text-2xl font-semibold text-gray-900">Confronto tra sezioni standard</h2>
            <p className="mt-1 text-sm text-gray-600">
              La tabella mostra la caduta di tensione ottenuta con le principali sezioni commerciali. Le
              righe evidenziate soddisfano il limite selezionato.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Sezione (mm²)</th>
                    <th className="px-4 py-3 text-left font-semibold">ΔV (V)</th>
                    <th className="px-4 py-3 text-left font-semibold">ΔV (%)</th>
                    <th className="px-4 py-3 text-left font-semibold">Esito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-700">
                  {result.altSections.map((section) => (
                    <tr
                      key={section.section}
                      className={
                        section.section === result.recommendedSection
                          ? 'bg-green-50 font-semibold'
                          : section.compliant
                          ? 'bg-green-50/60'
                          : undefined
                      }
                    >
                      <td className="px-4 py-3">{section.section.toFixed(1)} mm²</td>
                      <td className="px-4 py-3">{round(section.dropVolts, 2)} V</td>
                      <td className="px-4 py-3">{round(section.dropPercent, 2)} %</td>
                      <td className="px-4 py-3">
                        {section.compliant ? (
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
            <h2 className="text-2xl font-semibold text-gray-900">Formule utilizzate</h2>
            <p className="text-sm text-gray-600">
              Il dimensionamento segue le prescrizioni della CEI 64-8, Cap. 52 e della Guida CEI 64-50.
              Le grandezze sono espresse nel sistema SI con sezione in mm² e lunghezza in metri.
            </p>
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
              <p>
                <strong>Corrente di progetto Ib</strong>:{' '}
                <code>
                  Ib =
                  {` `}
                  {`{P · 1000}`}/{system === 'threephase' ? '√3 · V · cosφ · η' : 'V · cosφ · η'}
                </code>
              </p>
              <p>
                <strong>Resistività equivalente</strong>:{' '}
                <code>ρ = ρ₂₀ · [1 + α · (θ - 20)]</code>
              </p>
              <p>
                <strong>Caduta di tensione</strong>:{' '}
                <code>ΔV = k · ρ · L · Ib / S</code> con k = 2 (monofase) oppure k = √3 (trifase).
              </p>
              <p>
                <strong>Lunghezza massima ammessa</strong>:{' '}
                <code>Lₘₐₓ = (ΔVₐₘₘ · S) / (k · ρ · Ib)</code>
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">Assunzioni e limiti</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Cavi unipolari posati con ritorno nel neutro o nelle altre fasi.</li>
                <li>Temperatura uniforme lungo la tratta e fattori correttivi della CEI 64-8 non cumulati.</li>
                <li>Non considera l&apos;impedenza reattiva per linee con elevata componente induttiva.</li>
              </ul>
            </div>
          </section>

          <section className="section-card space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Suggerimenti operativi</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Verifica la tipologia dell&apos;utenza (illuminazione o forza motrice) e imposta il limite CEI.</li>
              <li>Analizza la tabella sezioni per scegliere la prima soluzione conforme con margine ≥ 10%.</li>
              <li>
                In presenza di avviamenti motore valuta l&apos;incremento della sezione o l&apos;uso di soft starter per
                contenere le cadute temporanee.
              </li>
              <li>
                Riporta nel verbale di verifica i parametri adottati: sezione, materiale, lunghezza, temperatura e
                riferimento normativo.
              </li>
            </ol>

            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Disclaimer professionale</p>
              <p className="mt-1">
                I risultati supportano la progettazione ma non sostituiscono le verifiche previste dal DM 37/2008 e
                dalle norme CEI applicabili. Effettua sempre un controllo finale sulla selettività delle protezioni e
                sulla compatibilità con le temperature di esercizio dichiarate dal costruttore del cavo.
              </p>
            </div>
          </section>

          <section className="section-card space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Feedback da studi professionali</h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="rounded-lg border border-gray-200 p-4">
                “Il confronto immediato tra sezioni e lunghezze critiche semplifica la scelta della dorsale nei
                cantieri industriali.”
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Ing. Francesca V., progettista impianti BT
                </span>
              </li>
              <li className="rounded-lg border border-gray-200 p-4">
                “Ottimo avere formule, limiti CEI e note operative nella stessa pagina: facilita l&apos;inserimento nel
                verbale di verifica.”
                <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
                  Per. Ind. Marco L., studio quadri elettrici
                </span>
              </li>
            </ul>
          </section>
        </>
      ) : (
        <section className="section-card border border-dashed border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900">
            Inserisci i dati per calcolare la caduta di tensione
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Compila potenza o corrente, sezione e lunghezza della linea per verificare il rispetto dei limiti CEI 64-8 e
            stimare la lunghezza massima ammessa.
          </p>
        </section>
      )}

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">Norme e riferimenti tecnici</h2>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>CEI 64-8 (ed. 2023) – Cap. 52, scelta e posa dei componenti elettrici.</li>
          <li>Guida CEI 64-50 – Limiti consigliati di caduta di tensione in BT.</li>
          <li>CEI UNEL 35024 – Tabelle di portata per cavi isolati in PVC.</li>
          <li>DM 37/2008 – Obblighi di verifica e dichiarazione di conformità degli impianti.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Elettrotecnica"
        reviewedBy="Ing. Ugo Candido (Ordine Udine n. 2389)"
        lastReviewDate="2025-03-09"
        referenceStandard="CEI 64-8, Guida CEI 64-50, CEI UNEL 35024, DM 37/2008"
      />
    </div>
  );
}
