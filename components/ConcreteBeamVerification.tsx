'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface CalculationResult {
  designMoment: number;
  designShear: number;
  momentCapacity: number;
  shearCapacity: number;
  bendingUtilization: number;
  shearUtilization: number;
  deflection: number;
  deflectionLimit: number;
  deflectionUtilization: number;
  neutralAxisDepth: number;
  summary: Array<{ label: string; value: string }>;
  warnings: string[];
}

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeResult(params: {
  span: number;
  deadLoad: number;
  liveLoad: number;
  gammaG: number;
  gammaQ: number;
  width: number;
  height: number;
  cover: number;
  tensileArea: number;
  compressiveArea: number;
  fck: number;
  fyk: number;
  gammaC: number;
  gammaS: number;
  deflectionLimitRatio: number;
}) {
  const {
    span,
    deadLoad,
    liveLoad,
    gammaG,
    gammaQ,
    width,
    height,
    cover,
    tensileArea,
    compressiveArea,
    fck,
    fyk,
    gammaC,
    gammaS,
    deflectionLimitRatio,
  } = params;

  const totalDead = deadLoad;
  const totalLive = liveLoad;
  const designLoad = gammaG * totalDead + gammaQ * totalLive;
  const serviceLoad = totalDead + totalLive;

  const designMoment = (designLoad * span ** 2) / 8;
  const designShear = (designLoad * span) / 2;

  const effectiveDepth = height - cover - 0.012;
  const compressionDepth = cover + 0.012;

  const areaT = tensileArea;
  const areaC = compressiveArea;

  const fcd = (fck * 1e6) / gammaC;
  const fyd = (fyk * 1e6) / gammaS;

  const leverArm = effectiveDepth - (areaT * fyd) / (0.85 * fcd * width * 1.0);
  const neutralAxis = (areaT * fyd) / (0.85 * fcd * width);
  const momentCapacity = areaT * fyd * (effectiveDepth - neutralAxis / 2) / 1e6;

  const shearCapacityConcrete =
    (0.6 * width * effectiveDepth * Math.sqrt(fck * 1e6)) / 1e3;
  const shearCapacitySteel = (areaC * fyd * leverArm) / (span * 1e3);
  const shearCapacity = shearCapacityConcrete + shearCapacitySteel;

  const inertia = (width * height ** 3) / 12;
  const modulusElasticity = 30000 * 1e6;
  const deflection =
    (5 * serviceLoad * span ** 4) /
    (384 * modulusElasticity * inertia);

  const deflectionLimit = span * 1000 / deflectionLimitRatio;
  const deflectionUtilization =
    deflectionLimit > 0 ? (deflection * 1000 / deflectionLimit) * 100 : 0;

  const bendingUtilization =
    momentCapacity > 0 ? (designMoment / momentCapacity) * 100 : 0;
  const shearUtilization =
    shearCapacity > 0 ? (designShear / shearCapacity) * 100 : 0;

  const summary: CalculationResult['summary'] = [
    { label: 'Carico SLU qd [kN/m]', value: round(designLoad, 2).toString() },
    { label: 'Momento Md [kNm]', value: round(designMoment, 2).toString() },
    { label: 'Taglio Vd [kN]', value: round(designShear, 2).toString() },
    { label: 'Resistenza flessione [kNm]', value: round(momentCapacity, 2).toString() },
    { label: 'Resistenza taglio [kN]', value: round(shearCapacity, 2).toString() },
    { label: 'Freccia [mm]', value: round(deflection * 1000, 2).toString() },
  ];

  const warnings: string[] = [];
  if (bendingUtilization > 100) warnings.push('Verifica a flessione non soddisfatta: aumentare area di armatura o dimensioni della sezione.');
  if (shearUtilization > 100) warnings.push('Verifica a taglio non soddisfatta: prevedere staffe aggiuntive o incrementare la sezione.');
  if (deflectionUtilization > 100) warnings.push('Freccia oltre il limite L / ' + deflectionLimitRatio + '.');

  return {
    designMoment,
    designShear,
    momentCapacity,
    shearCapacity,
    bendingUtilization,
    shearUtilization,
    deflection,
    deflectionLimit,
    deflectionUtilization,
    neutralAxisDepth: neutralAxis,
    summary,
    warnings,
  };
}

