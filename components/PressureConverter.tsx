'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type PressureUnitId =
  | 'pa'
  | 'kpa'
  | 'mpa'
  | 'bar'
  | 'mbar'
  | 'psi'
  | 'atm'
  | 'torr'
  | 'inh2o'
  | 'mmh2o'
  | 'kgcm2';

type Mode = 'absolute' | 'gauge';

type PressureUnit = {
  id: PressureUnitId;
  label: string;
  symbol: string;
  factorToPa: number;
  description: string;
};

type ConversionRow = {
  id: PressureUnitId;
  label: string;
  symbol: string;
  value: number;
  gaugeValue: number | null;
  description: string;
};

const pressureUnits: PressureUnit[] = [
  {
    id: 'pa',
    label: 'Pascal',
    symbol: 'Pa',
    factorToPa: 1,
    description: 'Unità SI di pressione (N/m²).',
  },
  {
    id: 'kpa',
    label: 'Kilopascal',
    symbol: 'kPa',
    factorToPa: 1_000,
    description: '1 kPa = 1 000 Pa. Usata in HVAC e pneumatici.',
  },
  {
    id: 'mpa',
    label: 'Megapascal',
    symbol: 'MPa',
    factorToPa: 1_000_000,
    description: '1 MPa = 1 000 000 Pa. Tipica per pressioni idrauliche.',
  },
  {
    id: 'bar',
    label: 'Bar',
    symbol: 'bar',
    factorToPa: 100_000,
    description: '1 bar = 10⁵ Pa. Diffusa in impianti industriali.',
  },
  {
    id: 'mbar',
    label: 'Millibar',
    symbol: 'mbar',
    factorToPa: 100,
    description: '1 mbar = 100 Pa. Utilizzata in meteorologia.',
  },
  {
    id: 'psi',
    label: 'Pound per square inch',
    symbol: 'psi',
    factorToPa: 6_894.757293168,
    description: 'Unità imperiale per pneumatici, oleodinamica e HVAC.',
  },
  {
    id: 'atm',
    label: 'Atmosfera standard',
    symbol: 'atm',
    factorToPa: 101_325,
    description: 'Pressione media atmosferica al livello del mare.',
  },
  {
    id: 'torr',
    label: 'Torr / mmHg',
    symbol: 'Torr',
    factorToPa: 133.322368421,
    description: 'Usata nel vuoto tecnico e in medicina.',
  },
  {
    id: 'inh2o',
    label: 'Pollice di colonna d’acqua',
    symbol: 'inH₂O',
    factorToPa: 249.0889,
    description: 'Utilizzata per ventilazione e impianti HVAC.',
  },
  {
    id: 'mmh2o',
    label: 'Millimetro di colonna d’acqua',
    symbol: 'mmH₂O',
    factorToPa: 9.80665,
    description: 'Pressioni molto basse in idraulica e filtrazione.',
  },
  {
    id: 'kgcm2',
    label: 'Chilogrammo forza al cm²',
    symbol: 'kgf/cm²',
    factorToPa: 98_066.5,
    description: 'Unità tradizionale in oleodinamica e collaudi.',
  },
];

function toNumber(value: string, fallback = 0): number {
  const numeric = Number(value.replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatValue(value: number, precision: number) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: precision,
  }).format(value);
}

function convertFromPa(pa: number, unit: PressureUnit) {
  return pa / unit.factorToPa;
}

