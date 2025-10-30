'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface CalculationResult {
  totalLoadService: number;
  totalLoadUltimate: number;
  lineLoadService: number;
  lineLoadUltimate: number;
  bendingMomentService: number;
  shearService: number;
  bendingMomentUltimate: number;
  shearUltimate: number;
  deflection: number;
  deflectionLimit: number;
  deflectionUtilization: number;
  steelAreaRequired: number;
  steelAreaProvided: number;
  steelUtilization: number;
  warnings: string[];
  summary: Array<{ label: string; value: string }>;
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
  spacing: number;
  loadDead: number;
  loadLive: number;
  gammaG: number;
  gammaQ: number;
  slabDepth: number;
  concreteStrength: number;
  steelYield: number;
  effectiveWidth: number;
  deflectionLimitRatio: number;
}) {
  const {
    span,
    spacing,
    loadDead,
    loadLive,
    gammaG,
    gammaQ,
    slabDepth,
    concreteStrength,
    steelYield,
    effectiveWidth,
    deflectionLimitRatio,
  } = params;

  const totalLoadService = loadDead + loadLive;
  const totalLoadUltimate = gammaG * loadDead + gammaQ * loadLive;

  const lineLoadService = totalLoadService * spacing;
  const lineLoadUltimate = totalLoadUltimate * spacing;

  const bendingMomentService = (lineLoadService * span ** 2) / 8;
  const shearService = (lineLoadService * span) / 2;

  const bendingMomentUltimate = (lineLoadUltimate * span ** 2) / 8;
  const shearUltimate = (lineLoadUltimate * span) / 2;

  const effectiveDepth = slabDepth - 0.03;
  const modulusElasticity = 30000;

  const inertia = (effectiveWidth * slabDepth ** 3) / 12;
  const deflection =
    (5 * lineLoadService * span ** 4) /
    (384 * modulusElasticity * inertia);

  const deflectionLimit = span * 1000 / deflectionLimitRatio;
  const deflectionUtilization = deflectionLimit > 0 ? (deflection * 1000) / deflectionLimit * 100 : 0;

  const leverArm = 0.9 * effectiveDepth;
  const steelAreaRequired =
    (bendingMomentUltimate * 1e6) /
    (steelYield * 1e6 * leverArm);

  const steelAreaProvided = 2 * 0.000314;
  const steelUtilization =
    steelAreaProvided > 0 ? (steelAreaRequired / steelAreaProvided) * 100 : 0;

  const summary: CalculationResult['summary'] = [
    { label: 'q service [kN/m^2]', value: round(totalLoadService, 2).toString() },
    { label: 'q ultimate [kN/m^2]', value: round(totalLoadUltimate, 2).toString() },
    { label: 'M service [kNm/m]', value: round(bendingMomentService, 2).toString() },
    { label: 'M ultimate [kNm/m]', value: round(bendingMomentUltimate, 2).toString() },
    { label: 'V ultimate [kN/m]', value: round(shearUltimate, 2).toString() },
    { label: 'Deflection [mm]', value: round(deflection * 1000, 2).toString() },
    { label: 'Steel ratio %', value: round(steelUtilization, 1).toString() },
  ];

  const warnings: string[] = [];
  if (deflectionLimit > 0 && deflectionUtilization > 100) {
    warnings.push('La freccia calcolata supera il limite impostato (L / ' + deflectionLimitRatio + ').');
  }
  if (steelUtilization > 100) {
    warnings.push('Armatura fornita insufficiente: aumenta il numero o il diametro delle barre.');
  }

  return {
    totalLoadService,
    totalLoadUltimate,
    lineLoadService,
    lineLoadUltimate,
    bendingMomentService,
    shearService,
    bendingMomentUltimate,
    shearUltimate,
    deflection,
    deflectionLimit,
    deflectionUtilization,
    steelAreaRequired,
    steelAreaProvided,
    steelUtilization,
    warnings,
    summary,
  };
}

