'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

type UtilizationMode = 'auto' | 'manual';

type LightingScene = {
  id: string;
  label: string;
  recommendedLux: number;
  ugr?: number;
  note: string;
};

type CalculationResult = {
  area: number;
  roomIndex: number;
  utilizationFactor: number;
  maintenanceFactor: number;
  targetLux: number;
  rawLuminaires: number;
  luminaires: number;
  achievedLux: number;
  totalFlux: number;
  perFixtureFlux: number;
  powerPerFixture: number | null;
  totalPower: number | null;
  grid: {
    columns: number;
    rows: number;
    spacingX: number;
    spacingY: number;
    spacingRatioX: number | null;
    spacingRatioY: number | null;
  };
};

const lightingScenes: LightingScene[] = [
  {
    id: 'office-open-space',
    label: 'Ufficio open space',
    recommendedLux: 500,
    ugr: 19,
    note: 'UNI EN 12464-1, ambienti di lavoro su schermo',
  },
  {
    id: 'meeting-room',
    label: 'Sala riunioni',
    recommendedLux: 500,
    ugr: 19,
    note: 'UNI EN 12464-1, sale conferenze',
  },
  {
    id: 'corridor',
    label: 'Corridoi e vie di circolazione',
    recommendedLux: 100,
    ugr: 25,
    note: 'UNI EN 12464-1, circolazione interna',
  },
  {
    id: 'warehouse-picking',
    label: 'Magazzino con picking manuale',
    recommendedLux: 300,
    ugr: 22,
    note: 'UNI EN 12464-1, aree logistiche con movimentazione manuale',
  },
  {
    id: 'classroom',
    label: 'Aula / formazione',
    recommendedLux: 300,
    ugr: 19,
    note: 'UNI EN 12464-1, attività scolastiche',
  },
  {
    id: 'workshop',
    label: 'Laboratorio tecnico',
    recommendedLux: 750,
    ugr: 19,
    note: 'UNI EN 12464-1, attività di precisione medio-fine',
  },
  {
    id: 'custom',
    label: 'Imposta manualmente',
    recommendedLux: 0,
    note: 'Inserisci il livello di illuminamento richiesto (lux).',
  },
];

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

function estimateUtilizationFactor(params: {
  roomIndex: number;
  ceilingReflectance: number;
  wallReflectance: number;
  floorReflectance: number;
}): number {
  const { roomIndex, ceilingReflectance, wallReflectance, floorReflectance } = params;
  if (!Number.isFinite(roomIndex) || roomIndex <= 0) {
    return 0;
  }

  const k = clamp(roomIndex, 0.25, 6);
  const base = 0.25 + 0.5 * Math.tanh(0.8 * (k - 0.6));
  const ceiling = clamp(ceilingReflectance / 100, 0.1, 0.9);
  const walls = clamp(wallReflectance / 100, 0.1, 0.8);
  const floor = clamp(floorReflectance / 100, 0.05, 0.6);
  const reflectanceWeight = 0.5 * ceiling + 0.35 * walls + 0.15 * floor;
  const normalized = reflectanceWeight / (0.5 * 0.8 + 0.35 * 0.5 + 0.15 * 0.2);
  const uf = base * clamp(normalized, 0.6, 1.2);
  return clamp(uf, 0.25, 0.9);
}

