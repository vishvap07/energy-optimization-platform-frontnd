import { useState, useEffect } from 'react';
import optimizationService from '../services/optimizationService';
import OptimizationChart from '../components/Charts/OptimizationChart';
import { Zap, IndianRupee, ArrowRight, Lightbulb, CheckCircle2, Database } from 'lucide-react';

export default function OptimizationPage() {
  const [data, setData] = useState({
    recommendations: null,
    peakShaving: null,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, psRes] = await Promise.all([
          optimizationService.getRecommendations(),
          optimizationService.getPeakShaving()
        ]);
        setData({
          recommendations: recRes,
          peakShaving: psRes,
          loading: false
        });
      } catch (err) {
        console.error('Failed to load optimization data', err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, []);

  if (data.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { recommendations, peakShaving } = data;
  const summary = recommendations?.summary;
  const isDataDriven = recommendations?.data_driven;
  const context = recommendations?.context;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Energy Optimization</h1>
          <p className="text-gray-500 mt-1">Smart recommendations to reduce peak load and cut costs.</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
          isDataDriven
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          <Database className="h-3.5 w-3.5" />
          {isDataDriven ? 'Data-driven' : 'Default recommendations'}
        </div>
      </div>

      {/* Context panel when data-driven */}
      {isDataDriven && context && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Avg Consumption</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {context.avg_consumption_kwh} <span className="text-sm font-medium text-gray-500">kWh</span>
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-orange-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Peak Demand</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {context.peak_demand_kw} <span className="text-sm font-medium text-gray-500">kW</span>
                </h3>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Power Factor</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {context.avg_power_factor}
                </h3>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
        <div className="relative z-10 p-8 sm:flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-emerald-800 tracking-wide uppercase">Potential Monthly Savings</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-900">₹{summary?.total_potential_cost_savings.toLocaleString() || '0'}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">By implementing {summary?.total_recommendations || 0} recommended actions</p>
          </div>
          <div className="mt-6 sm:mt-0 flex gap-4">
            <div className="text-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Energy Saved</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{summary?.total_potential_savings_kwh.toLocaleString() || '0'} <span className="text-sm font-medium text-gray-500">kWh</span></p>
            </div>
            <div className="text-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">ROI Time</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{summary?.roi_estimate_months || 0} <span className="text-sm font-medium text-gray-500">Months</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Shaving Analysis */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Peak Shaving Simulation</h2>
          <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {peakShaving?.savings_percent}% Peak Cost Reduction
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">Simulation applies a 25% load shed during peak hours (&gt;{peakShaving?.threshold_kw} kW).</p>
        
        {peakShaving?.hourly && (
          <OptimizationChart data={peakShaving.hourly} />
        )}
      </div>

      {/* Recommendations List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actionable Recommendations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {recommendations?.recommendations?.map((rec, idx) => (
            <div key={idx} className="card p-5 hover:border-emerald-200 transition-colors group cursor-pointer">
              <div className="flex gap-4">
                <div className={`mt-1 shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                  rec.priority === 'critical' ? 'bg-red-100 text-red-600' :
                  rec.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {rec.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{rec.description}</p>
                  
                  <div className="mt-4 flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5 text-gray-900">
                      <Zap className="h-4 w-4 text-gray-400" />
                      {rec.estimated_savings_kwh} kWh
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <IndianRupee className="h-4 w-4 text-emerald-500" />
                      ₹{rec.estimated_cost_savings}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 self-center">
                  <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
