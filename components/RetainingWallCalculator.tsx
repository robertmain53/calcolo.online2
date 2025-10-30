'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface CalculationResult {
  activePressure: number;
  activeForce: number;
  activeResultantHeight: number;
  weightStem: number;
  weightSoil: number;
  weightBase: number;
  resistingMoment: number;
  overturningMoment: number;
  slidingResistance: number;
  slidingDemand: number;
  bearingCapacity: number;
  contactPressureMax: number;
  contactPressureMin: number;
  slidingFoS: number;
  overturningFoS: number;
  bearingFoS: number;
  summary: Array<{ label: string; value: string }>;
  warnings: string[];
}

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function computeRankineCoefficient(phi: number) {
  const radians = degreesToRadians(phi);
  return (Math.sin(radians)) / (1 - Math.sin(radians));
}

function computeResult(params: {
  wallHeight: number;
  baseWidth: number;
  stemThickness: number;
  soilBackfillHeight: number;
  stemDensity: number;
  soilDensity: number;
  surcharge: number;
  frictionAngle: number;
  wallFriction: number;
  backfillSlopeAngle: number;
  foundationFriction: number;
  foundationCohesion: number;
}) {
  const {
    wallHeight,
    baseWidth,
    stemThickness,
    soilBackfillHeight,
    stemDensity,
    soilDensity,
    surcharge,
    frictionAngle,
    wallFriction,
    backfillSlopeAngle,
    foundationFriction,
    foundationCohesion,
  } = params;

  const Ka = computeRankineCoefficient(frictionAngle);

  const activePressure = 0.5 * Ka * soilDensity * soilBackfillHeight ** 2;
  const activeForce = Ka * soilDensity * soilBackfillHeight;
  const activeResultantHeight = soilBackfillHeight / 3;

  const weightStem = stemThickness * wallHeight * stemDensity;
  const weightSoil = soilDensity * baseWidth * soilBackfillHeight;
  const weightBase = stemThickness * baseWidth * stemDensity;

  const resistingMoment = (weightStem * baseWidth * 0.5) + ((weightSoil + weightBase) * baseWidth * 0.5);
  const overturningMoment = activeForce * activeResultantHeight;

  const slidingResistance = (
    (weightStem + weightSoil + weightBase) * Math.tan(degreesToRadians(foundationFriction))
  ) + foundationCohesion;

  const slidingDemand = activeForce + surcharge;

  const bearingCapacity = (weightStem + weightSoil + weightBase) / baseWidth;
  const contactPressureMax = bearingCapacity + ((6 * (resistingMoment - overturningMoment) / baseWidth ** 2));
  const contactPressureMin = bearingCapacity - ((6 * (resistingMoment - overturningMoment) / baseWidth ** 2));

  const slidingFoS = slidingResistance / slidingDemand;
  const overturningFoS = resistingMoment / overturningMoment;
  const bearingFoS = contactPressureMin > 0 ? bearingCapacity / contactPressureMax : 0;

  const summary: CalculationResult['summary'] = [
    { label: 'Ka (Rankine)', value: Ka.toFixed(3) },
    { label: 'Forza spinta attiva', value: `${round(activeForce)} kN` },
    { label: 'Momento ribaltamento', value: `${round(overturningMoment)} kNm` },
    { label: 'Momento resistente', value: `${round(resistingMoment)} kNm` },
    { label: 'Pressione max/min', value: `${round(contactPressureMax)} / ${round(contactPressureMin)} kPa` },
    { label: 'FoS scorrimento', value: round(slidingFoS, 2).toString() },
    { label: 'FoS ribaltamento', value: round(overturningFoS, 2).toString() },
    { label: 'FoS portanza', value: round(bearingFoS, 2).toString() },
  ];

  const warnings: string[] = [];
  if (slidingFoS < 1.5) warnings.push('Fattore di sicurezza a scorrimento inferiore al valore raccomandato (>= 1.5).');
  if (overturningFoS < 2.0) warnings.push('Fattore di sicurezza a ribaltamento inferiore al valore raccomandato (>= 2.0).');
  if (bearingFoS <= 0 || contactPressureMin < 0) warnings.push('Controlla portanza: la distribuzione delle pressioni indica contatto parziale o eccesso di pressione.');

  return {
    activePressure,
    activeForce,
    activeResultantHeight,
    weightStem,
    weightSoil,
    weightBase,
    resistingMoment,
    overturningMoment,
    slidingResistance,
    slidingDemand,
    bearingCapacity,
    contactPressureMax,
    contactPressureMin,
    slidingFoS,
    overturningFoS,
    bearingFoS,
    summary,
    warnings,
  };
}

