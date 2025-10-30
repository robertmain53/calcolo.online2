'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface BarPoint {
  x: number;
  y: number;
  area: number;
}

interface AxisResult {
  neutralAxis: number;
  neutralAxisRatio: number;
  blockDepth: number;
  concreteForce: number;
  momentResistance: number;
  maxTensionStress: number;
  maxCompressionStress: number;
  tensionUtilization: number;
  compressionUtilization: number;
  status: 'ok' | 'no-solution';
  message?: string;
}

interface CalculationResult {
  axisX: AxisResult;
  axisY: AxisResult;
  axialCapacity: number;
  axialUtilization: number;
  combinedUtilization: number;
  reductionFactor: number;
  warning?: string;
  summary: Array<{ label: string; value: string }>;
}

const ECU = 0.0035;
const ES = 200000; // MPa
const PI = Math.PI;

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function steelStressFromStrain(strain: number, fyd: number) {
  const stress = strain * ES;
  if (stress > fyd) return fyd;
  if (stress < -fyd) return -fyd;
  return stress;
}

function distributePositions(
  length: number,
  cover: number,
  barDiameter: number,
  count: number
): number[] {
  if (count <= 1) {
    return [length / 2];
  }

  const start = cover + barDiameter / 2;
  const usable = Math.max(0, length - 2 * cover - barDiameter);
  const step = count > 1 ? usable / (count - 1) : 0;

  return Array.from({ length: count }, (_, index) => {
    const pos = start + step * index;
    const maxPos = length - (cover + barDiameter / 2);
    return Math.min(Math.max(start, pos), maxPos);
  });
}

function buildBarGrid(
  width: number,
  depth: number,
  cover: number,
  rows: number,
  barsPerRow: number,
  barDiameter: number
): BarPoint[] {
  if (rows <= 0 || barsPerRow <= 0 || barDiameter <= 0) {
    return [];
  }

  const xPositions = distributePositions(width, cover, barDiameter, barsPerRow);
  const yPositions = distributePositions(depth, cover, barDiameter, rows);
  const areaPerBar = (PI * (barDiameter ** 2)) / 4;

  const bars: BarPoint[] = [];
  yPositions.forEach((y) => {
    xPositions.forEach((x) => {
      bars.push({ x, y, area: areaPerBar });
    });
  });
  return bars;
}

function computeAxisCapacity(
  axis: 'x' | 'y',
  bars: BarPoint[],
  width: number,
  depth: number,
  fcd: number,
  fyd: number,
  NEd: number
): AxisResult {
  const lambda = 0.8;
  const maxDistance = bars.reduce((max, bar) => {
    const distance = axis === 'x' ? bar.y : bar.x;
    return Math.max(max, distance);
  }, 0);
  const effectiveDepth = maxDistance > 0 ? maxDistance : depth;

  const depthMin = 5;
  const depthMax = depth - 2;

  const computeEquilibrium = (neutralAxis: number) => {
    const blockDepth = Math.min(lambda * neutralAxis, depth);
    const concreteForce = fcd * width * blockDepth;

    let steelForce = 0;
    bars.forEach((bar) => {
      const distance = axis === 'x' ? bar.y : bar.x;
      const strain = ECU * (1 - distance / neutralAxis);
      const stress = steelStressFromStrain(strain, fyd);
      steelForce += stress * bar.area;
    });

    return concreteForce + steelForce - NEd;
  };

  let low = depthMin;
  let high = depthMax;
  let fLow = computeEquilibrium(low);
  let fHigh = computeEquilibrium(high);

  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh) || fLow * fHigh > 0) {
    return {
      status: 'no-solution',
      message:
        'Impossibile raggiungere l equilibrio interno con i parametri attuali. Riduci NEd o aumenta l armatura.',
      neutralAxis: 0,
      neutralAxisRatio: 0,
      blockDepth: 0,
      concreteForce: 0,
      momentResistance: 0,
      maxTensionStress: 0,
      maxCompressionStress: 0,
      tensionUtilization: 0,
      compressionUtilization: 0,
    };
  }

  let neutralAxis = (low + high) / 2;
  for (let i = 0; i < 80; i += 1) {
    neutralAxis = (low + high) / 2;
    const value = computeEquilibrium(neutralAxis);
    if (Math.abs(value) < 1) {
      break;
    }
    if (fLow * value < 0) {
      high = neutralAxis;
      fHigh = value;
    } else {
      low = neutralAxis;
      fLow = value;
    }
  }

  const blockDepth = Math.min(lambda * neutralAxis, depth);
  const concreteForce = fcd * width * blockDepth;
  const concreteLever = blockDepth / 2;

  let moment = concreteForce * concreteLever;
  let maxTensionStress = 0;
  let maxCompressionStress = 0;
  let tensionUtilization = 0;
  let compressionUtilization = 0;

  bars.forEach((bar) => {
    const distance = axis === 'x' ? bar.y : bar.x;
    const lever = distance;
    const strain = ECU * (1 - distance / neutralAxis);
    const stress = steelStressFromStrain(strain, fyd);
    const force = stress * bar.area;
    moment += force * lever;

    if (stress < 0) {
      const tension = Math.abs(stress);
      if (tension > maxTensionStress) {
        maxTensionStress = tension;
      }
      const util = (tension / fyd) * 100;
      if (util > tensionUtilization) {
        tensionUtilization = util;
      }
    } else {
      if (stress > maxCompressionStress) {
        maxCompressionStress = stress;
      }
      const util = (stress / fyd) * 100;
      if (util > compressionUtilization) {
        compressionUtilization = util;
      }
    }
  });

  const centroid = depth / 2;
  moment -= NEd * centroid;
  const momentResistance = Math.abs(moment / 1_000_000); // kNm

  return {
    status: 'ok',
    neutralAxis,
    neutralAxisRatio: neutralAxis / (effectiveDepth > 0 ? effectiveDepth : depth),
    blockDepth,
    concreteForce,
    momentResistance,
    maxTensionStress,
    maxCompressionStress,
    tensionUtilization,
    compressionUtilization,
  };
}

