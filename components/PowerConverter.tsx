'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type PowerUnitId =
  | 'w'
  | 'kw'
  | 'mw'
  | 'hp'
  | 'cv'
  | 'bhp'
  | 'btu_h'
  | 'ton_ref';

interface PowerUnit {
  id: PowerUnitId;
  label: string;
  symbol: string;
  factorToWatt: number;
  description: string;
}

interface ConversionRow {
  id: PowerUnitId;
  label: string;
  symbol: string;
  value: number;
  description: string;
}

const powerUnits: PowerUnit[] = [
  {
    id: 'w',
    label: 'Watt',
    symbol: 'W',
    factorToWatt: 1,
    description: 'Unità SI di potenza (J/s).',
  },
  {
    id: 'kw',
    label: 'Kilowatt',
    symbol: 'kW',
    factorToWatt: 1_000,
    description: '1 kW = 1 000 W. Usata in impianti elettrici e motori industriali.',
  },
  {
    id: 'mw',
    label: 'Megawatt',
    symbol: 'MW',
    factorToWatt: 1_000_000,
    description: '1 MW = 1 000 000 W. Produzione elettrica, centrali e turbine.',
  },
  {
    id: 'hp',
    label: 'Horsepower (HP, US)',
    symbol: 'HP',
    factorToWatt: 745.6998715822702,
    description: 'Potenza nominale motori negli standard SAE/imperiali.',
  },
  {
    id: 'cv',
    label: 'Cavallo vapore (CV, metrico)',
    symbol: 'CV',
    factorToWatt: 735.49875,
    description: 'Potenza utilizzata in ambito automobilistico europeo (ch).',
  },
  {
    id: 'bhp',
    label: 'Brake horsepower (BHP)',
    symbol: 'bhp',
    factorToWatt: 745.6998715822702,
    description: 'Potenza misurata all’albero motore (SAE J1349).',
  },
  {
    id: 'btu_h',
    label: 'British thermal unit per ora',
    symbol: 'BTU/h',
    factorToWatt: 0.29307107,
    description: 'Climatizzazione e sistemi HVAC, conversione termica.',
  },
  {
    id: 'ton_ref',
    label: 'Ton of refrigeration',
    symbol: 'TR',
    factorToWatt: 3_517,
    description: '1 tonnellata di refrigerazione = 3,517 kW. Progettazione HVAC.',
  },
];