export default function PressureConverter() {
  const [inputValue, setInputValue] = useState('1');
  const [inputUnit, setInputUnit] = useState<PressureUnitId>('bar');
  const [mode, setMode] = useState<Mode>('absolute');
  const [ambientPressure, setAmbientPressure] = useState('101.325'); // kPa
  const [precision, setPrecision] = useState('3');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selections = useMemo(() => {
    const baseValue = toNumber(inputValue, 0);
    const precisionDigits = Math.round(clamp(toNumber(precision, 3), 0, 6));
    const selectedUnit = pressureUnits.find((unit) => unit.id === inputUnit) ?? pressureUnits[0];
    const ambientPa = Math.max(0, toNumber(ambientPressure, 101.325)) * 1_000;
    const inputPa = baseValue * selectedUnit.factorToPa;
    const absolutePa = mode === 'gauge' ? inputPa + ambientPa : inputPa;
    const gaugePa = absolutePa - ambientPa;

    const rows: ConversionRow[] = pressureUnits.map((unit) => ({
      id: unit.id,
      label: unit.label,
      symbol: unit.symbol,
      description: unit.description,
      value: convertFromPa(absolutePa, unit),
      gaugeValue: mode === 'absolute' ? convertFromPa(gaugePa, unit) : mode === 'gauge' ? convertFromPa(inputPa, unit) : null,
    }));

    return {
      rows,
      absolutePa,
      gaugePa,
      ambientPa,
      precisionDigits,
      inputPa,
    };
  }, [inputValue, inputUnit, mode, ambientPressure, precision]);

  const pressureAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (mode === 'gauge') {
      const gaugeInput = toNumber(inputValue, 0);
      if (gaugeInput < 0) {
        alerts.push('Valore di pressione relativa negativo: verifica che la condizione di vuoto o depressione sia correttamente impostata.');
      }
      if (selections.absolutePa < 0) {
        alerts.push('La pressione assoluta risulta negativa. Controlla i dati inseriti (gauge + pressione atmosferica).');
      }
    }
    if (selections.absolutePa > 100_000_000) {
      alerts.push('Pressione superiore a 100 MPa: verifica l’unità di misura e considera gli effetti di compressibilità del fluido.');
    }
    return alerts;
  }, [mode, inputValue, selections.absolutePa]);

  const referenceTable = useMemo(
    () => [
      { context: 'Pressione atmosferica standard', value: 101.325, unit: 'kPa' },
      { context: 'Impianto idrico residenziale', value: 3, unit: 'bar' },
      { context: 'Circuito HVAC bassa pressione', value: 500, unit: 'Pa' },
      { context: 'Pneumatico autovettura', value: 2.4, unit: 'bar' },
      { context: 'Servo-oleodinamica', value: 12, unit: 'MPa' },
      { context: 'Pressione di prova UNI EN 805 (acquedotti)', value: 1.5, unit: '× pressione di esercizio' },
    ],
    []
  );

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">Convertitore di pressione</h2>
        <p className="mt-1 text-sm text-gray-600">
          Converti pressioni tra unità tecniche e SI (Pa, bar, psi, atm, Torr, colonna d’acqua). Le formule si basano sugli standard ISO 80000-4 e sui valori di conversione NIST. Seleziona se il dato è espresso come pressione assoluta o relativa (gauge) e imposta la pressione atmosferica di riferimento.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="inputValue" className="calculator-label">
                Valore da convertire
              </label>
              <input
                id="inputValue"
                type="number"
                inputMode="decimal"
                className="calculator-input"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="inputUnit" className="calculator-label">
                Unità origine
              </label>
              <select
                id="inputUnit"
                value={inputUnit}
                onChange={(event) => setInputUnit(event.target.value as PressureUnitId)}
                className="calculator-input"
              >
                {pressureUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="calculator-label">Modalità</label>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mode"
                    value="absolute"
                    checked={mode === 'absolute'}
                    onChange={() => setMode('absolute')}
                  />
                  Pressione assoluta
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mode"
                    value="gauge"
                    checked={mode === 'gauge'}
                    onChange={() => setMode('gauge')}
                  />
                  Pressione relativa (gauge)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <button
                type="button"
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                {showAdvanced ? 'Nascondi impostazioni avanzate' : 'Mostra impostazioni avanzate'}
              </button>
            </div>
            <div className={`${showAdvanced ? 'grid' : 'hidden'} gap-4 sm:grid-cols-2`}>
              <div>
                <label htmlFor="ambientPressure" className="calculator-label">
                  Pressione atmosferica (kPa)
                </label>
                <input
                  id="ambientPressure"
                  type="number"
                  min="60"
                  max="120"
                  step="0.1"
                  className="calculator-input"
                  value={ambientPressure}
                  onChange={(event) => setAmbientPressure(event.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">Valore standard: 101,325 kPa (livello del mare). Imposta il valore locale per conversioni gauge.</p>
              </div>
              <div>
                <label htmlFor="precision" className="calculator-label">
                  Cifre decimali
                </label>
                <input
                  id="precision"
                  type="number"
                  min="0"
                  max="6"
                  step="1"
                  className="calculator-input"
                  value={precision}
                  onChange={(event) => setPrecision(event.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">Imposta la precisione di arrotondamento per la tabella conversioni.</p>
              </div>
            </div>
            <div className="rounded-md border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">Suggerimenti rapidi</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Utilizza pressioni assolute per calcoli termodinamici (legge dei gas, compressori).</li>
                <li>Le pressioni gauge vanno convertite aggiungendo la pressione atmosferica del sito di misura.</li>
                <li>Per pressioni molto basse (&lt; 10 Pa) considera gli effetti della temperatura sulle letture.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card border-green-100">
        <h3 className="text-xl font-semibold text-gray-900">Tabella conversioni</h3>
        <p className="text-sm text-gray-600">
          Valori calcolati con riferimento all’unità SI (Pascal). La colonna “relativa” è disponibile quando imposti una pressione gauge.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Unità</th>
                <th className="px-3 py-2">Valore assoluto</th>
                <th className="px-3 py-2">Valore relativo</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {selections.rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {row.label} ({row.symbol})
                  </td>
                  <td className="px-3 py-2">
                    {formatValue(row.value, selections.precisionDigits)}
                  </td>
                  <td className="px-3 py-2">
                    {mode === 'absolute'
                      ? formatValue(row.gaugeValue ?? 0, selections.precisionDigits)
                      : mode === 'gauge'
                      ? formatValue(row.gaugeValue ?? 0, selections.precisionDigits)
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pressureAlerts.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-semibold text-amber-800">Avvertenze</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-700">
              {pressureAlerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Valori di riferimento rapidi</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Applicazione</th>
                <th className="px-3 py-2">Pressione tipica</th>
              </tr>
            </thead>
            <tbody>
              {referenceTable.map((item) => (
                <tr key={item.context} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-900">{item.context}</td>
                  <td className="px-3 py-2">{item.value} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Formule di conversione</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-600">
          <p>Unità SI: 1 Pa = 1 N/m². La conversione tra unità avviene tramite fattori di moltiplicazione certificati NIST.</p>
          <p>Pressione gauge: P<sub>ass</sub> = P<sub>gage</sub> + P<sub>atm</sub>. Inserisci P<sub>atm</sub> coerente con la quota del sito.</p>
          <p>1 bar = 100 000 Pa, 1 psi = 6 894.757 Pa, 1 atm = 101 325 Pa, 1 Torr = 133.322 Pa, 1 inH₂O = 249.089 Pa.</p>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Riferimenti normativi</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>ISO 80000-4:2020 – Grandezze e unità, parte 4: Meccanica.</li>
          <li>NIST Special Publication 811 – Guide for the Use of the International System of Units (SI).</li>
          <li>UNI EN 837-1 – Strumenti per pressione: requisiti per manometri a tubo Bourdon.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Per verifiche di sicurezza sugli impianti utilizzare anche UNI EN 13445 (recipienti a pressione) e la Direttiva PED 2014/68/UE. Adottare strumenti tarati e certificati quando si effettuano misure ufficiali.
        </p>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Limitazioni e buone pratiche</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>I fattori di conversione adottati sono validi a 20 °C; variazioni di temperatura influenzano densità e colonne di liquido.</li>
          <li>Per pressioni pulsanti o dinamiche utilizzare strumenti con risposta rapida e filtri.</li>
          <li>Quando convertono pressioni parziali di gas, considerare l’umidità e la composizione della miscela.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Ing. Martina Fabbri, Specialista strumentazione di processo"
        reviewedBy="Ing. Ugo Candido, Revisore Tecnico Capo"
        lastReviewDate="Marzo 2025"
        referenceStandard="ISO 80000-4, NIST SP 811, UNI EN 837-1"
      />

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Disclaimer professionale</h3>
        <p className="mt-2 text-sm text-gray-600">
          I valori forniti sono indicativi e non sostituiscono strumenti di misura certificati. Prima di emettere documentazione ufficiale o collaudi, verificare i dati con apparecchiature tarate e procedure interne di qualità.
        </p>
      </section>
    </div>
  );
}