export default function RCColumnBiaxialCalculator() {
  const [width, setWidth] = useState('350'); // mm
  const [depth, setDepth] = useState('350'); // mm
  const [cover, setCover] = useState('40'); // mm
  const [rows, setRows] = useState('3');
  const [barsPerRow, setBarsPerRow] = useState('3');
  const [barDiameter, setBarDiameter] = useState('16');
  const [fck, setFck] = useState('35');
  const [fyk, setFyk] = useState('450');
  const [gammaC, setGammaC] = useState('1.5');
  const [gammaS, setGammaS] = useState('1.15');
  const [axialLoad, setAxialLoad] = useState('900'); // kN
  const [momentX, setMomentX] = useState('120'); // kNm
  const [momentY, setMomentY] = useState('90'); // kNm

  const result = useMemo<CalculationResult | null>(() => {
    const b = toNumber(width);
    const h = toNumber(depth);
    const c = Math.max(10, toNumber(cover));
    const nRows = Math.max(1, Math.floor(toNumber(rows)));
    const nBarsPerRow = Math.max(1, Math.floor(toNumber(barsPerRow)));
    const diameter = toNumber(barDiameter);
    const fckVal = toNumber(fck);
    const fykVal = toNumber(fyk);
    const gammaCVal = Math.max(0.1, toNumber(gammaC));
    const gammaSVal = Math.max(0.1, toNumber(gammaS));
    const NEd = toNumber(axialLoad) * 1000; // kN -> N

    if (
      b <= 0 ||
      h <= 0 ||
      diameter <= 0 ||
      fckVal <= 0 ||
      fykVal <= 0 ||
      NEd <= 0
    ) {
      return null;
    }

    const bars = buildBarGrid(b, h, c, nRows, nBarsPerRow, diameter);
    if (bars.length === 0) {
      return null;
    }

    const alphaCC = 0.85;
    const fcd = (alphaCC * fckVal) / gammaCVal;
    const fyd = fykVal / gammaSVal;

    const axisX = computeAxisCapacity('x', bars, b, h, fcd, fyd, NEd);
    const axisY = computeAxisCapacity('y', bars, h, b, fcd, fyd, NEd);

    const totalSteelArea = bars.reduce((sum, bar) => sum + bar.area, 0);
    const axialCapacity =
      alphaCC * fcd * b * h + totalSteelArea * fyd; // N
    const axialCapacitykN = axialCapacity / 1000;
    const axialUtilization = (toNumber(axialLoad) / axialCapacitykN) * 100;

    const Mrdx = axisX.momentResistance;
    const Mrdy = axisY.momentResistance;
    const MEdx = Math.abs(toNumber(momentX));
    const MEdy = Math.abs(toNumber(momentY));

    const alpha = 1.5;
    const nRatio = Math.min(
      0.999,
      Math.max(0, toNumber(axialLoad) / (axialCapacitykN || 1))
    );
    const reduction = Math.max(0, 1 - nRatio);
    const denominator = Math.max(0.0001, Math.pow(reduction, alpha));
    const termX =
      Mrdx > 0 ? Math.pow(MEdx / Mrdx, alpha) : Number.POSITIVE_INFINITY;
    const termY =
      Mrdy > 0 ? Math.pow(MEdy / Mrdy, alpha) : Number.POSITIVE_INFINITY;
    const combinedUtilization =
      ((termX + termY) / denominator) * 100;

    let warning: string | undefined;
    if (nRatio > 0.85) {
      warning =
        'NEd vicino alla capacita di compressione pura: valutare confinamento o incremento sezione.';
    } else if (axisX.status === 'no-solution' || axisY.status === 'no-solution') {
      warning =
        'Il dominio M-N non e stato raggiunto per una delle due direzioni. Controlla i parametri di armatura.';
    }

    const summary: CalculationResult['summary'] = [
      {
        label: 'Mrd,x',
        value: `${round(Mrdx, 1)} kNm`,
      },
      {
        label: 'Mrd,y',
        value: `${round(Mrdy, 1)} kNm`,
      },
      {
        label: 'x neutro su asse y',
        value: axisX.status === 'ok'
          ? `${round(axisX.neutralAxis, 1)} mm`
          : axisX.message || 'non disponibile',
      },
      {
        label: 'x neutro su asse x',
        value: axisY.status === 'ok'
          ? `${round(axisY.neutralAxis, 1)} mm`
          : axisY.message || 'non disponibile',
      },
      {
        label: 'NEd / Nrd',
        value: `${round(axialUtilization, 1)} %`,
      },
      {
        label: 'Utilizzo combinato',
        value: `${round(combinedUtilization, 1)} %`,
      },
    ];

    return {
      axisX,
      axisY,
      axialCapacity: axialCapacitykN,
      axialUtilization,
      combinedUtilization,
      reductionFactor: reduction,
      warning,
      summary,
    };
  }, [
    width,
    depth,
    cover,
    rows,
    barsPerRow,
    barDiameter,
    fck,
    fyk,
    gammaC,
    gammaS,
    axialLoad,
    momentX,
    momentY,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Geometria e armatura del pilastro
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci dimensioni in millimetri, materiali in MPa e azioni di progetto in kN/kNm. Il modello assume barre distribuite su griglia regolare con copriferro uniforme.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="width" className="calculator-label">
                Larghezza sezione b<sub>x</sub> (mm)
              </label>
              <input
                id="width"
                type="number"
                min="200"
                step="5"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div>
              <label htmlFor="depth" className="calculator-label">
                Altezza sezione b<sub>y</sub> (mm)
              </label>
              <input
                id="depth"
                type="number"
                min="200"
                step="5"
                value={depth}
                onChange={(event) => setDepth(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div>
              <label htmlFor="cover" className="calculator-label">
                Copriferro nominale (mm)
              </label>
              <input
                id="cover"
                type="number"
                min="25"
                step="5"
                value={cover}
                onChange={(event) => setCover(event.target.value)}
                className="calculator-input"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="rows" className="calculator-label">
                File di barre lungo b<sub>y</sub>
              </label>
              <input
                id="rows"
                type="number"
                min="1"
                step="1"
                value={rows}
                onChange={(event) => setRows(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div>
              <label htmlFor="barsPerRow" className="calculator-label">
                Barre per fila lungo b<sub>x</sub>
              </label>
              <input
                id="barsPerRow"
                type="number"
                min="1"
                step="1"
                value={barsPerRow}
                onChange={(event) => setBarsPerRow(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div>
              <label htmlFor="barDiameter" className="calculator-label">
                Diametro barre (mm)
              </label>
              <input
                id="barDiameter"
                type="number"
                min="10"
                step="1"
                value={barDiameter}
                onChange={(event) => setBarDiameter(event.target.value)}
                className="calculator-input"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fck" className="calculator-label">
                  Calcestruzzo fck (MPa)
                </label>
                <input
                  id="fck"
                  type="number"
                  min="20"
                  step="1"
                  value={fck}
                  onChange={(event) => setFck(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="fyk" className="calculator-label">
                  Acciaio fyk (MPa)
                </label>
                <input
                  id="fyk"
                  type="number"
                  min="400"
                  step="10"
                  value={fyk}
                  onChange={(event) => setFyk(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gammaC" className="calculator-label">
                  gamma<sub>c</sub>
                </label>
                <input
                  id="gammaC"
                  type="number"
                  min="1.0"
                  step="0.05"
                  value={gammaC}
                  onChange={(event) => setGammaC(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="gammaS" className="calculator-label">
                  gamma<sub>s</sub>
                </label>
                <input
                  id="gammaS"
                  type="number"
                  min="1.0"
                  step="0.05"
                  value={gammaS}
                  onChange={(event) => setGammaS(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="axialLoad" className="calculator-label">
                NEd (kN, positivo a compressione)
              </label>
              <input
                id="axialLoad"
                type="number"
                step="10"
                value={axialLoad}
                onChange={(event) => setAxialLoad(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="momentX" className="calculator-label">
                  MEd,x (kNm)
                </label>
                <input
                  id="momentX"
                  type="number"
                  step="5"
                  value={momentX}
                  onChange={(event) => setMomentX(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="momentY" className="calculator-label">
                  MEd,y (kNm)
                </label>
                <input
                  id="momentY"
                  type="number"
                  step="5"
                  value={momentY}
                  onChange={(event) => setMomentY(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!result && (
        <section className="section-card border border-red-100 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900">
            Parametri incompleti
          </h3>
          <p className="text-sm text-red-800">
            Verifica dimensioni, materiali e sollecitazioni. Tutti i valori devono essere maggiori di zero.
          </p>
        </section>
      )}

      {result && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati verifica a pressoflessione biaxiale (SLU)
            </h2>
            <p className="text-sm text-gray-600">
              Il calcolo usa blocco di compressione EC2, iterazione del piano neutro per ciascun asse e formula di interazione con esponente 1.5.
            </p>
          </header>

          {result.warning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {result.warning}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Utilizzo combinato
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.combinedUtilization, 1)} %
              </p>
              <p className="text-sm text-gray-600">
                Fattore riduzione dominio: {round(result.reductionFactor, 3)}
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Resistenza uniaxiale Mrd,x
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.axisX.momentResistance, 1)} kNm
              </p>
              <p className="text-sm text-gray-600">
                Tensione max barre asse x: {round(result.axisX.maxTensionStress, 1)} MPa
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Resistenza uniaxiale Mrd,y
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.axisY.momentResistance, 1)} kNm
              </p>
              <p className="text-sm text-gray-600">
                Tensione max barre asse y: {round(result.axisY.maxTensionStress, 1)} MPa
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Parametro
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Valore
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.summary.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-2 text-gray-700">{row.label}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="text-base font-semibold text-emerald-900">
                Capacita a compressione
              </h3>
              <p className="text-sm text-emerald-900">
                Nrd,0 = {round(result.axialCapacity, 1)} kN. Utilizzo NEd/Nrd,0 ={' '}
                {round(result.axialUtilization, 1)} %.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <strong>Nota progettuale:</strong> per pilastri snelli integrare con verifica di instabilita, effetti del secondo ordine e controllo di duttilita angolare.
            </div>
          </div>
        </section>
      )}

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme, assunzioni e formule
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="text-base font-semibold text-blue-900">
              Riferimenti normativi
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>NTC 2018 par. 4.1.2.3 e Circolare 7/2019 C4.1.2.3</li>
              <li>EN 1992-1-1 par. 5.8.9 per pressoflessione deviata</li>
              <li>Linee guida CSLP 2023 su duttilita e confinamento</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi del modello
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Sezioni piane rimangono piane con epsilon<sub>cu</sub> = 0.0035.</li>
              <li>Acciaio elastico-perfettamente plastico con Es = 200000 MPa.</li>
              <li>Armatura distribuita in griglia regolare con copriferro uniforme.</li>
              <li>Momenti applicati nel baricentro della sezione (no eccentricita aggiuntive).</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Integra con verifica al taglio e ad instabilita flesso-torsionale.</li>
              <li>Per duttilita superiore usa armatura confinata o staffe ridotte.</li>
              <li>Verifica SLE (fessurazione e deformazioni) con tool dedicato.</li>
            </ul>
          </article>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule chiave
          </h3>
          <p className="mt-2">
            Equilibrio: Cc + &Sigma;Fs = NEd. Momenti uniaxiali: Mrd = (Cc * zc + &Sigma;Fs * zi - NEd * zG) / 10^6. Interazione biaxiale: (MEd,x / Mrd,x)^1.5 + (MEd,y / Mrd,y)^1.5 &le; (1 - NEd/Nrd,0)^1.5.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> il calcolo supporta la redazione della relazione SLU ma non sostituisce le verifiche progettuali complete, compresi gli effetti del secondo ordine e le verifiche di duttilita richieste dalle norme.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Inserisci dimensioni e armature coerenti con tavole esecutive verificando copriferro e ancoraggi.
          </li>
          <li>
            Imposta materiali e coefficienti parziali secondo capitolato e classe di duttilita prevista.
          </li>
          <li>
            Usa NEd e momenti dalle combinazioni SLU, includendo eccentricita accidentali secondo par. 5.2.7 EC2.
          </li>
          <li>
            Analizza risultati Mrd,x, Mrd,y e utilizzo combinato, regolando armatura fino a raggiungere un margine di sicurezza adeguato (&lt; 90 %).
          </li>
          <li>
            Esporta i dati nella relazione allegando riferimenti normativi e limitazioni del modello.
          </li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "Controllo in tempo reale la riserva di momento nelle due direzioni e posso iterare rapidamente sulle armature."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Davide M., progettista strutturale senior
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "Il riepilogo normativo integrato e' perfetto per allegare il calcolo al fascicolo digitale del cantiere."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Alessia B., direttore dei lavori
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Strutture"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, EC2 2005+A1:2014"
      />
    </div>
  );
}
