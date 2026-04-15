import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import PeakDemandChart from '../components/Charts/PeakDemandChart';
import ConsumptionChart from '../components/Charts/ConsumptionChart';
import DataIngestionSection from '../components/DataIngestionSection';
import { BarChart3, Clock, TrendingUp, AlertCircle, FileText } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState({
    peakDemand: null,
    summary: null,
    loading: true,
  });
  const [simulationData, setSimulationData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = async () => {
    try {
      const [pd, sm] = await Promise.all([
        analyticsService.getPeakDemand(),
        analyticsService.getAnalyticsSummary()
      ]);
      setData({ peakDemand: pd, summary: sm, loading: false });
    } catch (err) {
      console.error("Failed to load analytics", err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleUploadSuccess = (response) => {
    if (response?.simulation) {
      setSimulationData(response);
    } else {
      setRefreshKey(prev => prev + 1);
    }
  };

  if (data.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { peakDemand, summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into your energy consumption patterns and peak profiles.</p>
        </div>
        {simulationData && (
          <button 
            onClick={() => setSimulationData(null)}
            className="btn-secondary text-xs"
          >
            Clear Simulation
          </button>
        )}
      </div>

      {simulationData ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-widest">
                File Audit Simulation
              </span>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">CSV Audit Results</h2>
                <p className="text-slate-400 text-xs">Simulated analysis for uploaded external dataset</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Records</p>
                <p className="text-2xl font-bold mt-1 text-white">{simulationData.summary.total_rows.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Peak Demand</p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">{simulationData.summary.peak_demand_kw} <small className="text-xs text-slate-500 font-medium">kW</small></p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Est. Monthly Cost</p>
                <p className="text-2xl font-bold mt-1 text-white">₹{simulationData.summary.cost_estimate.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Anomalies Detected</p>
                <p className="text-2xl font-bold mt-1 text-orange-400">{simulationData.summary.anomaly_count}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">File Consumption Profile (Top 100 Points)</h2>
              <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">Simulation Context</div>
            </div>
            <div className="h-[350px]">
              <ConsumptionChart data={simulationData.chart_data} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-5 border-t-4 border-t-blue-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Daily Average</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {summary ? `${summary.avg_daily_kwh} kWh` : '1,152 kWh'}
                  </h3>
                </div>
              </div>
            </div>
            <div className="card p-5 border-t-4 border-t-purple-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Month-over-Month</p>
                  <h3 className="text-2xl font-bold text-gray-900">+4.2%</h3>
                </div>
              </div>
            </div>
            <div className="card p-5 border-t-4 border-t-rose-500">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 rounded-lg">
                  <Clock className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Historical Peak</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {summary ? `${summary.peak_demand_kw} kW` : '112.4 kW'}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">24-Hour Peak Demand Profile</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                <AlertCircle className="h-4 w-4" />
                Threshold: {peakDemand?.threshold_kw} kW
              </span>
            </div>
            
            {peakDemand?.peak_hours ? (
              <PeakDemandChart data={peakDemand.peak_hours} threshold={peakDemand.threshold_kw} />
            ) : (
              <p className="text-gray-500 text-center py-10">No peak demand data available</p>
            )}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card text-center py-12 px-6">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Seasonal Pattern Analysis</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            We need at least 6 months of historical data to generate reliable seasonal models. Keep using the platform!
          </p>
        </div>
        <div>
          <DataIngestionSection onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    </div>
  );
}
