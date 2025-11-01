'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type StartingMethod = 'dol' | 'star_delta' | 'autotransformer' | 'soft_starter' | 'vfd' | 'custom';

type StartingMethodInfo = {
  label: string;
  defaultRatio: number;
  torqueFactor: number;
  description: string;
};

const startingMethodConfig: Record<StartingMethod, StartingMethodInfo> = {
  dol: {
    label: 'Avviamento diretto (DOL)',
    defaultRatio: 6,
    torqueFactor: 1,
    description: 'Corrente di spunto pari a 5-7 volte In, coppia di avviamento al 100% della coppia nominale.',
  },
  star_delta: {
    label: 'Avviamento stella-triangolo',
    defaultRatio: 2.2,
    torqueFactor: 0.33,
    description: 'Riduce corrente e coppia a circa un terzo. Applicabile a motori predisposti per doppia tensione.',
  },
  autotransformer: {
    label: 'Avviamento con autotrasformatore (65%)',
    defaultRatio: 2.5,
    torqueFactor: 0.42,
    description: 'Limita la corrente in base al rapporto di tensione. Spunto e coppia intermedia fra DOL e stella-triangolo.',
  },
  soft_starter: {
    label: 'Soft starter (rampe di tensione)',
    defaultRatio: 3,
    torqueFactor: 0.6,
    description: 'Limita la tensione in avviamento con controllo elettronico. Coppia dipendente dal profilo impostato.',
  },
  vfd: {
    label: 'Inverter / VFD',
    defaultRatio: 1.1,
    torqueFactor: 1,
    description: 'Avviamento a frequenza variabile: corrente prossima alla nominale con coppia controllata.',
  },
  custom: {
    label: 'Imposto manualmente',
    defaultRatio: 5,
    torqueFactor: 1,
    description: 'Definisci manualmente il rapporto Iavv/In in base ai dati del costruttore.',
  },
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

interface CalculationResult {
  ratedCurrent: number;
  startCurrent: number;
  ratio: number;
  ratedApparentPower: number;
  startApparentPower: number;
  torqueFactor: number;
  recommendedBreaker: number;
  magneticSetting: number;
  shortCircuitCurrent: number | null;
  voltageDip: number | null;
  networkPowerMVA: number | null;
}

export default function MotorInrushCalculator() {
  const [power, setPower] = useState('55'); // kW
  const [voltage, setVoltage] = useState('400');
  const [efficiency, setEfficiency] = useState('0.93');
  const [powerFactor, setPowerFactor] = useState('0.85');
  const [startingMethod, setStartingMethod] = useState<StartingMethod>('dol');
  const [startCurrentRatio, setStartCurrentRatio] = useState('6');
  const [startTime, setStartTime] = useState('6');
  const [startsPerHour, setStartsPerHour] = useState('4');
  const [shortCircuitPower, setShortCircuitPower] = useState('0');
  const [shortCircuitPowerUnit, setShortCircuitPowerUnit] = useState<'MVA' | 'kVA'>('MVA');

  useEffect(() => {
    if (startingMethod !== 'custom') {
      setStartCurrentRatio(startingMethodConfig[startingMethod].defaultRatio.toString());
    }
  }, [startingMethod]);

  const numericInputs = useMemo(() => {
    const p = Math.max(0, toNumber(power, 0));
    const v = Math.max(0, toNumber(voltage, 0));
    const eta = clamp(toNumber(efficiency, 0.93), 0.5, 0.99);
    const cosphi = clamp(toNumber(powerFactor, 0.85), 0.4, 1);
    const ratio = Math.max(1, toNumber(startCurrentRatio, startingMethodConfig[startingMethod].defaultRatio));
    const tStart = Math.max(0, toNumber(startTime, 5));
    const starts = Math.max(0, toNumber(startsPerHour, 3));
    const scPowerValue = Math.max(0, toNumber(shortCircuitPower, 0));

    return {
      p,
      v,
      eta,
      cosphi,
      ratio,
      tStart,
      starts,
      scPowerValue,
    };
  }, [
    power,
    voltage,
    efficiency,
    powerFactor,
    startCurrentRatio,
    startTime,
    startsPerHour,
    shortCircuitPower,
    startingMethod,
  ]);

  const result = useMemo<CalculationResult | null>(() => {
    const { p, v, eta, cosphi, ratio, scPowerValue } = numericInputs;
    if (p <= 0 || v <= 0 || eta <= 0 || cosphi <= 0) {
      return null;
    }

    const ratedCurrent = (p * 1000) / (Math.sqrt(3) * v * eta * cosphi);
    if (!Number.isFinite(ratedCurrent) || ratedCurrent <= 0) {
      return null;
    }

    const startCurrent = ratedCurrent * ratio;
    const ratedApparentPower = (Math.sqrt(3) * v * ratedCurrent) / 1000;
    const startApparentPower = (Math.sqrt(3) * v * startCurrent) / 1000;
    const torqueFactor = startingMethodConfig[startingMethod].torqueFactor;
    const recommendedBreaker = Math.ceil(ratedCurrent * 1.25);
    const magneticSetting = Math.ceil(startCurrent * 1.1);

    let shortCircuitCurrent: number | null = null;
    let voltageDip: number | null = null;
    let networkPowerMVA: number | null = null;

    if (scPowerValue > 0) {
      const multiplier = shortCircuitPowerUnit === 'MVA' ? 1_000_000 : 1_000;
      const skVA = scPowerValue * multiplier;
      const ik = skVA / (Math.sqrt(3) * v);
      if (Number.isFinite(ik) && ik > 0) {
        shortCircuitCurrent = ik;
        voltageDip = (startCurrent / ik) * 100;
        networkPowerMVA = shortCircuitPowerUnit === 'MVA' ? scPowerValue : scPowerValue / 1000;
      }
    }

    return {
      ratedCurrent,
      startCurrent,
      ratio,
      ratedApparentPower,
      startApparentPower,
      torqueFactor,
      recommendedBreaker,
      magneticSetting,
      shortCircuitCurrent,
      voltageDip,
      networkPowerMVA,
    };
  }, [numericInputs, shortCircuitPowerUnit, startingMethod]);

  const warnings = useMemo(() => {
    const list: string[] = [];
    if (!result) {
      return list;
    }

    if (result.ratio > 7) {
      list.push(
        `Rapporto di spunto pari a ${round(result.ratio, 2)}·In: verifica i dati del costruttore o valuta un sistema di avviamento morbido per ridurre la corrente di picco.`
      );
    }

    if (result.voltageDip !== null && result.voltageDip > 15) {
      list.push(
        `Caduta di tensione stimata ${round(result.voltageDip, 1)}%: supera il limite raccomandato del 15% (CEI EN 61000-3-11). Valuta soluzioni di avviamento graduale o un potenziamento della rete.`
      );
    }

    if (numericInputs.starts > 6 && numericInputs.tStart > 10) {
      list.push(
        `Numero di avviamenti (${numericInputs.starts} avv/h) e durata (${numericInputs.tStart} s) elevati: verifica il rispetto delle curve a caldo del costruttore (CEI EN 60034-1).`
      );
    }

    if (result.magneticSetting > 630 && result.ratedCurrent < 100) {
      list.push(
        'La regolazione magnetica stimata è molto superiore alla corrente nominale: considera protezioni con sgancio di tipo D o avviamento ridotto.'
      );
    }

    return list;
  }, [result, numericInputs.starts, numericInputs.tStart]);

  const assumptions = useMemo(() => {
    const base = [
      'Motore asincrono trifase alimentato a tensione sinusoidale costante.',
      'Calcolo della corrente nominale secondo CEI EN 60034-1 (P = √3 · V · I · η · cosφ).',
      'Il fattore di spunto impostato è riferito alla corrente di linea durante l’avviamento.',
      'La caduta di tensione è stimata con il metodo della potenza di corto circuito Sk e non sostituisce un calcolo elettrotecnico di dettaglio.',
    ];
    if (startingMethod === 'star_delta') {
      base.push('L’avviamento stella-triangolo è valido solo per motori predisposti 400/690 V con collegamento a triangolo in servizio permanente.');
    }
    if (startingMethod === 'vfd') {
      base.push('Per inverter la corrente di spunto coincidente con la nominale presuppone una corretta parametrizzazione (rampe di frequenza e limitazione di coppia).');
    }
    return base;
  }, [startingMethod]);

  const summary = useMemo(() => {
    if (!result) {
      return [];
    }
    return [
      { label: 'Corrente nominale In', value: `${round(result.ratedCurrent, 2)} A` },
      { label: 'Corrente di avviamento Iavv', value: `${round(result.startCurrent, 2)} A (${round(result.ratio, 2)} · In)` },
      { label: 'Potenza apparente a regime', value: `${round(result.ratedApparentPower, 1)} kVA` },
      { label: 'Potenza apparente in avviamento', value: `${round(result.startApparentPower, 1)} kVA` },
      { label: 'Taratura termica consigliata', value: `${round(result.ratedCurrent, 2)} A` },
      { label: 'Taratura magnetica stimata', value: `${round(result.magneticSetting, 0)} A` },
    ];
  }, [result]);

  const advisoryNotes = useMemo(() => {
    if (!result) {
      return [];
    }
    const notes: string[] = [];
    notes.push('Regola la protezione in sovraccarico a In e verifica il coordinamento con il cavo secondo CEI 64-8 art. 433.');
    if (startingMethod === 'dol') {
      notes.push('Per ridurre i transitori valuta soluzioni alternative (stella-triangolo, soft starter) quando la rete non sopporta il picco calcolato.');
    }
    if (startingMethod === 'vfd') {
      notes.push('Con inverter controlla la classe di sovraccarico (ex IEC 61800-2) per garantire coppia sufficiente durante l’avviamento.');
    }
    if (result.networkPowerMVA && result.networkPowerMVA < (result.startApparentPower / 10)) {
      notes.push('La potenza di corto circuito impostata è bassa rispetto alla potenza di spunto: verifica l’impatto sugli altri carichi sensibili.');
    }
    return notes;
  }, [result, startingMethod]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">Parametri del motore</h2>
        <p className="mt-1 text-sm text-gray-600">
          Inserisci i dati di targa del motore asincrono e seleziona la strategia di avviamento. Il tool calcola
          la corrente nominale, la corrente di spunto e l&apos;assorbimento in kVA, fornendo suggerimenti per la taratura delle protezioni
          e per la verifica della rete di alimentazione secondo CEI EN 60034-12.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="power" className="calculator-label">
                  Potenza nominale P<sub>n</sub> (kW)
                </label>
                <input
                  id="power"
                  type="number"
                  min="0.55"
                  step="0.1"
                  value={power}
                  onChange={(event) => setPower(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="voltage" className="calculator-label">
                  Tensione linea-linea (V)
                </label>
                <input
                  id="voltage"
                  type="number"
                  min="200"
                  step="10"
                  value={voltage}
                  onChange={(event) => setVoltage(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="efficiency" className="calculator-label">
                  Rendimento η
                </label>
                <input
                  id="efficiency"
                  type="number"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={efficiency}
                  onChange={(event) => setEfficiency(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Usa il valore del costruttore (classe IE3 tipicamente 0,92-0,95).</p>
              </div>
              <div>
                <label htmlFor="powerFactor" className="calculator-label">
                  cos&nbsp;φ nominale
                </label>
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
                <p className="mt-1 text-xs text-gray-500">Tipicamente 0,82-0,9 per motori asincroni standard.</p>
              </div>
            </div>

            <div>
              <label htmlFor="startingMethod" className="calculator-label">
                Metodo di avviamento
              </label>
              <select
                id="startingMethod"
                value={startingMethod}
                onChange={(event) => setStartingMethod(event.target.value as StartingMethod)}
                className="calculator-input"
              >
                {Object.entries(startingMethodConfig).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">{startingMethodConfig[startingMethod].description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startCurrentRatio" className="calculator-label">
                  Rapporto I<sub>avv</sub> / I<sub>n</sub>
                </label>
                <input
                  id="startCurrentRatio"
                  type="number"
                  min="1"
                  max="12"
                  step="0.1"
                  value={startCurrentRatio}
                  onChange={(event) => setStartCurrentRatio(event.target.value)}
                  className="calculator-input"
                  disabled={startingMethod !== 'custom'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {startingMethod === 'custom'
                    ? 'Inserisci il valore fornito dal costruttore.'
                    : `Valore preimpostato in base alla strategia (${startingMethodConfig[startingMethod].defaultRatio.toFixed(1)} · In).`}
                </p>
              </div>
              <div>
                <label htmlFor="startTime" className="calculator-label">
                  Tempo di avviamento (s)
                </label>
                <input
                  id="startTime"
                  type="number"
                  min="1"
                  step="0.5"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Durata stimata dell&apos;avviamento completo a pieno carico.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startsPerHour" className="calculator-label">
                  Avviamenti per ora
                </label>
                <input
                  id="startsPerHour"
                  type="number"
                  min="1"
                  step="1"
                  value={startsPerHour}
                  onChange={(event) => setStartsPerHour(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Confronta con le curve di avviamento a caldo del costruttore.</p>
              </div>
              <div>
                <label htmlFor="shortCircuitPower" className="calculator-label">
                  Potenza di corto circuito Sk
                </label>
                <div className="flex gap-2">
                  <input
                    id="shortCircuitPower"
                    type="number"
                    min="0"
                    step="0.1"
                    value={shortCircuitPower}
                    onChange={(event) => setShortCircuitPower(event.target.value)}
                    className="calculator-input flex-1"
                  />
                  <select
                    value={shortCircuitPowerUnit}
                    onChange={(event) => setShortCircuitPowerUnit(event.target.value as 'MVA' | 'kVA')}
                    className="calculator-input w-24"
                  >
                    <option value="MVA">MVA</option>
                    <option value="kVA">kVA</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">Facoltativo: potenza di corto circuito disponibile sul quadro di alimentazione.</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Suggerimenti rapidi</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Recupera cos φ, η e Iavv dal datasheet IEC del costruttore per risultati accurati.</li>
              <li>Per motori oltre 75 kW valuta l&apos;impatto della corrente di spunto sulla cabina MT/BT.</li>
              <li>Se utilizzi inverter, verifica la corrente di uscita nominale e la classe di sovraccarico (IEC 61800-2).</li>
            </ul>
          </div>
        </div>
      </section>

      {result ? (
        <section className="section-card border-green-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Risultati principali</h3>
              <p className="text-sm text-gray-600">
                Correnti, potenze apparenti e tarature di protezione stimate per il motore inserito. I valori sono calcolati secondo CEI EN 60034-1 e CEI EN 60034-12.
              </p>
            </div>
            <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Coppia di avviamento ≈ {Math.round(startingMethodConfig[startingMethod].torqueFactor * 100)}% T<sub>n</sub>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {summary.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-gray-500">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Protezione consigliata</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                In termica ≈ {round(result.ratedCurrent, 1)} A • In magnetica ≈ {round(result.magneticSetting, 0)} A
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Usa interruttori curva D o relè motore con sgancio ritardato per evitare scatti intempestivi.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Caduta di tensione in avviamento</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {result.voltageDip !== null ? `${round(result.voltageDip, 1)}%` : 'Sk non inserita'}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {result.shortCircuitCurrent
                  ? `Icc disponibile ≈ ${round(result.shortCircuitCurrent, 0)} A`
                  : 'Inserisci Sk per stimare l’impatto sulla rete.'}
              </p>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-semibold text-amber-800">Avvertenze progettuali</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {advisoryNotes.length > 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-700">
              <h4 className="text-base font-semibold text-gray-900">Approfondimenti consigliati</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {advisoryNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-700">
            <h4 className="text-base font-semibold text-gray-900">Assunzioni del modello</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section className="section-card border-amber-100">
          <h3 className="text-lg font-semibold text-gray-900">Compila i dati per avviare il calcolo</h3>
          <p className="mt-2 text-sm text-gray-600">
            Inserisci la potenza del motore, la tensione di alimentazione e il metodo di avviamento per ottenere le
            correnti di spunto e le tarature consigliate. Verifica che η e cos φ siano maggiori di zero.
          </p>
        </section>
      )}

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Formule applicate</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-600">
          <p>
            Corrente nominale: In = (P · 1000) / (√3 · V · η · cosφ).
          </p>
          <p>
            Corrente di spunto: Iavv = In · (Iavv/In) impostato in funzione del metodo di avviamento.
          </p>
          <p>
            Potenza apparente in avviamento: Savv = √3 · V · Iavv / 1000 (kVA).
          </p>
          <p>
            Caduta di tensione con potenza di corto circuito: ΔV% ≈ (Iavv / Ik) · 100 con Ik = Sk / (√3 · V).
          </p>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Riferimenti normativi</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>CEI EN 60034-1:2018 – Caratteristiche nominali e limiti per motori asincroni.</li>
          <li>CEI EN 60034-12:2017 – Avviamento dei motori asincroni trifase.</li>
          <li>CEI EN 61000-3-11 – Limiti di fluttuazioni di tensione e flicker per carichi con elevata corrente di spunto.</li>
          <li>IEC 61800-2 – Requisiti per convertitori di potenza a velocità variabile.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Completa la progettazione verificando selettività e coordinamento delle protezioni secondo CEI 64-8 e CEI 0-16,
          nonché l&apos;eventuale necessità di rifasamento automatico in presenza di motori a bassa potenza specifica.
        </p>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Limitazioni e buone pratiche</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Per motori speciali (sincroni, alta tensione, elevata inerzia) utilizzare le curve del costruttore.</li>
          <li>Le correnti calcolate non includono i contributi armonici generati da soft starter o inverter.</li>
          <li>Verifica l&apos;accoppiamento meccanico e il momento di inerzia per stimare accuratamente il tempo di avviamento.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Ing. Marco De Santis, Progettista impianti elettrici industriali"
        reviewedBy="Ing. Ugo Candido, Revisore Tecnico Capo"
        lastReviewDate="Marzo 2025"
        referenceStandard="CEI EN 60034-1, CEI EN 60034-12, CEI EN 61000-3-11"
      />

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Disclaimer professionale</h3>
        <p className="mt-2 text-sm text-gray-600">
          Le grandezze calcolate rappresentano una valutazione preliminare. Prima di scegliere dispositivi di protezione e soluzioni
          di avviamento, verifica i dati con le curve del costruttore e con simulazioni elettrotecniche dedicate. Calcolo.online
          non si assume responsabilità per utilizzi senza la supervisione di un professionista abilitato.
        </p>
      </section>
    </div>
  );
}