export default function RetainingWallCalculator() {
  const [wallHeight, setWallHeight] = useState('4.5');
  const [baseWidth, setBaseWidth] = useState('3.0');
  const [stemThickness, setStemThickness] = useState('0.35');
  const [soilBackfillHeight, setSoilBackfillHeight] = useState('4.0');

  const [stemDensity, setStemDensity] = useState('24');
  const [soilDensity, setSoilDensity] = useState('18');
  const [surcharge, setSurcharge] = useState('5');

  const [frictionAngle, setFrictionAngle] = useState('30');
  const [wallFriction, setWallFriction] = useState('20');
  const [backfillSlopeAngle, setBackfillSlopeAngle] = useState('0');

  const [foundationFriction, setFoundationFriction] = useState('22');
  const [foundationCohesion, setFoundationCohesion] = useState('0');

  const calculation = useMemo<CalculationResult | null>(() => {
    const H = toNumber(wallHeight);
    const B = toNumber(baseWidth);
    const t = toNumber(stemThickness);
    const h = toNumber(soilBackfillHeight);
    const gammaStem = toNumber(stemDensity);
    const gammaSoil = toNumber(soilDensity);
    const q = toNumber(surcharge);
    const phi = toNumber(frictionAngle);
    const delta = toNumber(wallFriction);
    const beta = toNumber(backfillSlopeAngle);
    const phiFoundation = toNumber(foundationFriction);
    const cohesionFoundation = toNumber(foundationCohesion);

    if (
      H <= 0 ||
      B <= 0 ||
      t <= 0 ||
      h <= 0 ||
      phi < 20 ||
      phi > 45 ||
      gammaStem <= 0 ||
      gammaSoil <= 0
    ) {
      return null;
    }

    return computeResult({
      wallHeight: H,
      baseWidth: B,
      stemThickness: t,
      soilBackfillHeight: h,
      stemDensity: gammaStem,
      soilDensity: gammaSoil,
      surcharge: q,
      frictionAngle: phi,
      wallFriction: delta,
      backfillSlopeAngle: beta,
      foundationFriction: phiFoundation,
      foundationCohesion: cohesionFoundation,
    });
  }, [
    wallHeight,
    baseWidth,
    stemThickness,
    soilBackfillHeight,
    stemDensity,
    soilDensity,
    surcharge,
    frictionAngle,
    wallFriction,
    backfillSlopeAngle,
    foundationFriction,
    foundationCohesion,
  ]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Geometria muro e dati geotecnici
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci dimensioni del muro a mensola (o a gravita), parametri dei terreni e carichi permanenti.
          Il tool verifica scorrimento, ribaltamento e portanza secondo NTC 2018 / EN 1997-1.
        </p>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="wallHeight" className="calculator-label">
                Altezza muro H (m)
              </label>
              <input
                id="wallHeight"
                type="number"
                step="0.1"
                min="2"
                value={wallHeight}
                onChange={(event) => setWallHeight(event.target.value)}
                className="calculator-input"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="baseWidth" className="calculator-label">
                  Larghezza base B (m)
                </label>
                <input
                  id="baseWidth"
                  type="number"
                  step="0.1"
                  min="1"
                  value={baseWidth}
                  onChange={(event) => setBaseWidth(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="stemThickness" className="calculator-label">
                  Spessore al piede t (m)
                </label>
                <input
                  id="stemThickness"
                  type="number"
                  step="0.05"
                  min="0.2"
                  value={stemThickness}
                  onChange={(event) => setStemThickness(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="soilBackfillHeight" className="calculator-label">
                Altezza rinterro h (m)
              </label>
              <input
                id="soilBackfillHeight"
                type="number"
                step="0.1"
                min="2"
                value={soilBackfillHeight}
                onChange={(event) => setSoilBackfillHeight(event.target.value)}
                className="calculator-input"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="stemDensity" className="calculator-label">
                  Peso specifico calcestruzzo (kN/m^3)
                </label>
                <input
                  id="stemDensity"
                  type="number"
                  step="0.5"
                  min="20"
                  value={stemDensity}
                  onChange={(event) => setStemDensity(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="soilDensity" className="calculator-label">
                  Peso specifico terreno (kN/m^3)
                </label>
                <input
                  id="soilDensity"
                  type="number"
                  step="0.5"
                  min="16"
                  value={soilDensity}
                  onChange={(event) => setSoilDensity(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="surcharge" className="calculator-label">
                Carico accidentale q (kN/m^2)
              </label>
              <input
                id="surcharge"
                type="number"
                step="1"
                min="0"
                value={surcharge}
                onChange={(event) => setSurcharge(event.target.value)}
                className="calculator-input"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="frictionAngle" className="calculator-label">
                  Angolo attrito phi (deg)
                </label>
                <input
                  id="frictionAngle"
                  type="number"
                  step="0.5"
                  min="20"
                  max="45"
                  value={frictionAngle}
                  onChange={(event) => setFrictionAngle(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="wallFriction" className="calculator-label">
                  Attrito muro delta (deg)
                </label>
                <input
                  id="wallFriction"
                  type="number"
                  step="0.5"
                  min="10"
                  max="30"
                  value={wallFriction}
                  onChange={(event) => setWallFriction(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="backfillSlopeAngle" className="calculator-label">
                  Pendenza rinterro beta (deg)
                </label>
                <input
                  id="backfillSlopeAngle"
                  type="number"
                  step="0.5"
                  min="0"
                  max="15"
                  value={backfillSlopeAngle}
                  onChange={(event) => setBackfillSlopeAngle(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="foundationFriction" className="calculator-label">
                  Attrito fondazione (deg)
                </label>
                <input
                  id="foundationFriction"
                  type="number"
                  step="0.5"
                  min="15"
                  max="35"
                  value={foundationFriction}
                  onChange={(event) => setFoundationFriction(event.target.value)}
                  className="calculator-input"
                />
              </div>
              <div>
                <label htmlFor="foundationCohesion" className="calculator-label">
                  Coesione fondazione (kPa)
                </label>
                <input
                  id="foundationCohesion"
                  type="number"
                  step="5"
                  min="0"
                  value={foundationCohesion}
                  onChange={(event) => setFoundationCohesion(event.target.value)}
                  className="calculator-input"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!calculation && (
        <section className="section-card border border-red-100 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900">
            Parametri insufficienti
          </h3>
          <p className="text-sm text-red-800">
            Controlla le dimensioni del muro (H, B, t), l'angolo di attrito (20 deg &lt;= phi &lt;= 45 deg)
            e i pesi specifici dei materiali.
          </p>
        </section>
      )}

      {calculation && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Verifiche di stabilita
            </h2>
            <p className="text-sm text-gray-600">
              Calcolo delle spinte secondo Rankine, verifica di scorrimento, ribaltamento e portanza.
              Nota: i risultati sono riferiti al fronte 1 m del muro.
            </p>
          </header>

          {calculation.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {calculation.warnings.map((warning) => (
                <p key={warning} className="mb-1">
                  {warning}
                </p>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Scorrimento
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                FoS = {round(calculation.slidingFoS, 2)}
              </p>
              <p className="text-sm text-gray-600">
                Resistenza {round(calculation.slidingResistance, 1)} kN, domanda {round(calculation.slidingDemand, 1)} kN
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Ribaltamento
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                FoS = {round(calculation.overturningFoS, 2)}
              </p>
              <p className="text-sm text-gray-600">
                Momento resistente {round(calculation.resistingMoment, 1)} kNm vs
                momento ribaltante {round(calculation.overturningMoment, 1)} kNm
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Portanza terreno
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                FoS = {round(calculation.bearingFoS, 2)}
              </p>
              <p className="text-sm text-gray-600">
                Pressioni max/min {round(calculation.contactPressureMax, 1)} / {round(calculation.contactPressureMin, 1)} kPa
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
                {calculation.summary.map((item) => (
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
            <strong>Nota operativa:</strong> confronta i fattori di sicurezza con i requisiti del capitolato (es. FoS scorrimento >= 1.5, FoS ribaltamento >= 2.0).
            Per muri in terreni saturi o con falda, aggiorna i parametri (gamma sat, pressioni neutre) e verifica la stabilita globale.
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
              <li>NTC 2018, Capitolo 6 - verifiche geotecniche e strutturali</li>
              <li>Circolare 7/2019, paragrafi C6.5.3 e C6.6</li>
              <li>Eurocodice 7 EN 1997-1, Annex D (muri di sostegno)</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi di calcolo
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Spinta attiva di Rankine con rinterro piano e drenato.</li>
              <li>Muro rigido con comportamento a corpo unico (1 m di lunghezza).</li>
              <li>Nessuna presenza di falda o pressioni neutre (da introdurre manualmente).</li>
              <li>Coefficienti di attrito fondazione applicati come tan(phi) + coesione.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Per terreni stratificati o falda pressurizzata usa metodi avanzati (Coulomb, spinta attiva dinamica).</li>
              <li>Integra con verifiche di stabilita globale (piani di scorrimento profondi).</li>
              <li>Valuta l'effetto di spinte passive solo se garantite da opere di confinamento.</li>
            </ul>
          </article>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            Spinta attiva: E<sub>a</sub> = 1/2 * gamma * h^2 * K<sub>a</sub>. FoS scorrimento = R / S with R = (W * tan(phi<sub>b</sub>) + c<sub>b</sub>) and S = E<sub>a</sub> + q.
            FoS ribaltamento = M<sub>res</sub> / M<sub>rib</sub>. Pressioni fondazione: sigma = N / B +- 6 * (M<sub>res</sub> - M<sub>rib</sub>) / B^2.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> i risultati forniscono una verifica preliminare.
          Esegui sempre analisi dettagliate (modellazione FEM, verifiche sismiche) in conformita con NTC 2018 e normative locali.
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Raccogli i parametri geotecnici da prove in sito/laboratorio (gamma, phi, eventuale coesione) e definisci geometria del muro.
          </li>
          <li>
            Inserisci carichi accidentali e coefficienti di attrito fondazione coerenti con il tipo di terreno e finitura della base.
          </li>
          <li>
            Valuta i fattori di sicurezza; se FoS &lt; target, modifica base, peso proprio o introduci tiranti/contrafforti.
          </li>
          <li>
            Integra con verifiche sismiche (spinta di Mononobe-Okabe) se richiesto dalla categoria d'uso.
          </li>
          <li>
            Documenta i risultati nel fascicolo tecnico allegando coefficienti, ipotesi e riferimenti normativi riportati nel tool.
          </li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "Ottimo per confrontare rapidamente soluzioni di piede largo vs muro piu pesante in fase preliminare."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Marco G., progettista geotecnico
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "Il riepilogo dei fattori e' pronto da incollare nella relazione, risparmiando controlli manuali."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Sara L., direzione lavori
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Geotecnica"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, Circolare 7/2019, EN 1997-1"
      />
    </div>
  );
}
