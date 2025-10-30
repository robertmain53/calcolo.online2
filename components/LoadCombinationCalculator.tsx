'use client';

import { useMemo, useState } from 'react';
import AuthorReviewerBox from '@/components/AuthorReviewerBox';

interface VariableAction {
  id: number;
  name: string;
  category: string;
  qk: string;
  psi0: string;
  psi1: string;
  psi2: string;
}

interface CombinationRow {
  leading: string;
  value: number;
  equation: string;
}

interface CombinationResult {
  slu: CombinationRow[];
  sleRare: CombinationRow[];
  sleFrequent: CombinationRow[];
  sleQuasiPermanent: {
    value: number;
    equation: string;
  };
  envelopes: {
    slu: number;
    sleRare: number;
    sleFrequent: number;
    sleQuasiPermanent: number;
  };
}

const variableActionLibrary: Record<
  string,
  { label: string; psi0: number; psi1: number; psi2: number; qk?: number }
> = {
  A: { label: 'Categoria A - Residenziale', psi0: 0.7, psi1: 0.5, psi2: 0.3, qk: 2 },
  B: { label: 'Categoria B - Uffici', psi0: 0.7, psi1: 0.5, psi2: 0.3, qk: 3 },
  C: { label: 'Categoria C - Luoghi pubblici', psi0: 0.7, psi1: 0.6, psi2: 0.4, qk: 4 },
  D: { label: 'Categoria D - Aree commerciali', psi0: 0.6, psi1: 0.6, psi2: 0.6, qk: 5 },
  E: { label: 'Categoria E - Aree adibite a veicoli', psi0: 0.7, psi1: 0.5, psi2: 0.3, qk: 2.5 },
  H: { label: 'Categoria H - Neve', psi0: 0.7, psi1: 0.5, psi2: 0.2, qk: 1 },
  W: { label: 'Categoria W - Vento', psi0: 0.6, psi1: 0.2, psi2: 0.0, qk: 0.5 },
  T: { label: 'Categoria T - Temperatura', psi0: 0.6, psi1: 0.5, psi2: 0.0, qk: 0.2 },
};

function toNumber(value: string, fallback = 0): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatEquation(terms: string[]) {
  return terms.filter(Boolean).join(' + ');
}