function toNumber(value: string, fallback = 0) {
  const numeric = Number(value.replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function format(value: number, digits: number) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('it-IT', {
    maximumFractionDigits: digits,
  }).format(value);
}

function convertFromWatt(watts: number, unit: PowerUnit) {
  return watts / unit.factorToWatt;
}

export default function PowerConverter() {
  const [inputValue, setInputValue] = useState('15');
  const [inputUnit, setInputUnit] = useState<PowerUnitId>('kw');
  const [precision, setPrecision] = useState('3');
  const [efficiency, setEfficiency] = useState('0.92');
  const [rpm, setRpm] = useState('1500');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const conversions = useMemo(() => {
    const baseValue = toNumber(inputValue, 0);
    const selectedUnit = powerUnits.find((unit) => unit.id === inputUnit) ?? powerUnits[0];
    const watts = baseValue * selectedUnit.factorToWatt;
    const precisionDigits = Math.round(clamp(toNumber(precision, 3), 0, 6));

    const rows: ConversionRow[] = powerUnits.map((unit) => ({
      id: unit.id,
      label: unit.label,
      symbol: unit.symbol,
      description: unit.description,
      value: convertFromWatt(watts, unit),
    }));

    return {
      watts,
      rows,
      precisionDigits,
    };
  }, [inputValue, inputUnit, precision]);

  const advancedResults = useMemo(() => {
    const eta = clamp(toNumber(efficiency, 0.9), 0.01, 1);
    const rpmValue = Math.max(0, toNumber(rpm, 0));
    const mechanicalPowerKw = conversions.watts / 1000;
    const electricalInputKw = eta > 0 ? mechanicalPowerKw / eta : mechanicalPowerKw;
    const torqueNm = rpmValue > 0 ? (conversions.watts * 60) / (2 * Math.PI * rpmValue) : null;
    return {
      eta,
      rpmValue,
      mechanicalPowerKw,
      electricalInputKw,
      torqueNm,
    };
  }, [conversions.watts, efficiency, rpm]);

  const warnings = useMemo(() => {
    const list: string[] = [];
    if (conversions.watts > 10_000_000) {
      list.push('Potenza superiore a 10 MW: verifica che l’unità di origine sia corretta (forse dovevi utilizzare kW o MW).');
    }
    if (conversions.watts < 0) {
      list.push('Valore negativo: ricorda di indicare separatamente il verso del trasferimento di potenza.');
    }
    if (advancedResults.eta < 0.5) {
      list.push('Efficienza inferiore al 50%: controlla se si tratta di potenza utile (output) o assorbita (input).');
    }
    return list;
  }, [conversions.watts, advancedResults.eta]);

  const referenceValues = useMemo(
    () => [
      { context: 'Autovettura 100 kW', value: '≈ 134 CV (ch)' },
      { context: 'Motore industriale 18,5 kW', value: '≈ 25 HP' },
      { context: 'Unità HVAC da 3 TR', value: '≈ 10,5 kW' },
      { context: 'Microturbina 1 MW', value: '≈ 1341 HP' },
    ],
    []
  );

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">Convertitore di potenza (kW, HP, CV)</h2>
        <p className="mt-1 text-sm text-gray-600">
          Converte potenze tra unità SI e tradizionali seguendo i fattori di conversione ISO 80000-1 e NIST. Utile per confrontare motori elettrici, termici e impianti HVAC. Imposta opzionalmente efficienza e numero di giri per stimare la potenza assorbita e la coppia all’albero.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="inputValue" className="calculator-label">Valore da convertire</label>
              <input
                id="inputValue"
                type="number"
                inputMode="decimal"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div>
              <label htmlFor="inputUnit" className="calculator-label">Unità di origine</label>
              <select
                id="inputUnit"
                value={inputUnit}
                onChange={(event) => setInputUnit(event.target.value as PowerUnitId)}
                className="calculator-input"
              >
                {powerUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="precision" className="calculator-label">Cifre decimali</label>
              <input
                id="precision"
                type="number"
                min="0"
                max="6"
                step="1"
                value={precision}
                onChange={(event) => setPrecision(event.target.value)}
                className="calculator-input"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              {showAdvanced ? 'Nascondi impostazioni avanzate' : 'Mostra impostazioni avanzate'}
            </button>

            <div className={`${showAdvanced ? 'grid' : 'hidden'} gap-4 sm:grid-cols-2`}>
              <div>
                <label htmlFor="efficiency" className="calculator-label">Efficienza (η)</label>
                <input
                  id="efficiency"
                  type="number"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Inserisci l’efficienza del sistema per calcolare la potenza assorbita.</p>
              </div>
              <div>
                <label htmlFor="rpm" className="calculator-label">Velocità di rotazione (rpm)</label>
                <input
                  id="rpm"
                  type="number"
                  min="0"
                  step="10"
                  value={rpm}
                  onChange={(event) => setRpm(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Usata per stimare la coppia all’albero motore.</p>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">Suggerimenti rapidi</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Per motori elettrici trifase usa η tra 0,88 e 0,96 (classe IE3/IE4).</li>
                <li>1 CV (metric horsepower) = 0,7355 kW; 1 HP (US) = 0,7457 kW.</li>
                <li>Per pompe o ventilatori la coppia dipende da rpm e dalla curva di carico: verifica sempre i dati del costruttore.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card border-green-100">
        <h3 className="text-xl font-semibold text-gray-900">Tabella conversioni</h3>
        <p className="text-sm text-gray-600">Valori calcolati rispetto al Watt. I numeri sono arrotondati secondo la precisione impostata.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Unità</th>
                <th className="px-3 py-2">Valore</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {conversions.rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {row.label} ({row.symbol})
                  </td>
                  <td className="px-3 py-2">{format(row.value, conversions.precisionDigits)}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {warnings.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="text-sm font-semibold text-amber-800">Avvertenze</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-700">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Analisi prestazioni</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>
            <span className="font-medium text-gray-900">Potenza meccanica:</span>{' '}
            {format(advancedResults.mechanicalPowerKw, 3)} kW ({format(conversions.watts, 0)} W)
          </li>
          <li>
            <span className="font-medium text-gray-900">Potenza assorbita con η = {format(advancedResults.eta, 2)}:</span>{' '}
            {format(advancedResults.electricalInputKw, 3)} kW
          </li>
          <li>
            <span className="font-medium text-gray-900">Coppia stimata</span>{' '}
            {advancedResults.torqueNm !== null
              ? `${format(advancedResults.torqueNm, 2)} N·m a ${format(advancedResults.rpmValue, 0)} rpm`
              : '—'}
          </li>
        </ul>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Valori di riferimento</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Applicazione</th>
                <th className="px-3 py-2">Equivalenza</th>
              </tr>
            </thead>
            <tbody>
              {referenceValues.map((item) => (
                <tr key={item.context} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-900">{item.context}</td>
                  <td className="px-3 py-2">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Formule e fattori utilizzati</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-600">
          <p>P [W] = Valore · fattore di conversione. 1 kW = 1 000 W, 1 HP (US) = 745,6999 W, 1 CV = 735,49875 W, 1 BTU/h = 0,293071 W, 1 TR = 3,517 kW.</p>
          <p>Coppia T[N·m] = 9550 · P[kW] / n[rpm].</p>
          <p>Potenza assorbita = Potenza utile / η.</p>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Riferimenti normativi e fonti</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>ISO 80000-1:2022 – Grandezze e unità.</li>
          <li>NIST Special Publication 811 – Guide for the Use of the International System of Units (SI).</li>
          <li>IEC 60034-1 – Macchine elettriche rotanti (efficienza motori).</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Per restart up industriale confronta sempre i dati con le curve del costruttore e applica eventuali fattori di servizio previsti da NEMA MG1 o IEC 60034.
        </p>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Limitazioni e buone pratiche</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Le conversioni non tengono conto di variazioni dovute a temperatura o altitudine che incidono sulle prestazioni dei motori.</li>
          <li>Per valori ottenuti da prove dinamometriche utilizzare sempre strumenti calibrati e norme ISO 15550.</li>
          <li>Verifica il fattore di servizio e la capacità di sovraccarico se la macchina opera in regime intermittente.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Ing. Lorenzo Marchetti, Esperto motori elettrici e HVAC"
        reviewedBy="Ing. Ugo Candido, Revisore Tecnico Capo"
        lastReviewDate="Marzo 2025"
        referenceStandard="ISO 80000-1, IEC 60034-1, NIST SP 811"
      />

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Disclaimer professionale</h3>
        <p className="mt-2 text-sm text-gray-600">
          Le conversioni fornite hanno scopo informativo. Prima di redigere documentazione ufficiale o dimensionare macchine, confronta i risultati con le schede tecniche del costruttore e con le normative applicabili.
        </p>
      </section>
    </div>
  );
}
