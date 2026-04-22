import { useState, useEffect } from 'react';
import forecastService from '../services/forecastService';
import ForecastChart from '../components/Charts/ForecastChart';
import { Network, Calendar, TrendingDown, CheckCircle, AlertTriangle, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function ForecastPage() {
  const [data, setData] = useState({ forecast: null, loading: true, error: null });

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await forecastService.getForecast(14);
        setData({ forecast: res, loading: false, error: null });
      } catch (err) {
        console.error('Failed to load forecast data', err);
        setData({ forecast: null, loading: false, error: 'Could not load forecast.' });
      }
    };
    fetchForecast();
  }, []);

  if (data.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { forecast, error } = data;
  const usedLstm = forecast?.used_lstm;
  const mape = forecast?.mape;
  const maxPredicted = forecast?.forecast
    ? Math.max(...forecast.forecast.map(d => d.predicted_kwh))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demand Forecasting</h1>
          <p className="text-gray-500 mt-1">AI-powered LSTM predictions for the next 14 days.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <Network className="h-4 w-4 text-indigo-500" />
            <span>{forecast?.model_version || 'v1.0'}</span>
            {usedLstm ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="h-3.5 w-3.5" /> Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Synthetic
              </span>
            )}
          </div>
          {forecast?.source === 'hugging_face' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-200 rounded-lg text-xs font-bold text-yellow-700 animate-pulse">
              🚀 Powered by Hugging Face Space
            </div>
          )}
        </div>
      </div>

      {!usedLstm && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3 rounded-lg">
          ⚠️ LSTM model not trained yet — showing synthetic data. Train the model from the Admin dashboard to get real predictions.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-indigo-500 to-primary-600 text-white border-0">
          <Calendar className="h-8 w-8 mb-4 opacity-80" />
          <h3 className="text-lg font-medium opacity-90">Forecast Horizon</h3>
          <p className="text-3xl font-bold mt-1">14 Days</p>
          <p className="text-sm opacity-80 mt-2">Daily resolution predictions</p>
        </div>

        <div className="card p-6 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Model Accuracy</h3>
              {mape != null ? (
                <p className="text-3xl font-bold text-gray-900 mt-2">{mape.toFixed(1)}%</p>
              ) : (
                <p className="text-sm text-gray-400 mt-2 font-medium italic">Pending training...</p>
              )}
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          {mape != null && (
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 w-fit px-2.5 py-1 rounded-full border border-emerald-100">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>MAPE (Lower is better)</span>
            </div>
          )}
        </div>

        <div className="card p-6 border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Peak Demand</h3>
              {maxPredicted != null ? (
                <p className="text-3xl font-bold text-gray-900 mt-2">{maxPredicted.toLocaleString()} <span className="text-lg font-medium text-gray-500">kW</span></p>
              ) : (
                <p className="text-sm text-gray-400 mt-2 italic">Awaiting data...</p>
              )}
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 w-fit px-2.5 py-1 rounded-full border border-blue-100">
            <Activity className="h-3.5 w-3.5" />
            <span>14-day projection</span>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">14-Day Demand Forecast</h2>
        {forecast?.forecast ? (
          <ForecastChart data={forecast.forecast} />
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">Forecast model training required…</p>
          </div>
        )}
      </div>
    </div>
  );
}
