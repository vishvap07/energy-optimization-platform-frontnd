import { useState, useEffect } from 'react';
import { Users, Activity, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import analyticsService from '../services/analyticsService';
import ticketService from '../services/ticketService';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState({
    systemHealth: null,
    recentTickets: [],
    summary: null,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, ticketsRes, summaryRes] = await Promise.all([
          analyticsService.getSystemHealth(),
          ticketService.getTickets('open', 'high'), // pseudo-params for urgent tickets
          analyticsService.getAnalyticsSummary()
        ]);
        
        setData({
          systemHealth: healthRes,
          recentTickets: ticketsRes.slice(0, 5), // just top 5 for dashboard
          summary: summaryRes,
          loading: false,
        });
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
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

  const { systemHealth, recentTickets, summary } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500 mt-1">Platform overview, system health, and critical alerts.</p>
        </div>
        <Link to="/monitoring" className="btn-secondary">
          <Activity className="h-4 w-4 mr-2" />
          Full System Logs
        </Link>
      </div>

      {/* Global Systems Status Banner */}
      <div className={`rounded-xl p-4 border flex items-center gap-4 ${
        systemHealth?.status === 'healthy' 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className={`p-2 rounded-full ${systemHealth?.status === 'healthy' ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {systemHealth?.status === 'healthy' ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-600" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg">System Status: {systemHealth?.status.toUpperCase()}</h3>
          <p className="text-sm opacity-90">
            {systemHealth?.status === 'healthy' 
              ? 'All microservices are operating normally.' 
              : 'Critical degradation detected in one or more services.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quick Stats */}
        <div className="card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">CPU Usage</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{systemHealth?.uptime_percentage || '99.9'}%</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{systemHealth?.active_users || 0}</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-orange-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Urgent Tickets</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{systemHealth?.active_alerts || 0}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Anomalies Detected</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{summary?.anomaly_count || 0}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Needed - High Priority Tickets */}
        <div className="card w-full">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900">Urgent Help Desk Items</h2>
            <Link to="/tickets" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTickets.length > 0 ? recentTickets.map(ticket => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">#{ticket.id}</span>
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        {ticket.priority}
                      </span>
                    </div>
                    <Link to={`/tickets/${ticket.id}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">
                      {ticket.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">From: {ticket.user_email}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 self-center shrink-0" />
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No urgent tickets require attention.
              </div>
            )}
          </div>
        </div>

        {/* System Services Grid */}
        <div className="card w-full">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900">Microservices Health</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Authentication', 'Analytics Engine', 'Hugging Face Space', 'PostgreSQL DB', 'Ticket Router'].map((svc, idx) => (
              <div key={idx} className="border border-gray-100 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{svc}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalous Records Table */}
        <div className="card w-full lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-900">Anomalous Consumption Data</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {summary?.anomalous_records?.length > 0 ? summary.anomalous_records.map((rec, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">
                        {new Date(rec.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      Consumption Spike: {rec.consumption_kwh} kWh (Demand: {rec.demand_kw} kW)
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-500 self-center shrink-0" />
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No consumption anomalies detected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