function computeResult(params: {
  length: number;
  width: number;
  mountingHeight: number;
  workplaneHeight: number;
  maintenanceFactor: number;
  targetLux: number;
  luminaireFlux: number;
  luminousEfficacy: number | null;
  utilizationFactor: number;
}): CalculationResult | null {
  const {
    length,
    width,
    mountingHeight,
    workplaneHeight,
    maintenanceFactor,
    targetLux,
    luminaireFlux,
    luminousEfficacy,
    utilizationFactor,
  } = params;

  if (
    length <= 0 ||
    width <= 0 ||
    mountingHeight <= workplaneHeight ||
    maintenanceFactor <= 0 ||
    utilizationFactor <= 0 ||
    targetLux <= 0 ||
    luminaireFlux <= 0
  ) {
    return null;
  }

  const area = length * width;
  const hm = mountingHeight - workplaneHeight;
  const roomIndex = (length * width) / (hm * (length + width));

  const rawLuminaires = (targetLux * area) / (luminaireFlux * utilizationFactor * maintenanceFactor);
  const luminaires = Math.max(1, Math.ceil(rawLuminaires));
  const totalFlux = luminaires * luminaireFlux;
  const achievedLux = (totalFlux * utilizationFactor * maintenanceFactor) / area;

  const gridColumns = Math.max(1, Math.ceil(Math.sqrt((length / width) * luminaires)));
  const gridRows = Math.max(1, Math.ceil(luminaires / gridColumns));

  const spacingX = length / gridColumns;
  const spacingY = width / gridRows;
  const spacingRatioX = hm > 0 ? spacingX / hm : null;
  const spacingRatioY = hm > 0 ? spacingY / hm : null;

  let powerPerFixture: number | null = null;
  let totalPower: number | null = null;
  if (luminousEfficacy && luminousEfficacy > 0) {
    powerPerFixture = luminaireFlux / luminousEfficacy;
    totalPower = powerPerFixture * luminaires;
  }

  return {
    area,
    roomIndex,
    utilizationFactor,
    maintenanceFactor,
    targetLux,
    rawLuminaires,
    luminaires,
    achievedLux,
    totalFlux,
    perFixtureFlux: luminaireFlux,
    powerPerFixture,
    totalPower,
    grid: {
      columns: gridColumns,
      rows: gridRows,
      spacingX,
      spacingY,
      spacingRatioX,
      spacingRatioY,
    },
  };
}

