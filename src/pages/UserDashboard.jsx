import { useState, useEffect, useCallback } from 'react';
import { Zap, AlertTriangle, TrendingDown, Clock, Activity, CheckCircle, Info, RefreshCw } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import alertsService from '../services/alertsService';
import ConsumptionChart from '../components/Charts/ConsumptionChart';

const ALERT_STYLES = {
  warning:  { bg: 'bg-orange-50', border: 'border-orange-100', icon: <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />, title: 'text-orange-800', msg: 'text-orange-700' },
  error:    { bg: 'bg-red-50',    border: 'border-red-100',    icon: <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />,    title: 'text-red-800',    msg: 'text-red-700'    },
  success:  { bg: 'bg-emerald-50',border: 'border-emerald-100',icon: <CheckCircle   className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,title: 'text-emerald-800',msg: 'text-emerald-700'},
  info:     { bg: 'bg-primary-50',border: 'border-primary-100',icon: <Zap           className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />, title: 'text-primary-800',msg: 'text-primary-700'},
};

export default function UserDashboard() {
  const [summary, setSummary] = useState(null);
  const [energyData, setEnergyData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [summaryRes, energyRes, alertsRes] = await Promise.all([
        analyticsService.getAnalyticsSummary(),
        analyticsService.getEnergyData(30),
        alertsService.getAlerts(),
      ]);
      setSummary(summaryRes);
      setEnergyData(energyRes.data || []);
      setAlerts(alertsRes.alerts || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError('Could not load dashboard data. Retrying…');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-sm">{error}</div>
      </div>
    );
  }

  const formatTimestamp = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Energy Overview</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatTimestamp(lastUpdated)}</span>
            {summary?.demo && (
              <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Demo data</span>
            )}
            {summary?.source === 'hugging_face' && (
              <span className="ml-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-bold border border-indigo-100">AI: Hugging Face</span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-l-primary-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Consumption</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.total_consumption_kwh?.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-400">kWh this month</p>
            </div>
            <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Peak Demand</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.peak_demand_kw}</p>
              <p className="mt-1 text-sm text-gray-400">kW max load</p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-yellow-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Est. Monthly Cost</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">₹{summary?.cost_estimate?.toLocaleString()}</p>
              <p className="mt-1 text-sm text-gray-400">Based on current rates</p>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts + Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">30-Day Consumption Trend</h2>
          {energyData && energyData.length > 0 ? (
            <ConsumptionChart data={energyData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">No recent data available</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-800">All clear</h4>
                  <p className="text-sm text-emerald-700 mt-1">No anomalies or alerts at this time.</p>
                </div>
              </div>
            ) : (
              alerts.map((alert, idx) => {
                const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
                return (
                  <div key={idx} className={`p-4 ${style.bg} rounded-lg border ${style.border} flex gap-3`}>
                    {style.icon}
                    <div>
                      <h4 className={`text-sm font-semibold ${style.title}`}>{alert.title}</h4>
                      <p className={`text-sm ${style.msg} mt-1`}>{alert.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