function computeCombinations(params: {
  g1: number;
  g2: number;
  gammaG1: number;
  gammaG2: number;
  gammaQ: number;
  loads: VariableAction[];
}): CombinationResult {
  const { g1, g2, gammaG1, gammaG2, gammaQ, loads } = params;
  const permanent = gammaG1 * g1 + gammaG2 * g2;

  const slu: CombinationRow[] = [];
  const sleRare: CombinationRow[] = [];
  const sleFrequent: CombinationRow[] = [];

  loads.forEach((leadingLoad, index) => {
    const qkLead = toNumber(leadingLoad.qk);
    const psi0Lead = toNumber(leadingLoad.psi0);
    const psi1Lead = toNumber(leadingLoad.psi1);
    const psi2Lead = toNumber(leadingLoad.psi2);

    const remainingLoads = loads.filter((_, loadIndex) => loadIndex !== index);

    const sluResidual = remainingLoads.reduce((sum, load) => {
      const qk = toNumber(load.qk);
      const psi0 = toNumber(load.psi0);
      return sum + gammaQ * psi0 * qk;
    }, 0);

    const sluValue = permanent + gammaQ * qkLead + sluResidual;
    const sluEquation = formatEquation([
      `${gammaG1}*G1`,
      `${gammaG2}*G2`,
      `${gammaQ}*${qkLead.toFixed(2)}`,
      ...remainingLoads.map((load) => {
        const qk = toNumber(load.qk);
        const psi0 = toNumber(load.psi0);
        return `${gammaQ}*${psi0.toFixed(2)}*${qk.toFixed(2)}`;
      }),
    ]);

    slu.push({
      leading: leadingLoad.name || `Azione ${index + 1}`,
      value: sluValue,
      equation: sluEquation,
    });

    const sleRareResidual = remainingLoads.reduce((sum, load) => {
      const qk = toNumber(load.qk);
      const psi0 = toNumber(load.psi0);
      return sum + psi0 * qk;
    }, 0);

    const sleRareValue = g1 + g2 + qkLead + sleRareResidual;
    const sleRareEquation = formatEquation([
      'G1',
      'G2',
      qkLead.toFixed(2),
      ...remainingLoads.map((load) => {
        const qk = toNumber(load.qk);
        const psi0 = toNumber(load.psi0);
        return `${psi0.toFixed(2)}*${qk.toFixed(2)}`;
      }),
    ]);

    sleRare.push({
      leading: leadingLoad.name || `Azione ${index + 1}`,
      value: sleRareValue,
      equation: sleRareEquation,
    });

    const sleFrequentResidual = remainingLoads.reduce((sum, load) => {
      const qk = toNumber(load.qk);
      const psi2 = toNumber(load.psi2);
      return sum + psi2 * qk;
    }, 0);

    const sleFrequentValue = g1 + g2 + psi1Lead * qkLead + sleFrequentResidual;
    const sleFrequentEquation = formatEquation([
      'G1',
      'G2',
      `${psi1Lead.toFixed(2)}*${qkLead.toFixed(2)}`,
      ...remainingLoads.map((load) => {
        const qk = toNumber(load.qk);
        const psi2 = toNumber(load.psi2);
        return `${psi2.toFixed(2)}*${qk.toFixed(2)}`;
      }),
    ]);

    sleFrequent.push({
      leading: leadingLoad.name || `Azione ${index + 1}`,
      value: sleFrequentValue,
      equation: sleFrequentEquation,
    });
  });

  const sleQuasiPermanentValue =
    g1 +
    g2 +
    loads.reduce((sum, load) => {
      const qk = toNumber(load.qk);
      const psi2 = toNumber(load.psi2);
      return sum + psi2 * qk;
    }, 0);

  const sleQuasiPermanentEquation = formatEquation([
    'G1',
    'G2',
    ...loads.map((load) => {
      const qk = toNumber(load.qk);
      const psi2 = toNumber(load.psi2);
      return `${psi2.toFixed(2)}*${qk.toFixed(2)}`;
    }),
  ]);

  return {
    slu,
    sleRare,
    sleFrequent,
    sleQuasiPermanent: {
      value: sleQuasiPermanentValue,
      equation: sleQuasiPermanentEquation,
    },
    envelopes: {
      slu: slu.reduce((max, row) => Math.max(max, row.value), 0),
      sleRare: sleRare.reduce((max, row) => Math.max(max, row.value), 0),
      sleFrequent: sleFrequent.reduce((max, row) => Math.max(max, row.value), 0),
      sleQuasiPermanent: sleQuasiPermanentValue,
    },
  };
}

