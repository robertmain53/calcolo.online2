'use client';

import { useState, FormEvent } from 'react';

interface ROIResult {
  roi: number;
  roiPercentage: number;
  netProfit: number;
  paybackPeriod: number;
}

export default function ROICalculator() {
  const [investment, setInvestment] = useState<string>('10000');
  const [revenue, setRevenue] = useState<string>('15000');
  const [costs, setCosts] = useState<string>('3000');
  const [timeframe, setTimeframe] = useState<string>('12');
  const [result, setResult] = useState<ROIResult | null>(null);

  const calculateROI = (e: FormEvent) => {
    e.preventDefault();

    const investmentAmount = parseFloat(investment) || 0;
    const totalRevenue = parseFloat(revenue) || 0;
    const totalCosts = parseFloat(costs) || 0;
    const months = parseFloat(timeframe) || 1;

    // Calculate net profit
    const netProfit = totalRevenue - totalCosts - investmentAmount;

    // Calculate ROI
    const roi = netProfit / investmentAmount;
    const roiPercentage = roi * 100;

    // Calculate payback period (in months)
    const monthlyProfit = (totalRevenue - totalCosts) / months;
    const paybackPeriod = investmentAmount / monthlyProfit;

    setResult({
      roi,
      roiPercentage,
      netProfit,
      paybackPeriod,
    });
  };

  const resetCalculator = () => {
    setInvestment('10000');
    setRevenue('15000');
    setCosts('3000');
    setTimeframe('12');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Calculator Form */}
      <div className="section-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Calcolatore Interattivo
        </h2>

        <form onSubmit={calculateROI} className="space-y-5">
          {/* Investment Amount */}
          <div>
            <label htmlFor="investment" className="calculator-label">
              Investimento Iniziale (€)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="investment"
              type="number"
              step="0.01"
              min="0"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="calculator-input"
              required
              placeholder="Es. 10000"
            />
            <p className="text-xs text-gray-500 mt-1">
              L'ammontare totale dell'investimento iniziale
            </p>
          </div>

          {/* Total Revenue */}
          <div>
            <label htmlFor="revenue" className="calculator-label">
              Ricavi Totali Generati (€)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="revenue"
              type="number"
              step="0.01"
              min="0"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="calculator-input"
              required
              placeholder="Es. 15000"
            />
            <p className="text-xs text-gray-500 mt-1">
              I ricavi totali generati dall'investimento nel periodo considerato
            </p>
          </div>

          {/* Operating Costs */}
          <div>
            <label htmlFor="costs" className="calculator-label">
              Costi Operativi (€)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="costs"
              type="number"
              step="0.01"
              min="0"
              value={costs}
              onChange={(e) => setCosts(e.target.value)}
              className="calculator-input"
              required
              placeholder="Es. 3000"
            />
            <p className="text-xs text-gray-500 mt-1">
              I costi operativi sostenuti nel periodo (escluso l'investimento iniziale)
            </p>
          </div>

          {/* Timeframe */}
          <div>
            <label htmlFor="timeframe" className="calculator-label">
              Periodo di Riferimento (mesi)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="timeframe"
              type="number"
              step="1"
              min="1"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="calculator-input"
              required
              placeholder="Es. 12"
            />
            <p className="text-xs text-gray-500 mt-1">
              Il numero di mesi su cui si calcola il ROI
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button type="submit" className="calculator-button flex-1">
              Calcola ROI
            </button>
            <button
              type="button"
              onClick={resetCalculator}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-semibold"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="calculator-result">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Risultati del Calcolo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ROI Percentage */}
            <div className="bg-white rounded-lg p-5 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">ROI (%)</div>
              <div className="text-3xl font-bold text-blue-600">
                {result.roiPercentage.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Ritorno sull'investimento in percentuale
              </div>
            </div>

            {/* ROI Ratio */}
            <div className="bg-white rounded-lg p-5 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">ROI (Rapporto)</div>
              <div className="text-3xl font-bold text-blue-600">
                {result.roi.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Per ogni euro investito, guadagni {result.roi.toFixed(2)} euro
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-white rounded-lg p-5 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Profitto Netto (€)</div>
              <div
                className={`text-3xl font-bold ${
                  result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                €{result.netProfit.toLocaleString('it-IT', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Guadagno o perdita totale dopo costi
              </div>
            </div>

            {/* Payback Period */}
            <div className="bg-white rounded-lg p-5 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">
                Periodo di Recupero
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {result.paybackPeriod.toFixed(1)} mesi
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Tempo necessario per recuperare l'investimento
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2">
              Interpretazione dei Risultati
            </h4>
            <div className="text-sm text-gray-700 space-y-2">
              {result.roiPercentage > 0 ? (
                <p className="text-green-700">
                  ✅ <strong>ROI Positivo:</strong> L'investimento sta generando
                  profitto. Un ROI del {result.roiPercentage.toFixed(2)}% indica
                  che stai guadagnando {result.roiPercentage.toFixed(2)}€ per
                  ogni 100€ investiti.
                </p>
              ) : (
                <p className="text-red-700">
                  ⚠️ <strong>ROI Negativo:</strong> L'investimento sta generando
                  una perdita. Valuta attentamente se continuare con questo progetto.
                </p>
              )}

              {result.paybackPeriod <= parseFloat(timeframe) ? (
                <p>
                  ✅ <strong>Payback Period:</strong> L'investimento verrà
                  recuperato in {result.paybackPeriod.toFixed(1)} mesi, entro il
                  periodo previsto.
                </p>
              ) : (
                <p className="text-orange-700">
                  ⚠️ <strong>Payback Period:</strong> Sono necessari{' '}
                  {result.paybackPeriod.toFixed(1)} mesi per recuperare
                  l'investimento, oltre il periodo considerato di {timeframe} mesi.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
