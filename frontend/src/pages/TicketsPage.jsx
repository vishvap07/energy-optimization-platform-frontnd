import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, ShieldAlert } from 'lucide-react';
import ticketService from '../services/ticketService';
import TicketCard from '../components/TicketCard';

export default function TicketsPage({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await ticketService.getTickets();
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'open') return ['open', 'in_progress'].includes(t.status);
    if (filter === 'closed') return ['resolved', 'closed'].includes(t.status);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex justify-between items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Desk & Support</h1>
          <p className="text-gray-500 mt-1">Manage technical support requests and system anomalies.</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          {(user?.role === 'admin' || user?.role === 'technician') && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-sm font-medium">Technician View</span>
            </div>
          )}
          <Link
            to="/tickets/create"
            className="btn-primary"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search tickets by ID or title..."
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field py-1.5 text-sm"
          >
            <option value="all">All Tickets</option>
            <option value="open">Active & Open</option>
            <option value="closed">Resolved & Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <ShieldAlert className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No tickets found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new support request.</p>
          <div className="mt-6">
            <Link to="/tickets/create" className="btn-primary">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Ticket
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
