import { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, FileText, Database, Server, User, Lock } from 'lucide-react';
import analyticsService from '../services/analyticsService';

export default function MonitoringPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await analyticsService.getLogs(50);
        setLogs(data.logs || []);
      } catch (error) {
        console.error("Error fetching logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'error': return 'text-red-700 bg-red-50 ring-red-600/20';
      case 'warning': return 'text-yellow-800 bg-yellow-50 ring-yellow-600/20';
      case 'info': return 'text-blue-700 bg-blue-50 ring-blue-600/20';
      default: return 'text-gray-600 bg-gray-50 ring-gray-500/10';
    }
  };

  const getActionIcon = (action) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('login') || act.includes('auth')) return <ShieldAlert className="h-4 w-4" />;
    if (act.includes('db') || act.includes('data')) return <Database className="h-4 w-4" />;
    if (act.includes('api') || act.includes('server')) return <Server className="h-4 w-4" />;
    if (act.includes('profile')) return <User className="h-4 w-4" />;
    if (act.includes('password')) return <Lock className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level.toLowerCase() === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Monitoring & Logs</h1>
        <p className="text-gray-500 mt-1">Audit trails, security events, and API performance metrics.</p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10 bg-gray-50 font-mono text-sm"
            placeholder="Search logs via regex or keywords..."
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field py-1.5 text-sm"
          >
            <option value="all">All Levels</option>
            <option value="error">Errors Only</option>
            <option value="warning">Warnings</option>
            <option value="info">Info Events</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Event
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User/IP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 font-mono text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(log.created_at).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit', second:'2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-900 font-medium font-sans">
                        <span className="text-gray-400">{getActionIcon(log.action)}</span>
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {log.user_email || log.ip_address}
                    </td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs" title={log.message}>
                      {log.message || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-sans">
                    No logs found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredLogs.length} recent system events</span>
          <button className="text-primary-600 hover:text-primary-700 font-medium">Download CSV Export</button>
        </div>
      </div>
    </div>
  );
}