export default function IlluminanceLampsCalculator() {
  const [length, setLength] = useState('12');
  const [width, setWidth] = useState('8');
  const [mountingHeight, setMountingHeight] = useState('3.2');
  const [workplaneHeight, setWorkplaneHeight] = useState('0.8');
  const [selectedScene, setSelectedScene] = useState<LightingScene>(lightingScenes[0]);
  const [targetLux, setTargetLux] = useState('500');
  const [luminaireFlux, setLuminaireFlux] = useState('3600');
  const [luminousEfficacy, setLuminousEfficacy] = useState('130');
  const [maintenanceFactor, setMaintenanceFactor] = useState('0.8');
  const [utilizationMode, setUtilizationMode] = useState<UtilizationMode>('auto');
  const [manualUF, setManualUF] = useState('0.6');
  const [ceilingReflectance, setCeilingReflectance] = useState('70');
  const [wallReflectance, setWallReflectance] = useState('50');
  const [floorReflectance, setFloorReflectance] = useState('20');

  const numericInputs = useMemo(() => {
    const sceneLux = toNumber(targetLux, selectedScene.recommendedLux || 0);
    const lumen = toNumber(luminaireFlux, 0);
    const efficiency = toNumber(luminousEfficacy, 0) || null;
    const mf = clamp(toNumber(maintenanceFactor, 0.8), 0.5, 0.95);
    const len = Math.max(0, toNumber(length, 0));
    const wid = Math.max(0, toNumber(width, 0));
    const hm = Math.max(0.1, toNumber(mountingHeight, 0));
    const hpRaw = toNumber(workplaneHeight, 0.8);
    const hpUpper = hm > 1 ? hm - 0.2 : hm * 0.8;
    const hp = clamp(hpRaw, 0.5, Math.max(0.6, hpUpper));

    return {
      sceneLux,
      lumen,
      efficiency,
      mf,
      len,
      wid,
      hm,
      hp,
    };
  }, [
    length,
    width,
    mountingHeight,
    workplaneHeight,
    targetLux,
    luminaireFlux,
    luminousEfficacy,
    maintenanceFactor,
    selectedScene,
  ]);

  const estimatedUF = useMemo(() => {
    if (utilizationMode === 'manual') {
      return clamp(toNumber(manualUF, 0.6), 0.2, 0.95);
    }

    const roomIndex =
      numericInputs.hm > numericInputs.hp
        ?
          (numericInputs.len * numericInputs.wid) /
          ((numericInputs.hm - numericInputs.hp) * (numericInputs.len + numericInputs.wid || 1))
        : 0;

    return estimateUtilizationFactor({
      roomIndex,
      ceilingReflectance: toNumber(ceilingReflectance, 70),
      wallReflectance: toNumber(wallReflectance, 50),
      floorReflectance: toNumber(floorReflectance, 20),
    });
  }, [
    utilizationMode,
    manualUF,
    ceilingReflectance,
    wallReflectance,
    floorReflectance,
    numericInputs.len,
    numericInputs.wid,
    numericInputs.hm,
    numericInputs.hp,
  ]);

  const result = useMemo(
    () =>
      computeResult({
        length: numericInputs.len,
        width: numericInputs.wid,
        mountingHeight: numericInputs.hm,
        workplaneHeight: numericInputs.hp,
        maintenanceFactor: numericInputs.mf,
        targetLux: Math.max(numericInputs.sceneLux, 1),
        luminaireFlux: Math.max(numericInputs.lumen, 1),
        luminousEfficacy: numericInputs.efficiency,
        utilizationFactor: estimatedUF,
      }),
    [numericInputs, estimatedUF]
  );

  const warnings = useMemo(() => {
    const list: string[] = [];
    if (!result) {
      return list;
    }

    if (result.roomIndex < 0.75 || result.roomIndex > 5) {
      list.push(
        `Indice del locale K = ${round(result.roomIndex, 2)} fuori dal range tipico (0,75 – 5). Verifica l'altezza di montaggio e considera un calcolo fotometrico dettagliato.`
      );
    }

    if (result.utilizationFactor < 0.4) {
      list.push(
        `Fattore di utilizzazione UF basso (${round(
          result.utilizationFactor,
          2
        )}): valuta apparecchi con ottica più efficiente o aumenta la riflettanza delle superfici.`
      );
    }

    if (result.maintenanceFactor < 0.7) {
      list.push(
        `Maintenance Factor MF = ${round(
          result.maintenanceFactor,
          2
        )}. Controlla il piano di manutenzione: valori troppo bassi generano sovradimensionamenti.`
      );
    }

    if (
      result.grid.spacingRatioX &&
      result.grid.spacingRatioX > 1.5
    ) {
      list.push(
        `Interasse lungo X pari a ${round(
          result.grid.spacingRatioX,
          2
        )}·Hm: riduci la spaziatura o aumenta le file per rispettare il rapporto massimo 1,5 raccomandato dai produttori.`
      );
    }

    if (
      result.grid.spacingRatioY &&
      result.grid.spacingRatioY > 1.5
    ) {
      list.push(
        `Interasse lungo Y pari a ${round(
          result.grid.spacingRatioY,
          2
        )}·Hm: verifica la distribuzione trasversale degli apparecchi per garantire uniformità.`
      );
    }

    if (result.achievedLux < result.targetLux) {
      list.push(
        `Lux ottenuti (${round(result.achievedLux, 0)} lx) leggermente inferiori al target: valuta una lampada in più o un apparecchio con flusso maggiore.`
      );
    }

    return list;
  }, [result]);

  const assumptions = useMemo(() => {
    const base = [
      'Metodo del flusso totale (cavità zonale) applicato con fattore di utilizzazione medio ricavato da curve tipiche.',
      'Livello di manutenzione riferito al periodo di tempo tra due interventi di pulizia/sostituzione lampade.',
      'Distribuzione regolare degli apparecchi in griglia: la verifica dell’uniformità U0 richiede un calcolo fotometrico dedicato (Dialux/Relux).',
    ];
    if (utilizationMode === 'auto') {
      base.push('Fattore di utilizzazione stimato in funzione dell’indice del locale e delle riflettanze dichiarate.');
    } else {
      base.push('Fattore di utilizzazione imposto dal progettista sulla base delle curve fotometriche del costruttore.');
    }
    return base;
  }, [utilizationMode]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri del locale e requisiti di illuminamento
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Inserisci le dimensioni del locale, il livello di illuminamento richiesto dalla UNI EN 12464-1 e
          il flusso luminoso dell&apos;apparecchio, oppure seleziona un ambiente tipo per richiamare i valori
          normativi. Il calcolo applica il metodo del fattore di utilizzazione (cavità zonale).
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label htmlFor="scene" className="calculator-label">
                Scenario illuminotecnico (UNI EN 12464-1)
              </label>
              <select
                id="scene"
                value={selectedScene.id}
                onChange={(event) => {
                  const scene = lightingScenes.find((item) => item.id === event.target.value);
                  if (scene) {
                    setSelectedScene(scene);
                    if (scene.id !== 'custom') {
                      setTargetLux(scene.recommendedLux.toString());
                    }
                  }
                }}
                className="calculator-input"
              >
                {lightingScenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.label} {scene.recommendedLux ? `(${scene.recommendedLux} lx)` : ''}
                  </option>
                ))}
              </select>
              {selectedScene.note && (
                <p className="mt-1 text-xs text-gray-500">{selectedScene.note}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="length" className="calculator-label">
                  Lunghezza locale (m)
                </label>
                <input
                  id="length"
                  type="number"
                  min="1"
                  step="0.1"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="width" className="calculator-label">
                  Larghezza locale (m)
                </label>
                <input
                  id="width"
                  type="number"
                  min="1"
                  step="0.1"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="mountingHeight" className="calculator-label">
                  Altezza montaggio apparecchio (m)
                </label>
                <input
                  id="mountingHeight"
                  type="number"
                  min="2"
                  step="0.1"
                  value={mountingHeight}
                  onChange={(event) => setMountingHeight(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Quota dell&apos;intradòsso o punto luce rispetto al pavimento.</p>
              </div>
              <div>
                <label htmlFor="workplaneHeight" className="calculator-label">
                  Altezza piano di lavoro (m)
                </label>
                <input
                  id="workplaneHeight"
                  type="number"
                  min="0.5"
                  step="0.05"
                  value={workplaneHeight}
                  onChange={(event) => setWorkplaneHeight(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Valore tipico: 0,8 m per postazioni d&apos;ufficio.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="targetLux" className="calculator-label">
                  Illuminamento richiesto E<sub>m</sub> (lux)
                </label>
                <input
                  id="targetLux"
                  type="number"
                  min="50"
                  step="10"
                  value={targetLux}
                  onChange={(event) => setTargetLux(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="luminaireFlux" className="calculator-label">
                  Flusso apparecchio Φ (lumen)
                </label>
                <input
                  id="luminaireFlux"
                  type="number"
                  min="500"
                  step="50"
                  value={luminaireFlux}
                  onChange={(event) => setLuminaireFlux(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="luminousEfficacy" className="calculator-label">
                  Efficienza luminosa (lm/W)
                </label>
                <input
                  id="luminousEfficacy"
                  type="number"
                  min="40"
                  step="5"
                  value={luminousEfficacy}
                  onChange={(event) => setLuminousEfficacy(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Facoltativo: consente di stimare la potenza assorbita totale.</p>
              </div>
              <div>
                <label htmlFor="maintenanceFactor" className="calculator-label">
                  Maintenance factor MF
                </label>
                <input
                  id="maintenanceFactor"
                  type="number"
                  min="0.5"
                  max="0.95"
                  step="0.01"
                  value={maintenanceFactor}
                  onChange={(event) => setMaintenanceFactor(event.target.value)}
                  className="calculator-input"
                />
                <p className="mt-1 text-xs text-gray-500">Secondo UNI EN 12464-1 allegato A. Tipico: 0,8 con manutenzione periodica.</p>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">Fattore di utilizzazione UF</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="uf-mode"
                    value="auto"
                    checked={utilizationMode === 'auto'}
                    onChange={() => setUtilizationMode('auto')}
                  />
                  Calcola da riflettanze
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="uf-mode"
                    value="manual"
                    checked={utilizationMode === 'manual'}
                    onChange={() => setUtilizationMode('manual')}
                  />
                  Inserisco il valore UF
                </label>
              </div>

              {utilizationMode === 'manual' ? (
                <div className="mt-4">
                  <label htmlFor="manualUF" className="calculator-label">
                    UF da curva fotometrica
                  </label>
                  <input
                    id="manualUF"
                    type="number"
                    min="0.2"
                    max="0.95"
                    step="0.01"
                    value={manualUF}
                    onChange={(event) => setManualUF(event.target.value)}
                    className="calculator-input"
                  />
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="ceilingReflectance" className="calculator-label">
                      Riflettanza soffitto (%)
                    </label>
                    <input
                      id="ceilingReflectance"
                      type="number"
                      min="10"
                      max="90"
                      step="5"
                      value={ceilingReflectance}
                      onChange={(event) => setCeilingReflectance(event.target.value)}
                      className="calculator-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="wallReflectance" className="calculator-label">
                      Riflettanza pareti (%)
                    </label>
                    <input
                      id="wallReflectance"
                      type="number"
                      min="10"
                      max="80"
                      step="5"
                      value={wallReflectance}
                      onChange={(event) => setWallReflectance(event.target.value)}
                      className="calculator-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="floorReflectance" className="calculator-label">
                      Riflettanza pavimento (%)
                    </label>
                    <input
                      id="floorReflectance"
                      type="number"
                      min="5"
                      max="60"
                      step="5"
                      value={floorReflectance}
                      onChange={(event) => setFloorReflectance(event.target.value)}
                      className="calculator-input"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="section-card border-green-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Esito dimensionamento</h3>
              <p className="text-sm text-gray-600">
                Numero di apparecchi, flusso totale e controlli di installazione derivati dal metodo del flusso totale. I valori sono arrotondati per eccesso come richiesto dalla UNI EN 12464-1.
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              UF effettivo: {round(result.utilizationFactor, 2)}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Lux richiesti vs ottenuti</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                Target {round(result.targetLux, 0)} lx → Ottenuti {round(result.achievedLux, 0)} lx
              </p>
              <p className="mt-2 text-sm text-gray-600">
                MF = {round(result.maintenanceFactor, 2)} • UF = {round(result.utilizationFactor, 2)} • Area = {round(result.area, 1)} m²
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Numero di apparecchi</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {result.luminaires} unità
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Calcolo continuo: {round(result.rawLuminaires, 2)} → arrotondato a intero superiore.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Indice del locale K</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {round(result.roomIndex, 2)}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Valido per UF tabellati nella documentazione fotometrica (range 0,75 – 5).
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Distribuzione consigliata</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {result.grid.columns} colonne × {result.grid.rows} file
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Passo X = {round(result.grid.spacingX, 2)} m (ratio {result.grid.spacingRatioX ? round(result.grid.spacingRatioX, 2) : '—'})
              </p>
              <p className="text-sm text-gray-600">
                Passo Y = {round(result.grid.spacingY, 2)} m (ratio {result.grid.spacingRatioY ? round(result.grid.spacingRatioY, 2) : '—'})
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Flusso luminoso totale</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {round(result.totalFlux, 0)} lm
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Φ apparecchio = {round(result.perFixtureFlux, 0)} lm
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">Potenza assorbita</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {result.totalPower ? `${round(result.totalPower, 1)} W` : 'Inserisci lm/W'}
              </p>
              {result.powerPerFixture && (
                <p className="mt-2 text-sm text-gray-600">
                  {round(result.powerPerFixture, 1)} W per apparecchio (efficienza {luminousEfficacy} lm/W)
                </p>
              )}
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
          <h3 className="text-lg font-semibold text-gray-900">Completa i dati richiesti</h3>
          <p className="mt-2 text-sm text-gray-600">
            Verifica che il flusso luminoso dell&apos;apparecchio, l&apos;illuminamento richiesto e il fattore di
            utilizzazione siano definiti correttamente. Inserisci almeno due dimensioni del locale con altezza
            di montaggio superiore al piano di lavoro.
          </p>
        </section>
      )}

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Formule adottate</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-600">
          <p>
            Metodo del flusso totale (cavità zonale): <code>N = (E · A) / (Φ · UF · MF)</code>, dove
            <em> N</em> è il numero di apparecchi, <em>E</em> il livello di illuminamento richiesto, <em>A</em> l&apos;area,
            <em>Φ</em> il flusso per apparecchio, <em>UF</em> il fattore di utilizzazione e <em>MF</em> il fattore di manutenzione.
          </p>
          <p>
            Indice del locale: <code>K = (L · W) / (H<sub>m</sub> · (L + W))</code>, con <em>H<sub>m</sub></em> differenza tra quota
            di montaggio e piano di lavoro.
          </p>
          <p>
            Verifica spacing: rapporto interasse/altezza di montaggio (<code>SR = S / H<sub>m</sub></code>) da mantenere ≤ 1,5 per
            apparecchi a distribuzione diffusa (indicazione produttori, UNI EN 12464-1 Allegato B).
          </p>
        </div>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Riferimenti normativi</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>UNI EN 12464-1:2021 – Illuminazione dei posti di lavoro in interni (tabelle di illuminamento e UGR).</li>
          <li>UNI 10380:2014 – Illuminotecnica degli ambienti di lavoro interni: fattori di manutenzione e metodo del flusso totale.</li>
          <li>CEI 34-122 – Calcolo del fattore di utilizzazione secondo metodo della cavità zonale.</li>
          <li>Manuali Dialux/Relux – Verifica dell&apos;uniformità e dell&apos;abbagliamento secondo EN 13032.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-600">
          Per ambienti con compiti visivi critici integrare il risultato con un calcolo fotometrico con file IES
          del costruttore e verificare UGR, U<sub>0</sub> ed eventuali limiti specifici (es. norme settore alimentare, UNI EN 1838 per emergenza).</p>
      </section>

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Limitazioni e buone pratiche</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Per geometrie complesse o presenza di ostacoli è necessario un calcolo fotometrico 3D.</li>
          <li>Il fattore MF deve essere validato dal piano di manutenzione (pulizia, sostituzione sorgenti, degrado LED L<sub>80</sub>/B<sub>10</sub>).</li>
          <li>Verifica separatamente l&apos;illuminazione di emergenza secondo UNI EN 1838 e la compatibilità con impianti di gestione DALI.</li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Ing. Elisa Moretti, Lighting Designer UNI 11615"
        reviewedBy="Ing. Ugo Candido, Revisore Tecnico Capo"
        lastReviewDate="Marzo 2025"
        referenceStandard="UNI EN 12464-1:2021, UNI 10380:2014"
      />

      <section className="section-card border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Disclaimer professionale</h3>
        <p className="mt-2 text-sm text-gray-600">
          I risultati forniti rappresentano un dimensionamento preliminare da validare tramite software illuminotecnico
          certificato e misure in campo conformi alla UNI EN 13032-1. Calcolo.online non si assume responsabilità per
          utilizzi senza la supervisione di un professionista abilitato iscritto all&apos;Ordine.</p>
      </section>
    </div>
  );
}
