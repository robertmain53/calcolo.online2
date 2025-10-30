'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface SteelSection {
  name: string;
  height: number; // mm
  flangeWidth: number; // mm
  webThickness: number; // mm
  flangeThickness: number; // mm
  area: number; // cm^2
  inertiaMajor: number; // cm^4
  welMajor: number; // cm^3
  wplMajor: number; // cm^3
}

interface CalculationResult {
  sectionClass: number;
  sectionClassDetail: string;
  plasticMomentResistance: number;
  shearResistance: number;
  momentUtilization: number;
  shearUtilization: number;
  deflection: number;
  deflectionLimit: number;
  deflectionUtilization: number;
  shearReductionMessage?: string;
  warning?: string;
  summary: Array<{ label: string; value: string }>;
}

const steelSections: SteelSection[] = [
  {
    name: 'IPE 160',
    height: 160,
    flangeWidth: 82,
    webThickness: 5,
    flangeThickness: 7.4,
    area: 20.1,
    inertiaMajor: 2030,
    welMajor: 255,
    wplMajor: 301,
  },
  {
    name: 'IPE 200',
    height: 200,
    flangeWidth: 100,
    webThickness: 5.6,
    flangeThickness: 8.5,
    area: 26.2,
    inertiaMajor: 4280,
    welMajor: 428,
    wplMajor: 473,
  },
  {
    name: 'IPE 240',
    height: 240,
    flangeWidth: 120,
    webThickness: 6.2,
    flangeThickness: 9.8,
    area: 31.4,
    inertiaMajor: 7110,
    welMajor: 592,
    wplMajor: 672,
  },
  {
    name: 'IPE 300',
    height: 300,
    flangeWidth: 150,
    webThickness: 6.8,
    flangeThickness: 10.7,
    area: 42.2,
    inertiaMajor: 14500,
    welMajor: 969,
    wplMajor: 1110,
  },
  {
    name: 'HEA 200',
    height: 190,
    flangeWidth: 200,
    webThickness: 6.5,
    flangeThickness: 10,
    area: 52.9,
    inertiaMajor: 11000,
    welMajor: 1160,
    wplMajor: 1280,
  },
  {
    name: 'HEA 240',
    height: 230,
    flangeWidth: 240,
    webThickness: 7,
    flangeThickness: 11,
    area: 65.3,
    inertiaMajor: 18700,
    welMajor: 1630,
    wplMajor: 1830,
  },
  {
    name: 'HEB 240',
    height: 240,
    flangeWidth: 240,
    webThickness: 9,
    flangeThickness: 15,
    area: 92.5,
    inertiaMajor: 25900,
    welMajor: 2160,
    wplMajor: 2550,
  },
  {
    name: 'UNP 200',
    height: 200,
    flangeWidth: 75,
    webThickness: 8.5,
    flangeThickness: 13.5,
    area: 26.1,
    inertiaMajor: 2690,
    welMajor: 269,
    wplMajor: 299,
  },
];

const steelGrades: Record<string, number> = {
  S235: 235,
  S275: 275,
  S355: 355,
  S420: 420,
};

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function classifySection(
  h: number,
  bf: number,
  tw: number,
  tf: number,
  fy: number
) {
  if (h <= 0 || bf <= 0 || tw <= 0 || tf <= 0 || fy <= 0) {
    return { sectionClass: 4, detail: 'Parametri incompleti' };
  }

  const epsilon = Math.sqrt(235 / fy);
  const cFlange = (bf - tw) / 2;
  const lambdaFlange = cFlange / tf;

  let flangeClass = 4;
  if (lambdaFlange <= 9 * epsilon) {
    flangeClass = 1;
  } else if (lambdaFlange <= 10 * epsilon) {
    flangeClass = 2;
  } else if (lambdaFlange <= 14 * epsilon) {
    flangeClass = 3;
  }

  const cWeb = (h - 2 * tf) / tw;
  let webClass = 4;
  if (cWeb <= 72 * epsilon) {
    webClass = 1;
  } else if (cWeb <= 83 * epsilon) {
    webClass = 2;
  } else if (cWeb <= 124 * epsilon) {
    webClass = 3;
  }

  const sectionClass = Math.max(flangeClass, webClass);
  const detail = `Flangia classe ${flangeClass}, anima classe ${webClass}`;
  return { sectionClass, detail };
}