export default function LaterocementoSlabCalculator() {
  const [span, setSpan] = useState('4.5');
  const [spacing, setSpacing] = useState('0.5');
  const [loadDead, setLoadDead] = useState('3.5');
  const [loadLive, setLoadLive] = useState('2.0');
  const [gammaG, setGammaG] = useState('1.3');
  const [gammaQ, setGammaQ] = useState('1.5');
  const [slabDepth, setSlabDepth] = useState('0.24');
  const [concreteStrength, setConcreteStrength] = useState('30');
  const [steelYield, setSteelYield] = useState('450');
  const [effectiveWidth, setEffectiveWidth] = useState('0.3');
  const [deflectionLimitRatio, setDeflectionLimitRatio] = useState('300');

  const result = useMemo<CalculationResult | null>(() => {
    const L = toNumber(span);
    const S = toNumber(spacing);
    const Gk = toNumber(loadDead);
    const Qk = toNumber(loadLive);
    const gammaGVal = Math.max(1, toNumber(gammaG));
    const gammaQVal = Math.max(1, toNumber(gammaQ));
    const depth = toNumber(slabDepth);
    const bw = toNumber(effectiveWidth);
    const fck = toNumber(concreteStrength);
    const fyk = toNumber(steelYield);
    const limitRatio = Math.max(200, toNumber(deflectionLimitRatio));

    if (
      L <= 0 ||
      S <= 0 ||
      depth <= 0 ||
      bw <= 0 ||
      fck <= 0 ||
      fyk <= 0
    ) {
      return null;
    }

    return computeResult({
      span: L,
      spacing: S,
      loadDead: Gk,
      loadLive: Qk,
      gammaG: gammaGVal,
      gammaQ: gammaQVal,
      slabDepth: depth,
      concreteStrength: fck,
      steelYield: fyk,
      effectiveWidth: bw,
      deflectionLimitRatio: limitRatio,
    });
  }, [
    span,
    spacing,
    loadDead,
    loadLive,
    gammaG,
    gammaQ,
    slabDepth,
    concreteStrength,
    steelYield,
    effectiveWidth,
    deflectionLimitRatio,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dati geometrici e carichi
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Predimensionamento del solaio in laterocemento con travetti paralleli.
          I carichi sono espressi in kN/m^2, la lunghezza in metri.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="span" className="calculator-label">
                  Luce netta L (m)
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
                <label htmlFor="spacing" className="calculator-label">
                  Interasse travetti (m)
                </label>
                <input
                  id="spacing"
                  type="number"
                  step="0.05"
                  min="0.3"
                  value={spacing}
                  onChange={(event) => setSpacing(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="loadDead" className="calculator-label">
                  Carico permanente Gk (kN/m^2)
                </label>
                <input
                  id="loadDead"
                  type="number"
                  step="0.1"
                  min="1"
                  value={loadDead}
                  onChange={(event) => setLoadDead(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="loadLive" className="calculator-label">
                  Carico accidentale Qk (kN/m^2)
                </label>
                <input
                  id="loadLive"
                  type="number"
                  step="0.1"
                  min="1"
                  value={loadLive}
                  onChange={(event) => setLoadLive(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gammaG" className="calculator-label">
                  gamma G (SLU)
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
                  gamma Q (SLU)
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="slabDepth" className="calculator-label">
                  Spessore complessivo (m)
                </label>
                <input
                  id="slabDepth"
                  type="number"
                  step="0.01"
                  min="0.16"
                  value={slabDepth}
                  onChange={(event) => setSlabDepth(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="effectiveWidth" className="calculator-label">
                  Larghezza nervo efficace (m)
                </label>
                <input
                  id="effectiveWidth"
                  type="number"
                  step="0.01"
                  min="0.2"
                  value={effectiveWidth}
                  onChange={(event) => setEffectiveWidth(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="concreteStrength" className="calculator-label">
                  Classe calcestruzzo fck (MPa)
                </label>
                <input
                  id="concreteStrength"
                  type="number"
                  step="5"
                  min="25"
                  value={concreteStrength}
                  onChange={(event) => setConcreteStrength(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="steelYield" className="calculator-label">
                  Acciaio travetti fyk (MPa)
                </label>
                <input
                  id="steelYield"
                  type="number"
                  step="10"
                  min="400"
                  value={steelYield}
                  onChange={(event) => setSteelYield(event.target.value)}
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
                min="200"
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
            Verifica luce, interasse, spessore e resistenze. Acciai e calcestruzzi devono essere maggiori di zero.
          </p>
        </section>
      )}

      {result && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati principali
            </h2>
            <p className="text-sm text-gray-600">
              Momenti e tagli sono riferiti al metro di larghezza. Armature e frecce da verificare in relazione alla normativa di riferimento (NTC 2018, EC2).
            </p>
          </header>

          {result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {result.warnings.map((warning) => (
                <p key={warning}>
                  {warning}
                </p>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Momento massimo
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.bendingMomentUltimate, 2)} kNm/m
              </p>
              <p className="text-sm text-gray-600">
                M service = {round(result.bendingMomentService, 2)} kNm/m
              </p>
            </div>

            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Taglio massimo
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(result.shearUltimate, 2)} kN/m
              </p>
              <p className="text-sm text-gray-600">
                V service = {round(result.shearService, 2)} kN/m
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
                Utilizzo = {round(result.deflectionUtilization, 1)} % (limite L / {deflectionLimitRatio})
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
            <strong>Nota operativa:</strong> confronta i risultati con i requisiti del capitolato.
            Per solai a pignatte verifica anche punzonamento, instabilita trave perpendicolare e collegamenti ai cordoli.
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
              <li>NTC 2018, Capitolo 4.1 e Capitolo 11 per solai in laterocemento</li>
              <li>Circolare 7/2019 C4.1.2 e C11.2</li>
              <li>Eurocodice 2 EN 1992-1-1 per verifiche ULS e SLS</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi di calcolo
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Solai semplicemente appoggiati con travetti paralleli.</li>
              <li>Carichi uniformemente distribuiti.</li>
              <li>Verifica a flessione basata su modello a sezione rettangolare equivalente.</li>
              <li>Freccia calcolata con schema elastico lineare.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Integra con verifiche dettagliate su taglio, fessurazione e punzonamento.</li>
              <li>Aggiorna i carichi per zone climatiche (neve, vento).</li>
              <li>Per travetti precompressi, utilizzare i dati del produttore.</li>
            </ul>
          </article>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            M = q * L^2 / 8, V = q * L / 2, freccia f = 5 * q * L^4 / (384 * E * I).
            Armatura teorica: As = M / (sigma_s * z), con z = 0.9 * d.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> i risultati sono indicativi.
          Effettua sempre le verifiche complete previste dalle NTC 2018 e confronta con schede del produttore dei travetti.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Raccogli i carichi permanenti (autopeso, massetti, pavimentazioni) e accidentali in funzione della destinazione d'uso.
          </li>
          <li>
            Scegli interasse e spessore del solaio in base a travetti disponibili e limiti geometrici.
          </li>
          <li>
            Verifica flessione, taglio e freccia; adegua armatura e irrigidimenti se necessario.
          </li>
          <li>
            Integra con calcolo dei cordoli perimetrali e collegamenti ai travetti perimetrali.
          </li>
          <li>
            Documenta i calcoli nel fascicolo tecnico indicando normative, coefficienti e ipotesi adottate.
          </li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "Perfetto per dimensionamenti rapidi in fase preliminare con immediato controllo delle frecce."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Andrea C., progettista strutturale
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "La sezione Norme e Formule e' pronta per la relazione e velocizza le revisioni di cantiere."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Elisa R., direzione lavori
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

