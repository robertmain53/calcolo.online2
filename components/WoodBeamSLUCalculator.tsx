'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface WoodClass {
  name: string;
  fmk: number; // bending strength characteristic MPa
  fv0k: number; // shear strength characteristic MPa
  e0mean: number; // mean modulus GPa
}

const woodClasses: Record<string, WoodClass> = {
  C16: { name: 'C16', fmk: 16, fv0k: 2.5, e0mean: 8 },
  C24: { name: 'C24', fmk: 24, fv0k: 4, e0mean: 11 },
  C30: { name: 'C30', fmk: 30, fv0k: 4.5, e0mean: 12 },
  GL24h: { name: 'GL24h', fmk: 24, fv0k: 3.5, e0mean: 11.5 },
  GL28h: { name: 'GL28h', fmk: 28, fv0k: 4.0, e0mean: 12.5 },
};

interface CalculationResult {
  designMoment: number;
  designShear: number;
  bendingStress: number;
  shearStress: number;
  bendingCapacity: number;
  shearCapacity: number;
  bendingUtilization: number;
  shearUtilization: number;
  deflection: number;
  deflectionLimit: number;
  deflectionUtilization: number;
  summary: Array<{ label: string; value: string }>;
  warnings: string[];
}

function toNumber(value: string, fallback = 0) {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeResult(params: {
  span: number;
  width: number;
  height: number;
  deadLoad: number;
  liveLoad: number;
  gammaG: number;
  gammaQ: number;
  wood: WoodClass;
  kmod: number;
  gammaM: number;
  deflectionLimitRatio: number;
}) {
  const {
    span,
    width,
    height,
    deadLoad,
    liveLoad,
    gammaG,
    gammaQ,
    wood,
    kmod,
    gammaM,
    deflectionLimitRatio,
  } = params;

  const selfWeight = (width * height * 4.9); // approx 4.9 kN/m^3 for timber times section area in m^2
  const totalDead = deadLoad + selfWeight;
  const designLoad = gammaG * totalDead + gammaQ * liveLoad;
  const serviceLoad = totalDead + liveLoad;

  const designMoment = (designLoad * span ** 2) / 8;
  const designShear = (designLoad * span) / 2;

  const plasticSectionModulus = (width * height ** 2) / 6;
  const bendingStress = (designMoment * 1e6) / plasticSectionModulus;

  const shearArea = width * height * 0.67;
  const shearStress = (designShear * 1e3) / shearArea;

  const fmd = (wood.fmk * kmod * 1e6) / gammaM;
  const fvd = (wood.fv0k * kmod * 1e6) / gammaM;

  const bendingUtilization = fmd > 0 ? (bendingStress / fmd) * 100 : 0;
  const shearUtilization = fvd > 0 ? (shearStress / fvd) * 100 : 0;

  const inertia = (width * height ** 3) / 12;
  const eMean = wood.e0mean * 1e9;
  const deflection =
    (5 * serviceLoad * span ** 4) /
    (384 * eMean * inertia);

  const deflectionLimit = span * 1000 / deflectionLimitRatio;
  const deflectionUtilization =
    deflectionLimit > 0 ? (deflection * 1000 / deflectionLimit) * 100 : 0;

  const summary: CalculationResult['summary'] = [
    { label: 'Carico SLU qd [kN/m]', value: round(designLoad, 2).toString() },
    { label: 'Momento Md [kNm]', value: round(designMoment, 2).toString() },
    { label: 'Taglio Vd [kN]', value: round(designShear, 2).toString() },
    { label: 'sigma_d [MPa]', value: round(bendingStress / 1e6, 2).toString() },
    { label: 'tau_d [MPa]', value: round(shearStress / 1e6, 2).toString() },
    { label: 'Freccia [mm]', value: round(deflection * 1000, 2).toString() },
    { label: 'Utilizzo flessione %', value: round(bendingUtilization, 1).toString() },
    { label: 'Utilizzo taglio %', value: round(shearUtilization, 1).toString() },
  ];

  const warnings: string[] = [];
  if (bendingUtilization > 100) warnings.push('Verifica a flessione non soddisfatta: aumentare sezione o migliorare classe legno.');
  if (shearUtilization > 100) warnings.push('Verifica a taglio non soddisfatta: verifica connessioni o riduci il passo delle travi.');
  if (deflectionUtilization > 100) warnings.push('Freccia eccessiva rispetto a L / ' + deflectionLimitRatio + '.');

  return {
    designMoment,
    designShear,
    bendingStress,
    shearStress,
    bendingCapacity: fmd,
    shearCapacity: fvd,
    bendingUtilization,
    shearUtilization,
    deflection,
    deflectionLimit,
    deflectionUtilization,
    summary,
    warnings,
  };
}

export default function WoodBeamSLUCalculator() {
  const [span, setSpan] = useState('5.0');
  const [width, setWidth] = useState('0.12');
  const [height, setHeight] = useState('0.30');
  const [deadLoad, setDeadLoad] = useState('1.5');
  const [liveLoad, setLiveLoad] = useState('2.0');
  const [gammaG, setGammaG] = useState('1.3');
  const [gammaQ, setGammaQ] = useState('1.5');
  const [woodClass, setWoodClass] = useState('C24');
  const [kmod, setKmod] = useState('0.8');
  const [gammaM, setGammaM] = useState('1.3');
  const [deflectionLimitRatio, setDeflectionLimitRatio] = useState('300');

  const result = useMemo<CalculationResult | null>(() => {
    const L = toNumber(span);
    const b = toNumber(width);
    const h = toNumber(height);
    const Gk = toNumber(deadLoad);
    const Qk = toNumber(liveLoad);
    const gammaGVal = Math.max(1, toNumber(gammaG));
    const gammaQVal = Math.max(1, toNumber(gammaQ));
    const kmodVal = Math.max(0.3, toNumber(kmod));
    const gammaMVal = Math.max(1, toNumber(gammaM));
    const limit = Math.max(200, toNumber(deflectionLimitRatio));

    const classData = woodClasses[woodClass] ?? woodClasses.C24;

    if (L <= 0 || b <= 0 || h <= 0) {
      return null;
    }

    return computeResult({
      span: L,
      width: b,
      height: h,
      deadLoad: Gk,
      liveLoad: Qk,
      gammaG: gammaGVal,
      gammaQ: gammaQVal,
      wood: classData,
      kmod: kmodVal,
      gammaM: gammaMVal,
      deflectionLimitRatio: limit,
    });
  }, [
    span,
    width,
    height,
    deadLoad,
    liveLoad,
    gammaG,
    gammaQ,
    woodClass,
    kmod,
    gammaM,
    deflectionLimitRatio,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dati della trave in legno
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci dimensioni geometriche (m), carichi uniformi (kN/m^2) e parametri del materiale.
          Le verifiche si riferiscono a una trave semplicemente appoggiata con carico uniforme.
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
                  min="0.05"
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
                  min="0.1"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="deflectionLimitRatio" className="calculator-label">
                  Limite freccia (L / ?)
                </label>
                <input
                  id="deflectionLimitRatio"
                  type="number"
                  step="10"
                  min="200"
                  value={deflectionLimitRatio}
                  onChange={(event) => setDeflectionLimitRatio(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="deadLoad" className="calculator-label">
                  Gk (kN/m^2)
                </label>
                <input
                  id="deadLoad"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={deadLoad}
                  onChange={(event) => setDeadLoad(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="liveLoad" className="calculator-label">
                  Qk (kN/m^2)
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
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="woodClass" className="calculator-label">
                Classe legno
              </label>
              <select
                id="woodClass"
                value={woodClass}
                onChange={(event) => setWoodClass(event.target.value)}
                className="calculator-input"
              >
                {Object.keys(woodClasses).map((key) => (
                  <option key={key} value={key}>
                    {woodClasses[key].name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="kmod" className="calculator-label">
                  kmod (classe servizio)
                </label>
                <input
                  id="kmod"
                  type="number"
                  step="0.05"
                  min="0.4"
                  value={kmod}
                  onChange={(event) => setKmod(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="gammaM" className="calculator-label">
                  gamma M
                </label>
                <input
                  id="gammaM"
                  type="number"
                  step="0.05"
                  min="1"
                  value={gammaM}
                  onChange={(event) => setGammaM(event.target.value)}
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
            Parametri insufficienti
          </h3>
          <p className="text-sm text-red-800">
            Inserisci luce, sezione e carichi maggiori di zero. Seleziona una classe di legno valida.
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
              Spinte in kN, tensioni in MPa. Modello lineare elastico con sezione rettangolare equivalente.
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
                sigma_d = {round(result.bendingStress / 1e6, 2)} MPa / resistenza {round(result.bendingCapacity / 1e6, 2)} MPa
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
                tau_d = {round(result.shearStress / 1e6, 2)} MPa / resistenza {round(result.shearCapacity / 1e6, 2)} MPa
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
            <strong>Nota operativa:</strong> confronta i fattori di sicurezza con i valori di capitolato.
            Per travi composte o incollate, considera la verifica delle connessioni e la resistenza a strappo.
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
              <li>NTC 2018, Capitolo 4.4 - Strutture in legno</li>
              <li>Circolare 7/2019, paragrafi C4.4.5</li>
              <li>Eurocodice 5 EN 1995-1-1</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi del modello
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Sezione rettangolare piena, comportamento elastico lineare.</li>
              <li>Carico uniformemente distribuito su trave appoggiata.</li>
              <li>kmod inserito dall'utente in funzione di classe di servizio e durata carico.</li>
              <li>Autopeso travi calcolato automaticamente.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Integra con verifiche a instabilita laterale e fessurazione.</li>
              <li>Per travi composte incollate usare coefficienti di ripartizione corretti.</li>
              <li>Verifica le connessioni e gli appoggi secondo Eurocodice 5.</li>
            </ul>
          </article>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            M = q * L^2 / 8, V = q * L / 2, sigma = M / W, tau = 1.5 * V / (b * h),
            f = 5 * q * L^4 / (384 * E * I).
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> utilizza i risultati come supporto al progetto.
          Il progettista deve verificare i dettagli costruttivi e la conformita alle normative vigenti.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Raccogli carichi permanenti e accidentali secondo la destinazione d'uso.</li>
          <li>Seleziona la classe di legno e kmod coerente con classe di servizio.</li>
          <li>Inserisci dimensioni iniziali e verifica flessione, taglio e freccia.</li>
          <li>Ottimizza sezione o materiale fino a mantenere gli utilizzi sotto il 90 percento.</li>
          <li>Riporta il quadro delle verifiche nella relazione tecnica con i riferimenti normativi.</li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "Ideale per confrontare rapidamente travi lamellari con differenti interassi."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Davide S., progettista strutture in legno
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "Il riepilogo delle formule e delle norme facilita il passaggio alla relazione di calcolo."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Marta T., consulente EPC
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Strutture"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, Circolare 7/2019, EN 1995-1-1"
      />
    </div>
  );
}