export default function SteelBeamSLUCalculator() {
  const [selectedSection, setSelectedSection] = useState(steelSections[1].name);
  const [height, setHeight] = useState(steelSections[1].height.toString());
  const [flangeWidth, setFlangeWidth] = useState(
    steelSections[1].flangeWidth.toString()
  );
  const [webThickness, setWebThickness] = useState(
    steelSections[1].webThickness.toString()
  );
  const [flangeThickness, setFlangeThickness] = useState(
    steelSections[1].flangeThickness.toString()
  );
  const [area, setArea] = useState(steelSections[1].area.toString());
  const [inertia, setInertia] = useState(steelSections[1].inertiaMajor.toString());
  const [wel, setWel] = useState(steelSections[1].welMajor.toString());
  const [wpl, setWpl] = useState(steelSections[1].wplMajor.toString());

  const [steelGrade, setSteelGrade] = useState('S355');
  const [gammaM0, setGammaM0] = useState('1.0');
  const [chiLT, setChiLT] = useState('1.0');
  const [span, setSpan] = useState('6.0');
  const [uniformLoad, setUniformLoad] = useState('25');
  const [designMoment, setDesignMoment] = useState('220');
  const [designShear, setDesignShear] = useState('180');
  const [deflectionLimitRatio, setDeflectionLimitRatio] = useState('250');

  useEffect(() => {
    const section = steelSections.find((item) => item.name === selectedSection);
    if (section) {
      setHeight(section.height.toString());
      setFlangeWidth(section.flangeWidth.toString());
      setWebThickness(section.webThickness.toString());
      setFlangeThickness(section.flangeThickness.toString());
      setArea(section.area.toString());
      setInertia(section.inertiaMajor.toString());
      setWel(section.welMajor.toString());
      setWpl(section.wplMajor.toString());
    }
  }, [selectedSection]);

  const result = useMemo<CalculationResult | null>(() => {
    const h = toNumber(height);
    const bf = toNumber(flangeWidth);
    const tw = toNumber(webThickness);
    const tf = toNumber(flangeThickness);
    const areaCm2 = toNumber(area);
    const inertiaCm4 = toNumber(inertia);
    const welCm3 = toNumber(wel);
    const wplCm3 = toNumber(wpl);
    const fy = steelGrades[steelGrade] ?? 355;
    const gamma = Math.max(0.1, toNumber(gammaM0));
    const chi = Math.max(0.1, Math.min(1, toNumber(chiLT)));
    const spanM = toNumber(span);
    const wUdl = Math.max(0, toNumber(uniformLoad));
    const mEd = Math.max(0, toNumber(designMoment));
    const vEd = Math.max(0, toNumber(designShear));
    const deflectionRatio = Math.max(50, toNumber(deflectionLimitRatio));

    if (
      h <= 0 ||
      bf <= 0 ||
      tw <= 0 ||
      tf <= 0 ||
      areaCm2 <= 0 ||
      inertiaCm4 <= 0 ||
      welCm3 <= 0 ||
      fy <= 0
    ) {
      return null;
    }

    const { sectionClass, detail } = classifySection(h, bf, tw, tf, fy);

    const areaMm2 = areaCm2 * 100;
    const inertiaMm4 = inertiaCm4 * 10000;
    const welMm3 = welCm3 * 1000;
    const wplMm3 = wplCm3 * 1000;

    let mrdBase =
      (sectionClass <= 2 ? wplMm3 : welMm3) * (fy / gamma) / 1_000_000;
    if (sectionClass >= 4) {
      mrdBase = (0.9 * welMm3 * (fy / gamma)) / 1_000_000;
    }
    const mRd = mrdBase * chi;

    const av = h * tw; // mm^2
    const vRd = (av * fy) / (Math.sqrt(3) * gamma) / 1000;

    const momentUtilization = mRd > 0 ? (mEd / mRd) * 100 : 0;
    const shearUtilization = vRd > 0 ? (vEd / vRd) * 100 : 0;

    const spanMm = spanM * 1000;
    const loadNPerMm = wUdl;
    const deflection =
      spanM > 0 && wUdl > 0
        ? (5 * loadNPerMm * spanMm ** 4) / (384 * 210000 * inertiaMm4)
        : 0;
    const deflectionLimit = spanMm / deflectionRatio;
    const deflectionUtilization =
      deflectionLimit > 0 ? (deflection / deflectionLimit) * 100 : 0;

    let shearReductionMessage: string | undefined;
    if (vEd > 0.5 * vRd) {
      shearReductionMessage =
        'Shear demand maggiore di 0.5 Vpl,Rd: considera la riduzione del momento resistente secondo EN 1993-1-1 par. 6.2.8.';
    }

    let warning: string | undefined;
    if (momentUtilization > 100 || shearUtilization > 100) {
      warning =
        'La combinazione di progetto supera le resistenze calcolate. Incrementa la sezione o riduci le sollecitazioni.';
    } else if (deflectionUtilization > 100) {
      warning =
        'La deformata di esercizio supera il limite impostato. Valuta rinforzo o riduzione della luce libera.';
    } else if (sectionClass === 4) {
      warning =
        'Sezione di classe 4: necessario calcolo di sezione efficace e riduzione delle resistenze locali.';
    }

    const summary = [
      {
        label: 'Classe della sezione',
        value: `Classe ${sectionClass} (${detail})`,
      },
      {
        label: 'Mrd',
        value: `${round(mRd, 1)} kNm`,
      },
      {
        label: 'Vrd',
        value: `${round(vRd, 1)} kN`,
      },
      {
        label: 'Utilizzo momento',
        value: `${round(momentUtilization, 1)} %`,
      },
      {
        label: 'Utilizzo taglio',
        value: `${round(shearUtilization, 1)} %`,
      },
      {
        label: 'Freccia calcolata',
        value: `${round(deflection, 2)} mm (limite ${round(deflectionLimit, 2)} mm)`,
      },
    ];

    return {
      sectionClass,
      sectionClassDetail: detail,
      plasticMomentResistance: mRd,
      shearResistance: vRd,
      momentUtilization,
      shearUtilization,
      deflection,
      deflectionLimit,
      deflectionUtilization,
      shearReductionMessage,
      warning,
      summary,
    };
  }, [
    height,
    flangeWidth,
    webThickness,
    flangeThickness,
    area,
    inertia,
    wel,
    wpl,
    steelGrade,
    gammaM0,
    chiLT,
    span,
    uniformLoad,
    designMoment,
    designShear,
    deflectionLimitRatio,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dati della trave in acciaio
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Seleziona un profilo standard oppure inserisci manualmente i parametri
          geometrici. Le resistenze sono calcolate allo stato limite ultimo
          secondo EN 1993-1-1 (NTC 2018).
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="sectionName" className="calculator-label">
                Profilo laminato o saldato
              </label>
              <select
                id="sectionName"
                value={selectedSection}
                onChange={(event) => setSelectedSection(event.target.value)}
                className="calculator-input"
              >
                {steelSections.map((section) => (
                  <option key={section.name} value={section.name}>
                    {section.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                La scelta popola automaticamente i parametri geometrici, modificabili in seguito.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="height" className="calculator-label">
                  Altezza h (mm)
                </label>
                <input
                  id="height"
                  type="number"
                  step="1"
                  min="80"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="flangeWidth" className="calculator-label">
                  Larghezza ala b<sub>f</sub> (mm)
                </label>
                <input
                  id="flangeWidth"
                  type="number"
                  step="1"
                  min="40"
                  value={flangeWidth}
                  onChange={(event) => setFlangeWidth(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="webThickness" className="calculator-label">
                  Spessore anima t<sub>w</sub> (mm)
                </label>
                <input
                  id="webThickness"
                  type="number"
                  step="0.1"
                  min="3"
                  value={webThickness}
                  onChange={(event) => setWebThickness(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="flangeThickness" className="calculator-label">
                  Spessore ala t<sub>f</sub> (mm)
                </label>
                <input
                  id="flangeThickness"
                  type="number"
                  step="0.1"
                  min="3"
                  value={flangeThickness}
                  onChange={(event) => setFlangeThickness(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
                <label htmlFor="area" className="calculator-label">
                Area A (cm^2)
              </label>
              <input
                id="area"
                type="number"
                step="0.1"
                min="1"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div>
                <label htmlFor="inertia" className="calculator-label">
                Momento d inerzia I<sub>y</sub> (cm^4)
              </label>
              <input
                id="inertia"
                type="number"
                step="1"
                min="1"
                value={inertia}
                onChange={(event) => setInertia(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                  <label htmlFor="wel" className="calculator-label">
                  Modulo elastico W<sub>el,y</sub> (cm^3)
                </label>
                <input
                  id="wel"
                  type="number"
                  step="1"
                  min="1"
                  value={wel}
                  onChange={(event) => setWel(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                  <label htmlFor="wpl" className="calculator-label">
                  Modulo plastico W<sub>pl,y</sub> (cm^3)
                </label>
                <input
                  id="wpl"
                  type="number"
                  step="1"
                  min="1"
                  value={wpl}
                  onChange={(event) => setWpl(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="steelGrade" className="calculator-label">
                  Acciaio (f<sub>y</sub>)
                </label>
                <select
                  id="steelGrade"
                  value={steelGrade}
                  onChange={(event) => setSteelGrade(event.target.value)}
                  className="calculator-input"
                >
                  {Object.keys(steelGrades).map((grade) => (
                    <option key={grade} value={grade}>
                      {grade} (fy = {steelGrades[grade]} MPa)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="gammaM0" className="calculator-label">
                  gamma<sub>M0</sub>
                </label>
                <input
                  id="gammaM0"
                  type="number"
                  step="0.01"
                  min="0.9"
                  value={gammaM0}
                  onChange={(event) => setGammaM0(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="chiLT" className="calculator-label">
                Fattore instabilita chi<sub>LT</sub>
              </label>
              <input
                id="chiLT"
                type="number"
                step="0.05"
                min="0.2"
                max="1"
                value={chiLT}
                onChange={(event) => setChiLT(event.target.value)}
                className="calculator-input"
              />
              <p className="text-xs text-gray-500 mt-1">
                Inserisci il coefficiente di riduzione per instabilita laterale, se necessario (default 1.0 senza riduzioni).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="span" className="calculator-label">
                  Luce libera L (m)
                </label>
                <input
                  id="span"
                  type="number"
                  step="0.1"
                  min="1"
                  value={span}
                  onChange={(event) => setSpan(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="uniformLoad" className="calculator-label">
                  Carico distribuito q (kN/m)
                </label>
                <input
                  id="uniformLoad"
                  type="number"
                  step="0.5"
                  min="0"
                  value={uniformLoad}
                  onChange={(event) => setUniformLoad(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="designMoment" className="calculator-label">
                  MEd (kNm)
                </label>
                <input
                  id="designMoment"
                  type="number"
                  step="1"
                  min="0"
                  value={designMoment}
                  onChange={(event) => setDesignMoment(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="designShear" className="calculator-label">
                  VEd (kN)
                </label>
                <input
                  id="designShear"
                  type="number"
                  step="1"
                  min="0"
                  value={designShear}
                  onChange={(event) => setDesignShear(event.target.value)}
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
            Controlla che geometria, area e moduli sezionali siano definiti correttamente.
          </p>
        </section>
      )}

      {result && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati verifica SLU trave in acciaio
            </h2>
            <p className="text-sm text-gray-600">
              La verifica considera resistenza a flessione e taglio con classificazione della sezione. Il controllo di deformabilita sfrutta il modulo elastico della sezione fornita.
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
                {round(result.plasticMomentResistance, 1)} kNm
              </p>
              <p className="text-sm text-gray-600">
                Utilizzo MEd/Mrd: {round(result.momentUtilization, 1)} %
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Taglio resistente
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.shearResistance, 1)} kN
              </p>
              <p className="text-sm text-gray-600">
                Utilizzo VEd/Vrd: {round(result.shearUtilization, 1)} %
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Freccia di esercizio
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.deflection, 2)} mm
              </p>
              <p className="text-sm text-gray-600">
                Limite: {round(result.deflectionLimit, 2)} mm (
                {round(result.deflectionUtilization, 1)} %)
              </p>
            </div>
          </div>

          {result.shearReductionMessage && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              {result.shearReductionMessage}
            </div>
          )}

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
            <strong>Nota operativa:</strong> esporta i risultati nella relazione tecnica indicando sezione, classe, resistenze e coefficienti utilizzati. Per valutare instabilita flesso torsionale utilizza chi specifico da EN 1993-1-1 par. 6.3.2.
          </div>
        </section>
      )}

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Normativa, assunzioni e formule
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <h3 className="text-base font-semibold text-blue-900">
              Riferimenti normativi
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>NTC 2018, Cap. 4.2.4 e Circolare 7/2019 C4.2.4</li>
              <li>EN 1993-1-1 par. 5.5, 6.2 e 6.3</li>
              <li>UNI EN 1993-1-5 per elementi sottili (classe 4)</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi del modello
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Sezioni piane rimangono piane, acciaio elastico perfettamente plastico.</li>
              <li>Calcolo in asse forte (y-y) senza torsione aggiuntiva.</li>
              <li>Taglio distribuito sull anima, nessuna riduzione per fori o connettori.</li>
              <li>Instabilita laterale considerata tramite coefficiente chi inserito dal progettista.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Integra con verifica al taglio forato, resistenza dei collegamenti e fatica.</li>
              <li>Per sezioni saldate calcolare la classe delle piastre effettive.</li>
              <li>Controlla SLE frequente (vibrazioni e frecce a lungo termine) con tool dedicati.</li>
            </ul>
          </article>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            Mrd = chi * W<sub>pl,y</sub> * fy / gamma<sub>M0</sub> (classi 1-2) oppure
            chi * W<sub>el,y</sub> * fy / gamma<sub>M0</sub> (classe 3). Vrd =
            (A<sub>v</sub> * fy) / (sqrt(3) * gamma<sub>M0</sub>). Classi
            flangia: (c/t<sub>f</sub>) / epsilon, classi anima:
            (h - 2 t<sub>f</sub>) / (t<sub>w</sub> * epsilon).
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> il calcolo supporta la relazione SLU ma non sostituisce il giudizio del progettista. Verifica instabilita, collegamenti e effetti del secondo ordine con analisi dedicate.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Scegli il profilo reale dal catalogo o inserisci valori derivati da sezione saldata.
          </li>
          <li>
            Imposta acciaio, coefficienti di sicurezza e chi per instabilita laterale in funzione della classe di duttilita richiesta.
          </li>
          <li>
            Inserisci sollecitazioni di progetto (MEd, VEd) e carico uniforme per il controllo SLE.
          </li>
          <li>
            Analizza resistenze e utilizzi: mantieni valori inferiori al 90 % per garantire margine operativo.
          </li>
          <li>
            Integra il report nel fascicolo tecnico citando norme e ipotesi riportate in questa pagina.
          </li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "In pochi minuti ottengo classificazione, resistenze e controllo SLE completo per travi principali e secondarie."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Federica L., studio strutture acciaio
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "La sezione Norme e Formule mi consente di allegare il report al PSC senza ulteriori annotazioni."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Paolo R., direzione lavori
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Strutture"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, EN 1993-1-1"
      />
    </div>
  );
}