export default function LoadCombinationCalculator() {
  const [g1, setG1] = useState('1200'); // kN
  const [g2, setG2] = useState('240'); // kN
  const [gammaG1, setGammaG1] = useState('1.3');
  const [gammaG2, setGammaG2] = useState('1.5');
  const [gammaQ, setGammaQ] = useState('1.5');

  const [variableActions, setVariableActions] = useState<VariableAction[]>([
    {
      id: 1,
      name: variableActionLibrary.A.label,
      category: 'A',
      qk: '250',
      psi0: variableActionLibrary.A.psi0.toString(),
      psi1: variableActionLibrary.A.psi1.toString(),
      psi2: variableActionLibrary.A.psi2.toString(),
    },
    {
      id: 2,
      name: variableActionLibrary.H.label,
      category: 'H',
      qk: '80',
      psi0: variableActionLibrary.H.psi0.toString(),
      psi1: variableActionLibrary.H.psi1.toString(),
      psi2: variableActionLibrary.H.psi2.toString(),
    },
  ]);

  const addVariableAction = () => {
    const nextId =
      variableActions.length === 0
        ? 1
        : Math.max(...variableActions.map((load) => load.id)) + 1;
    setVariableActions((current) => [
      ...current,
      {
        id: nextId,
        name: 'Nuova azione variabile',
        category: 'A',
        qk: '100',
        psi0: variableActionLibrary.A.psi0.toString(),
        psi1: variableActionLibrary.A.psi1.toString(),
        psi2: variableActionLibrary.A.psi2.toString(),
      },
    ]);
  };

  const updateVariableAction = (
    id: number,
    field: keyof VariableAction,
    value: string
  ) => {
    setVariableActions((current) =>
      current.map((action) => {
        if (action.id !== id) return action;
        if (field === 'category') {
          const libraryEntry = variableActionLibrary[value];
          if (libraryEntry) {
            return {
              ...action,
              category: value,
              name: libraryEntry.label,
              psi0: libraryEntry.psi0.toString(),
              psi1: libraryEntry.psi1.toString(),
              psi2: libraryEntry.psi2.toString(),
              qk:
                action.qk.trim().length === 0 && libraryEntry.qk
                  ? libraryEntry.qk.toString()
                  : action.qk,
            };
          }
        }
        return {
          ...action,
          [field]: value,
        };
      })
    );
  };

  const removeVariableAction = (id: number) => {
    setVariableActions((current) =>
      current.length > 1 ? current.filter((action) => action.id !== id) : current
    );
  };

  const combinationResult = useMemo<CombinationResult | null>(() => {
    const permanentG1 = toNumber(g1);
    const permanentG2 = toNumber(g2);
    const gammaG1Val = toNumber(gammaG1, 1.3);
    const gammaG2Val = toNumber(gammaG2, 1.5);
    const gammaQVal = toNumber(gammaQ, 1.5);

    if (
      permanentG1 < 0 ||
      permanentG2 < 0 ||
      gammaG1Val <= 0 ||
      gammaG2Val <= 0 ||
      gammaQVal <= 0 ||
      variableActions.length === 0
    ) {
      return null;
    }

    if (variableActions.some((action) => toNumber(action.qk) < 0)) {
      return null;
    }

    return computeCombinations({
      g1: permanentG1,
      g2: permanentG2,
      gammaG1: gammaG1Val,
      gammaG2: gammaG2Val,
      gammaQ: gammaQVal,
      loads: variableActions,
    });
  }, [g1, g2, gammaG1, gammaG2, gammaQ, variableActions]);

  return (
    <div className="calculator-widget space-y-10">
      <section className="section-card border-blue-100">
        <h2 className="text-2xl font-semibold text-gray-900">
          Dati di base per le combinazioni
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Inserisci i valori delle azioni permanenti e variabili in kN. Il tool
          calcola automaticamente le combinazioni SLU e SLE conformi al Capitolo 2.5 NTC 2018.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="g1" className="calculator-label">
                  G1 - Azioni permanenti strutturali (kN)
                </label>
                <input
                  id="g1"
                  type="number"
                  step="10"
                  value={g1}
                  onChange={(event) => setG1(event.target.value)}
                  className="calculator-input"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="g2" className="calculator-label">
                  G2 - Azioni permanenti non strutturali (kN)
                </label>
                <input
                  id="g2"
                  type="number"
                  step="10"
                  value={g2}
                  onChange={(event) => setG2(event.target.value)}
                  className="calculator-input"
                  min="0"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="gammaG1" className="calculator-label">
                  gamma G1 (SLU)
                </label>
                <input
                  id="gammaG1"
                  type="number"
                  step="0.05"
                  value={gammaG1}
                  onChange={(event) => setGammaG1(event.target.value)}
                  className="calculator-input"
                  min="0.1"
                />
              </div>
              <div>
                <label htmlFor="gammaG2" className="calculator-label">
                  gamma G2 (SLU)
                </label>
                <input
                  id="gammaG2"
                  type="number"
                  step="0.05"
                  value={gammaG2}
                  onChange={(event) => setGammaG2(event.target.value)}
                  className="calculator-input"
                  min="0.1"
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
                  value={gammaQ}
                  onChange={(event) => setGammaQ(event.target.value)}
                  className="calculator-input"
                  min="0.1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {variableActions.map((action, index) => (
              <div
                key={action.id}
                className="rounded-lg border border-gray-200 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Azione variabile #{index + 1}
                  </h3>
                  {variableActions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariableAction(action.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`category-${action.id}`}
                      className="calculator-label"
                    >
                      Categoria (psi automatici)
                    </label>
                    <select
                      id={`category-${action.id}`}
                      value={action.category}
                      onChange={(event) =>
                        updateVariableAction(action.id, 'category', event.target.value)
                      }
                      className="calculator-input"
                    >
                      {Object.entries(variableActionLibrary).map(
                        ([key, entry]) => (
                          <option key={key} value={key}>
                            {entry.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor={`qk-${action.id}`}
                      className="calculator-label"
                    >
                      Valore caratteristico Qk (kN)
                    </label>
                    <input
                      id={`qk-${action.id}`}
                      type="number"
                      step="10"
                      value={action.qk}
                      onChange={(event) =>
                        updateVariableAction(action.id, 'qk', event.target.value)
                      }
                      className="calculator-input"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor={`psi0-${action.id}`}
                      className="calculator-label"
                    >
                      psi0
                    </label>
                    <input
                      id={`psi0-${action.id}`}
                      type="number"
                      step="0.05"
                      value={action.psi0}
                      onChange={(event) =>
                        updateVariableAction(action.id, 'psi0', event.target.value)
                      }
                      className="calculator-input"
                      min="0"
                      max="1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`psi1-${action.id}`}
                      className="calculator-label"
                    >
                      psi1
                    </label>
                    <input
                      id={`psi1-${action.id}`}
                      type="number"
                      step="0.05"
                      value={action.psi1}
                      onChange={(event) =>
                        updateVariableAction(action.id, 'psi1', event.target.value)
                      }
                      className="calculator-input"
                      min="0"
                      max="1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`psi2-${action.id}`}
                      className="calculator-label"
                    >
                      psi2
                    </label>
                    <input
                      id={`psi2-${action.id}`}
                      type="number"
                      step="0.05"
                      value={action.psi2}
                      onChange={(event) =>
                        updateVariableAction(action.id, 'psi2', event.target.value)
                      }
                      className="calculator-input"
                      min="0"
                      max="1"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariableAction}
              className="px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              + Aggiungi azione variabile
            </button>
          </div>
        </div>
      </section>

      {!combinationResult && (
        <section className="section-card border border-red-100 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900">
            Parametri insufficienti
          </h3>
          <p className="text-sm text-red-800">
            Controlla che permanenti, coefficienti parziali e azioni variabili siano maggiori o uguali a zero.
          </p>
        </section>
      )}

      {combinationResult && (
        <section className="section-card space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              Risultati combinazioni NTC 2018
            </h2>
            <p className="text-sm text-gray-600">
              Valori in kN. Il tool presenta le combinazioni con ogni azione
              variabile assunta come prevalente, piu l inviluppo massimo da
              utilizzare per la verifica degli elementi strutturali.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">Inviluppo SLU</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(combinationResult.envelopes.slu, 1)} kN
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Inviluppo SLE rara
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(combinationResult.envelopes.sleRare, 1)} kN
              </p>
            </div>
            <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                Inviluppo SLE frequente
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(combinationResult.envelopes.sleFrequent, 1)} kN
              </p>
            </div>
          <div className="calculator-result">
              <h3 className="text-lg font-semibold text-gray-900">
                SLE quasi permanente
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {round(combinationResult.envelopes.sleQuasiPermanent, 1)} kN
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Combinazioni SLU (fondamentali)
            </h3>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Azione prevalente
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Valore (kN)
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Formula
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {combinationResult.slu.map((row) => (
                  <tr key={row.leading}>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {row.leading}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {round(row.value, 2)}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {row.equation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Combinazioni SLE rare
            </h3>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Azione prevalente
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Valore (kN)
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Formula
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {combinationResult.sleRare.map((row) => (
                  <tr key={row.leading}>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {row.leading}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {round(row.value, 2)}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {row.equation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Combinazioni SLE frequenti
            </h3>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Azione prevalente
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Valore (kN)
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Formula
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {combinationResult.sleFrequent.map((row) => (
                  <tr key={row.leading}>
                    <td className="px-4 py-2 text-gray-900 font-medium">
                      {row.leading}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {round(row.value, 2)}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {row.equation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p>
              Quasi permanente: {round(combinationResult.sleQuasiPermanent.value, 2)} kN
            </p>
            <p className="mt-2 text-xs text-emerald-700">
              Formula: {combinationResult.sleQuasiPermanent.equation}
            </p>
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
              <li>NTC 2018, Capitolo 2.5 Combinazioni delle azioni</li>
              <li>Circolare 7/2019, paragrafi C2.5 e Tabelle C2.5.1</li>
              <li>EN 1990 e EN 1991 per fattori psi e casi speciali</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Ipotesi del modello
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Azioni permanenti in algebraico positivo (compressive).</li>
              <li>Azioni variabili indipendenti con fattori psi personalizzabili.</li>
              <li>Combinazione fondazionale SLU tipo "fondamentale" senza sisma.</li>
              <li>Combinazioni SLE: rara, frequente, quasi permanente.</li>
            </ul>
          </article>
          <article className="rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900">
              Limitazioni e raccomandazioni
            </h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Per combinazioni sismiche utilizzare i coefficienti ridotti gamma e psi2 specifici.</li>
              <li>Inserire valori negativi per azioni stabilizzanti manualmente se necessario.</li>
              <li>Confrontare i risultati con eventuali analisi automatiche del software FEM adottato.</li>
            </ul>
          </article>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-800">
          <h3 className="text-base font-semibold text-gray-900">
            Formule principali
          </h3>
          <p className="mt-2">
            SLU fondamentale: gammaG * G + gammaQ * Q1 + sum(gammaQ * psi0,i * Qi).
            SLE rara: G + Q1 + sum(psi0,i * Qi).
            SLE frequente: G + psi1,1 * Q1 + sum(psi2,i * Qi).
            SLE quasi permanente: G + sum(psi2,i * Qi).
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <strong>Disclaimer professionale:</strong> questo calcolo supporta la redazione delle relazioni tecniche ma non sostituisce il controllo del progettista,
          in particolare per combinazioni particolari (sismiche, vento dominante, condizioni di montaggio).
        </div>
      </section>

      <section className="section-card space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Procedura operativa consigliata
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>
            Inserisci i permanenti G1, G2 e verifica che i coefficienti parziali siano coerenti con la classe di affidabilita richiesta.
          </li>
          <li>
            Aggiungi le azioni variabili secondo la categoria corretta (per esempio neve, affollamento, vento) modificando i fattori psi quando applicabile.
          </li>
          <li>
            Esporta le combinazioni SLU e SLE in un foglio di calcolo o direttamente nella relazione di calcolo indicando i coefficienti utilizzati.
          </li>
          <li>
            Per elementi sensibili alla deformabilita verifica che l inviluppo SLE frequente e quasi permanente rispetti i limiti imposti dal capitolato.
          </li>
          <li>
            Estendi lo studio con combinazioni sismiche o dinamiche dedicando schede specifiche se la struttura ricade in categorie d uso speciali.
          </li>
        </ol>
      </section>

      <section className="section-card space-y-3">
        <h2 className="text-2xl font-semibold text-gray-900">
          Feedback dai progettisti
        </h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="rounded-lg border border-gray-200 p-4">
            "In un colpo d occhio ho tutte le combinazioni SLU e SLE richieste dalle NTC 2018, con fattori psi gia assegnati."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Laura S., studio strutture in zona sismica 2
            </span>
          </li>
          <li className="rounded-lg border border-gray-200 p-4">
            "Perfetto per allegare il quadro combinazioni ai modelli FEM e al fascicolo digitale; niente piu fogli Excel sparsi."
            <span className="mt-1 block text-xs uppercase tracking-wide text-gray-500">
              Ing. Matteo V., consulente BIM
            </span>
          </li>
        </ul>
      </section>

      <AuthorReviewerBox
        writtenBy="Team di Calcolo.online - Sezione Strutture"
        reviewedBy="Ing. Ugo Candido (ordine Udine n. 2389)"
        lastReviewDate="2025-03-02"
        referenceStandard="NTC 2018, Circolare 7/2019, EN 1990"
      />
    </div>
  );
}

