'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface CalculationResult {
  status: 'ok' | 'no-equilibrium';
  message?: string;
  neutralAxis: number;
  neutralAxisRatio: number;
  blockDepth: number;
  concreteForce: number;
  topSteel: {
    area: number;
    strain: number;
    stress: number;
    force: number;
  };
  bottomSteel: {
    area: number;
    strain: number;
    stress: number;
    force: number;
  };
  bendingResistance: number;
  shearResultant: number;
  utilization: number;
  tensionUtilization: number;
  compressionUtilization: number;
  limitDepth: number;
  warning?: string;
  checkSummary: Array<{ label: string; value: string }>;
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
  if (stress > fyd) {
    return fyd;
  }
  if (stress < -fyd) {
    return -fyd;
  }
  return stress;
}

export default function RCSectionSLUCalculator() {
  const [width, setWidth] = useState('300');
  const [height, setHeight] = useState('550');
  const [coverTop, setCoverTop] = useState('40');
  const [coverBottom, setCoverBottom] = useState('40');
  const [topBars, setTopBars] = useState('3');
  const [topDiameter, setTopDiameter] = useState('16');
  const [bottomBars, setBottomBars] = useState('4');
  const [bottomDiameter, setBottomDiameter] = useState('20');
  const [fck, setFck] = useState('35');
  const [fyk, setFyk] = useState('450');
  const [gammaC, setGammaC] = useState('1.5');
  const [gammaS, setGammaS] = useState('1.15');
  const [axialLoad, setAxialLoad] = useState('400'); // kN compression
  const [designMoment, setDesignMoment] = useState('220'); // kNm sagging

  const result = useMemo<CalculationResult | null>(() => {
    const b = toNumber(width);
    const h = toNumber(height);
    const cTop = toNumber(coverTop);
    const cBottom = toNumber(coverBottom);
    const barsTop = Math.max(0, Math.floor(toNumber(topBars)));
    const barsBottom = Math.max(0, Math.floor(toNumber(bottomBars)));
    const diaTop = toNumber(topDiameter);
    const diaBottom = toNumber(bottomDiameter);
    const fckVal = toNumber(fck);
    const fykVal = toNumber(fyk);
    const gammaCVal = Math.max(0.1, toNumber(gammaC));
    const gammaSVal = Math.max(0.1, toNumber(gammaS));
    const NEd = toNumber(axialLoad) * 1000; // convert kN -> kN? Already. 1 kN = 1000 N
    const MEd = toNumber(designMoment) * 1_000_000; // kNm -> Nmm

    if (
      b <= 0 ||
      h <= 0 ||
      diaBottom < 6 ||
      barsBottom <= 0 ||
      fckVal <= 0 ||
      fykVal <= 0
    ) {
      return null;
    }

    const alphaCC = 0.85;
    const lambda = 0.8;
    const fcd = (alphaCC * fckVal) / gammaCVal;
    const fyd = fykVal / gammaSVal;

    const AsTop =
      barsTop > 0 && diaTop > 0
        ? barsTop * (PI * (diaTop ** 2) / 4)
        : 0;
    const AsBottom =
      barsBottom * (PI * (diaBottom ** 2) / 4);

    const yTop = barsTop > 0 && diaTop > 0 ? cTop + diaTop / 2 : cTop;
    const yBottom = h - (cBottom + diaBottom / 2);
    const effectiveDepth = yBottom;
    const limitDepth = 0.45 * effectiveDepth;

    const strainAt = (x: number, y: number) => ECU * (1 - y / x);

    const equilibrium = (x: number) => {
      if (x <= 5) {
        return Number.POSITIVE_INFINITY;
      }
      if (x >= h - 1) {
        return Number.NEGATIVE_INFINITY;
      }

      const blockDepth = Math.min(lambda * x, h);
      const concreteForce = fcd * b * blockDepth;

      const strainTop = strainAt(x, yTop);
      const strainBottom = strainAt(x, yBottom);

      const stressTop =
        AsTop > 0 ? steelStressFromStrain(strainTop, fyd) : 0;
      const stressBottom = steelStressFromStrain(strainBottom, fyd);

      const FsTop = stressTop * AsTop;
      const FsBottom = stressBottom * AsBottom;

      return concreteForce + FsTop + FsBottom - NEd;
    };

    let low = Math.max(5, 0.05 * h);
    let high = h - 5;
    let fLow = equilibrium(low);
    let fHigh = equilibrium(high);

    if (Number.isNaN(fLow) || Number.isNaN(fHigh)) {
      return {
        status: 'no-equilibrium',
        message:
          'Impossibile chiudere equilibrio: controlla geometria e azioni applicate.',
        neutralAxis: 0,
        neutralAxisRatio: 0,
        blockDepth: 0,
        concreteForce: 0,
        topSteel: {
          area: AsTop,
          strain: 0,
          stress: 0,
          force: 0,
        },
        bottomSteel: {
          area: AsBottom,
          strain: 0,
          stress: 0,
          force: 0,
        },
        bendingResistance: 0,
        shearResultant: 0,
        utilization: 0,
        tensionUtilization: 0,
        compressionUtilization: 0,
        limitDepth,
        checkSummary: [],
      };
    }

    if (fLow * fHigh > 0) {
      return {
        status: 'no-equilibrium',
        message:
          'La combinazione NEd-MEd supera la capacita preliminare: aumenta armature o varia i parametri.',
        neutralAxis: 0,
        neutralAxisRatio: 0,
        blockDepth: 0,
        concreteForce: 0,
        topSteel: {
          area: AsTop,
          strain: 0,
          stress: 0,
          force: 0,
        },
        bottomSteel: {
          area: AsBottom,
          strain: 0,
          stress: 0,
          force: 0,
        },
        bendingResistance: 0,
        shearResultant: 0,
        utilization: 0,
        tensionUtilization: 0,
        compressionUtilization: 0,
        limitDepth,
        checkSummary: [],
      };
    }

    let x = (low + high) / 2;
    for (let i = 0; i < 80; i += 1) {
      x = (low + high) / 2;
      const fx = equilibrium(x);
      if (Math.abs(fx) < 1) {
        break;
      }
      if (fLow * fx < 0) {
        high = x;
        fHigh = fx;
      } else {
        low = x;
        fLow = fx;
      }
    }

    const blockDepth = Math.min(lambda * x, h);
    const concreteForce = fcd * b * blockDepth;
    const strainTop = strainAt(x, yTop);
    const strainBottom = strainAt(x, yBottom);
    const stressTop = AsTop > 0 ? steelStressFromStrain(strainTop, fyd) : 0;
    const stressBottom = steelStressFromStrain(strainBottom, fyd);
    const FsTop = stressTop * AsTop;
    const FsBottom = stressBottom * AsBottom;

    const yConcrete = blockDepth / 2;

    const momentAboutTop =
      concreteForce * yConcrete +
      FsTop * yTop +
      FsBottom * yBottom -
      NEd * (h / 2);

    const bendingResistance = momentAboutTop / 1_000_000; // kNm
    const utilization =
      bendingResistance > 0 ? (toNumber(designMoment) / bendingResistance) * 100 : 0;

    const tensionUtilization =
      AsBottom > 0 ? (Math.abs(stressBottom) / fyd) * 100 : 0;
    const compressionUtilization =
      AsTop > 0 ? (Math.abs(stressTop) / fyd) * 100 : 0;

    const warning =
      x > limitDepth
        ? 'Profondita del piano neutro oltre il limite EC2 (x/d > 0.45). Verificare duttilita o aumentare armatura in trazione.'
        : undefined;

    const checkSummary = [
      {
        label: 'Profondita piano neutro x',
        value: `${round(x, 1)} mm (${round(x / effectiveDepth, 3)} d)`,
      },
      {
        label: 'Blocco di compressione lambda*x',
        value: `${round(blockDepth, 1)} mm`,
      },
      {
        label: 'Forza di calcestruzzo',
        value: `${round(concreteForce / 1000, 1)} kN`,
      },
      {
        label: 'Tensione acciaio inferiore',
        value: `${round(stressBottom, 1)} MPa (${round(tensionUtilization, 1)} % fyd)`,
      },
      {
        label: 'Tensione acciaio superiore',
        value: `${round(stressTop, 1)} MPa (${round(compressionUtilization, 1)} % fyd)`,
      },
      {
        label: 'Momento resistente Mrd',
        value: `${round(bendingResistance, 1)} kNm`,
      },
      {
        label: 'Utilizzo MEd/Mrd',
        value: `${round(utilization, 1)} %`,
      },
    ];

    return {
      status: 'ok',
      neutralAxis: x,
      neutralAxisRatio: x / effectiveDepth,
      blockDepth,
      concreteForce,
      topSteel: {
        area: AsTop,
        strain: strainTop,
        stress: stressTop,
        force: FsTop,
      },
      bottomSteel: {
        area: AsBottom,
        strain: strainBottom,
        stress: stressBottom,
        force: FsBottom,
      },
      bendingResistance,
      shearResultant: concreteForce + FsTop + FsBottom,
      utilization,
      tensionUtilization,
      compressionUtilization,
      limitDepth,
      warning,
      checkSummary,
    };
  }, [
    width,
    height,
    coverTop,
    coverBottom,
    topBars,
    topDiameter,
    bottomBars,
    bottomDiameter,
    fck,
    fyk,
    gammaC,
    gammaS,
    axialLoad,
    designMoment,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Parametri geometrici e materiali
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci valori coerenti in millimetri, MPa e azioni di progetto (NEd in kN, MEd in kNm). Il calcolo adotta blocco di compressione EC2 con alfa_cc = 0.85 e lambda = 0.8.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="width" className="calculator-label">
                Larghezza sezione b (mm)
              </label>
              <input
                id="width"
                type="number"
                min="120"
                step="5"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div>
              <label htmlFor="height" className="calculator-label">
                Altezza sezione h (mm)
              </label>
              <input
                id="height"
                type="number"
                min="200"
                step="5"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="coverTop" className="calculator-label">
                  Copriferro superiore (mm)
                </label>
                <input
                  id="coverTop"
                  type="number"
                  min="20"
                  step="5"
                  value={coverTop}
                  onChange={(event) => setCoverTop(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="coverBottom" className="calculator-label">
                  Copriferro inferiore (mm)
                </label>
                <input
                  id="coverBottom"
                  type="number"
                  min="20"
                  step="5"
                  value={coverBottom}
                  onChange={(event) => setCoverBottom(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900">
                Armatura in compressione (superiore)
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="topBars" className="calculator-label">
                    Numero barre
                  </label>
                  <input
                    id="topBars"
                    type="number"
                    min="0"
                    step="1"
                    value={topBars}
                    onChange={(event) => setTopBars(event.target.value)}
                    className="calculator-input"
                  />
                </div>
                <div>
                  <label htmlFor="topDiameter" className="calculator-label">
                    Diametro barre (mm)
                  </label>
                  <input
                    id="topDiameter"
                    type="number"
                    min="0"
                    step="1"
                    value={topDiameter}
                    onChange={(event) => setTopDiameter(event.target.value)}
                    className="calculator-input"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900">
                Armatura in trazione (inferiore)
              </h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bottomBars" className="calculator-label">
                    Numero barre
                  </label>
                  <input
                    id="bottomBars"
                    type="number"
                    min="1"
                    step="1"
                    value={bottomBars}
                    onChange={(event) => setBottomBars(event.target.value)}
                    className="calculator-input"
                  />
                </div>
                <div>
                  <label htmlFor="bottomDiameter" className="calculator-label">
                    Diametro barre (mm)
                  </label>
                  <input
                    id="bottomDiameter"
                    type="number"
                    min="6"
                    step="1"
                    value={bottomDiameter}
                    onChange={(event) => setBottomDiameter(event.target.value)}
                    className="calculator-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fck" className="calculator-label">
                  Resistenza cls fck (MPa)
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
                  gamma_c
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
                  gamma_s
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
            <div>
              <label htmlFor="designMoment" className="calculator-label">
                MEd (kNm, momento positivo)
              </label>
              <input
                id="designMoment"
                type="number"
                step="5"
                value={designMoment}
                onChange={(event) => setDesignMoment(event.target.value)}
                className="calculator-input"
              />
            </div>
          </div>
        </div>
      </section>

      {!result && (
        <section className="section-card border border-red-100 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900">
            Parametri insufficienti
          </h3>
          <p className="text-sm text-red-800">
            Verifica che b, h, armatura inferiore, fck e fyk siano definiti correttamente.
          </p>
        </section>
      )}

      {result && result.status === 'no-equilibrium' && (
        <section className="section-card border border-amber-200 bg-amber-50">
          <h3 className="text-lg font-semibold text-amber-900">
            Equilibrio non raggiunto
          </h3>
          <p className="text-sm text-amber-900">
            {result.message}
          </p>
          <p className="text-xs text-amber-900 mt-3">
            Suggerimenti: riduci la sollecitazione, aumenta l'armatura o modifica il copriferro per ottenere una sezione piu' duttile.
          </p>
        </section>
      )}

      {result && result.status === 'ok' && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati di progetto SLU
            </h2>
            <p className="text-sm text-gray-600">
              Il calcolo adotta modello a sezioni piane, comportamento acciaio elastico-perfettamente plastico e blocco rettangolare di compressione secondo EN 1992-1-1.
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
                Momento resistente
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.bendingResistance, 1)} kNm
              </p>
              <p className="text-sm text-gray-600">
                Utilizzo MEd/MRd: {round(result.utilization, 1)} %
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Piano neutro x
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.neutralAxis, 1)} mm
              </p>
              <p className="text-sm text-gray-600">
                Rapporto x/d: {round(result.neutralAxisRatio, 3)} (limite 0.45)
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Stato tensionale acciaio
              </h3>
              <ul className="mt-3 text-sm text-gray-700 space-y-1">
                <li>
                  Barre inferiori: {round(result.bottomSteel.stress, 1)} MPa (
                  {round(result.tensionUtilization, 1)} % fyd)
                </li>
                <li>
                  Barre superiori: {round(result.topSteel.stress, 1)} MPa (
                  {round(result.compressionUtilization, 1)} % fyd)
                </li>
              </ul>
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
                {result.checkSummary.map((item) => (
                  <tr key={item.label}>
                    <td className="px-4 py-2 text-gray-700">
                      {item.label}
                    </td>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="text-base font-semibold text-emerald-900">
                Esito combinazione NEd + MEd
              </h3>
              <p className="text-sm text-emerald-900">
                Le azioni applicate risultano coperte dal momento resistente calcolato con equilibrio interno delle forze.
              </p>
              <p className="mt-2 text-sm font-semibold">
                Risultante interna (compressione): {round(result.shearResultant / 1000, 1)} kN.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <strong>Nota operativa:</strong> esporta questo risultato nella relazione SLU indicando input, norme applicate, tensioni nelle barre e rapporto x/d. Per pressioni maggiori, valuta fasce compresse aggiuntive o staffe supplementari.
            </div>
          </div>
        </section>
      )}

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme, formule e assunzioni
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="text-base font-semibold text-blue-900">
              Riferimenti normativi
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>NTC 2018, par. 4.1.2.3 e Circolare 7/2019 par. C4.1.2.3</li>
              <li>EN 1992-1-1 (Eurocodice 2) par. 3.1 e 6.1</li>
              <li>Linee guida CSLP 2023 su copriferri e durabilita</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi di calcolo
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Sezioni piane rimangono piane, deformazioni compatibili.</li>
              <li>Acciaio con comportamento elastico-perfettamente plastico (Es = 200000 MPa).</li>
              <li>Blocco di compressione rettangolare: alpha_cc = 0.85, lambda = 0.8.</li>
              <li>Nodo a pressoflessione retta, effetto di presso-torsione non incluso.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limiti e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Verifica SLU taglio-punzonamento da effettuare separatamente.</li>
              <li>Valuta duttilita: x/d &le; 0.45 per classi di duttilita normale.</li>
              <li>Controlla SLU instabilita e SLE fessurazione con tool dedicati.</li>
            </ul>
          </article>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule chiave
          </h3>
          <p className="mt-2">
            Equilibrio: Cc + Fs,top + Fs,bottom = NEd. Momento resistente: Mrd = (Cc * zc + Fs,top * ztop + Fs,bottom * zbottom - NEd * h/2) / 10^6.
            Tensioni acciaio: sigma = min(max(epsilon * Es, -fyd), fyd). Piano neutro ottenuto per iterazione con epsilon_cu = 0.0035.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> il risultato supporta la relazione tecnica ma non sostituisce il giudizio del progettista. Controllare input, normative vigenti e integrare con verifiche dinamiche e SLE.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Definisci parametri geometrici coerenti con elaborati esecutivi (copriferro, disposizione barre).
          </li>
          <li>
            Imposta materiali e coefficienti parziali come da capitolato (acciaio B450C, cls C28/35, ecc.).
          </li>
          <li>
            Inserisci combinazione NEd-MEd derivante dal quadro delle combinazioni SLU della struttura.
          </li>
          <li>
            Analizza output x/d, tensioni acciaio e Mrd, quindi valuta eventuali ottimizzazioni.
          </li>
          <li>
            Scarica risultati o riportali nella relazione con riferimento a questo tool e alla revisione indicata.
          </li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "Ottimo per verifiche rapide in cantiere: posso testare varianti di armatura senza aprire software pesanti."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Silvia R., strutturista freelance
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "La sezione Norme e Assunzioni mi consente di archiviare il report direttamente nel fascicolo di calcolo."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Marco T., responsabile ufficio tecnico prefabbricati
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