export default function ConcreteBeamVerification() {
  const [span, setSpan] = useState('5.0');
  const [deadLoad, setDeadLoad] = useState('4.0');
  const [liveLoad, setLiveLoad] = useState('2.5');
  const [gammaG, setGammaG] = useState('1.3');
  const [gammaQ, setGammaQ] = useState('1.5');
  const [width, setWidth] = useState('0.3');
  const [height, setHeight] = useState('0.55');
  const [cover, setCover] = useState('0.05');
  const [tensileArea, setTensileArea] = useState('0.0006');
  const [compressiveArea, setCompressiveArea] = useState('0.0002');
  const [fck, setFck] = useState('30');
  const [fyk, setFyk] = useState('450');
  const [gammaC, setGammaC] = useState('1.5');
  const [gammaS, setGammaS] = useState('1.15');
  const [deflectionLimitRatio, setDeflectionLimitRatio] = useState('250');

  const result = useMemo<CalculationResult | null>(() => {
    const L = toNumber(span);
    const Gk = toNumber(deadLoad);
    const Qk = toNumber(liveLoad);
    const gammaGVal = Math.max(1, toNumber(gammaG));
    const gammaQVal = Math.max(1, toNumber(gammaQ));
    const b = toNumber(width);
    const h = toNumber(height);
    const c = toNumber(cover);
    const As = toNumber(tensileArea);
    const AsComp = toNumber(compressiveArea);
    const fckVal = toNumber(fck);
    const fykVal = toNumber(fyk);
    const gammaCVal = Math.max(1, toNumber(gammaC));
    const gammaSVal = Math.max(1, toNumber(gammaS));
    const limitRatio = Math.max(150, toNumber(deflectionLimitRatio));

    if (L <= 0 || b <= 0 || h <= 0 || As <= 0 || fckVal <= 0 || fykVal <= 0) {
      return null;
    }

    return computeResult({
      span: L,
      deadLoad: Gk,
      liveLoad: Qk,
      gammaG: gammaGVal,
      gammaQ: gammaQVal,
      width: b,
      height: h,
      cover: c,
      tensileArea: As,
      compressiveArea: AsComp,
      fck: fckVal,
      fyk: fykVal,
      gammaC: gammaCVal,
      gammaS: gammaSVal,
      deflectionLimitRatio: limitRatio,
    });
  }, [
    span,
    deadLoad,
    liveLoad,
    gammaG,
    gammaQ,
    width,
    height,
    cover,
    tensileArea,
    compressiveArea,
    fck,
    fyk,
    gammaC,
    gammaS,
    deflectionLimitRatio,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dati della trave in cemento armato
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci geometria, armature e carichi distribuiti. Il calcolo applica le verifiche allo stato limite ultimo e di esercizio per una trave semplicemente appoggiata con distribuzione uniforme.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="span" className="calculator-label">
                  Luce L (m)
                </label>
                <input
                  id="span"
                  type="number"
                  step="0.1"
                  min="2"
                  value={span}
                  onChange={(event) => setSpan(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="width" className="calculator-label">
                  Larghezza b (m)
                </label>
                <input
                  id="width"
                  type="number"
                  step="0.01"
                  min="0.2"
                  value={width}
                  onChange={(event) => setWidth(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="height" className="calculator-label">
                  Altezza h (m)
                </label>
                <input
                  id="height"
                  type="number"
                  step="0.01"
                  min="0.3"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="cover" className="calculator-label">
                  Copriferro (m)
                </label>
                <input
                  id="cover"
                  type="number"
                  step="0.005"
                  min="0.03"
                  value={cover}
                  onChange={(event) => setCover(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tensileArea" className="calculator-label">
                  Area armatura tesa (m^2)
                </label>
                <input
                  id="tensileArea"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={tensileArea}
                  onChange={(event) => setTensileArea(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="compressiveArea" className="calculator-label">
                  Area armatura compressa (m^2)
                </label>
                <input
                  id="compressiveArea"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={compressiveArea}
                  onChange={(event) => setCompressiveArea(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="deadLoad" className="calculator-label">
                  Carico Gk (kN/m)
                </label>
                <input
                  id="deadLoad"
                  type="number"
                  step="0.1"
                  min="1"
                  value={deadLoad}
                  onChange={(event) => setDeadLoad(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="liveLoad" className="calculator-label">
                  Carico Qk (kN/m)
                </label>
                <input
                  id="liveLoad"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={liveLoad}
                  onChange={(event) => setLiveLoad(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gammaG" className="calculator-label">
                  gamma G
                </label>
                <input
                  id="gammaG"
                  type="number"
                  step="0.05"
                  min="1"
                  value={gammaG}
                  onChange={(event) => setGammaG(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="gammaQ" className="calculator-label">
                  gamma Q
                </label>
                <input
                  id="gammaQ"
                  type="number"
                  step="0.05"
                  min="1"
                  value={gammaQ}
                  onChange={(event) => setGammaQ(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fck" className="calculator-label">
                  Calcestruzzo fck (MPa)
                </label>
                <input
                  id="fck"
                  type="number"
                  step="5"
                  min="25"
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
                  step="10"
                  min="400"
                  value={fyk}
                  onChange={(event) => setFyk(event.target.value)}
                  className="calculator-input"
                />
              </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gammaC" className="calculator-label">
                  gamma C
                </label>
                <input
                  id="gammaC"
                  type="number"
                  step="0.05"
                  min="1.2"
                  value={gammaC}
                  onChange={(event) => setGammaC(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="gammaS" className="calculator-label">
                  gamma S
                </label>
                <input
                  id="gammaS"
                  type="number"
                  step="0.05"
                  min="1.0"
                  value={gammaS}
                  onChange={(event) => setGammaS(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="deflectionLimitRatio" className="calculator-label">
                Limite freccia (L / ?)
              </label>
              <input
                id="deflectionLimitRatio"
                type="number"
                step="10"
                min="150"
                value={deflectionLimitRatio}
                onChange={(event) => setDeflectionLimitRatio(event.target.value)}
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
            Verifica geometria, armature e resistenze inserite. Tutti i valori devono essere maggiori di zero.
          </p>
        </section>
      )}

      {result && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Verifiche SLU e SLE
            </h2>
            <p className="text-sm text-gray-600">
              Domande e resistenze sono riferite alla trave completa; assumiamo comportamento semplicemente appoggiato con carico uniforme.
            </p>
          </header>

          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Flessione
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                Utilizzo {round(result.bendingUtilization, 1)} %
              </p>
              <p className="text-sm text-gray-600">
                Md = {round(result.designMoment, 2)} kNm / Rd = {round(result.momentCapacity, 2)} kNm
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Taglio
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                Utilizzo {round(result.shearUtilization, 1)} %
              </p>
              <p className="text-sm text-gray-600">
                Vd = {round(result.designShear, 2)} kN / Rd = {round(result.shearCapacity, 2)} kN
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Freccia
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.deflection * 1000, 2)} mm
              </p>
              <p className="text-sm text-gray-600">
                Utilizzo {round(result.deflectionUtilization, 1)} % (limite L / {deflectionLimitRatio})
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
                {result.summary.map((item) => (
                  <tr key={item.label}>
                    <td className="px-4 py-2 text-gray-700">{item.label}</td>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <strong>Nota operativa:</strong> confronta gli utilizzi con i valori di progetto (tipicamente &lt; 90%). In caso di eccessi, incrementa la sezione, migliora la classe del calcestruzzo o modifica l'armatura.
          </div>
        </section>
      )}

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Norme, ipotesi e formule
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="text-base font-semibold text-blue-900">
              Riferimenti normativi
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>NTC 2018, Capitolo 4.1.2 e 4.1.2.1</li>
              <li>Circolare 7/2019, paragrafi C4.1.2.1 e C4.1.2.2</li>
              <li>Eurocodice 2 EN 1992-1-1</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi di calcolo
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Trave semplicemente appoggiata con carico distribuito.</li>
              <li>Sezione rettangolare omogenea, comportamento elastico lineare.</li>
              <li>Armatura tesa principale, compressa opzionale.</li>
              <li>Fattori di sicurezza gamma C e gamma S impostati dall'utente.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Integra con verifica a taglio puntuale e fessurazione secondo NTC/EC2.</li>
              <li>Per carichi non uniformi o travi continue usare modelli avanzati.</li>
              <li>Controlla le larghezze d'inflessione e i dettagli costruttivi (ancoraggi, staffe).</li>
            </ul>
          </article>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            M = q * L^2 / 8; V = q * L / 2. Resistenza flessione: Md,Rd = As * fyd * (d - x/2) / 10^6 con x = As * fyd / (0.85 * fcd * b). Freccia elastica: f = 5 * q * L^4 / (384 * E * I).
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> il calcolo fornisce una verifica preliminare. Effettua sempre il progetto completo (fessurazione, duttilita, dettagli costruttivi) secondo NTC 2018 e Eurocodice 2.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Definisci carichi permanenti e variabili dalle combinazioni NTC 2018.</li>
          <li>Inserisci geometria e copriferro, scegliendo un'armatura di prova.</li>
          <li>Verifica flessione, taglio e freccia; modifica la soluzione fino ad avere utilizzo &lt; 90%.</li>
          <li>Controlla le verifiche aggiuntive (fessurazione, punzonamento, ancoraggi) con tool dedicati.</li>
          <li>Riporta il quadro delle verifiche nella relazione tecnica con riferimenti normativi e ipotesi adottate.</li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "Perfetto per confrontare rapidamente soluzioni di travi secondarie con carichi diversi."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Laura M., studio strutture CA
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "Il riepilogo normativo e delle formule mi consente di allegare subito il calcolo al fascicolo digitale."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Paolo T., direttore lavori
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Strutture"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, Circolare 7/2019, EN 1992-1-1"
      />
    </div>
  );
}

