import { Link } from 'react-router-dom';
import { Clock, AlertCircle, MessageSquare } from 'lucide-react';

export default function TicketCard({ ticket }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'in_progress': return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'closed': return 'bg-gray-50 text-gray-600 ring-gray-500/10';
      default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Link to={`/tickets/${ticket.id}`} className="card p-5 hover:border-primary-300 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(ticket.status)}`}>
          {ticket.status.replace('_', ' ').toUpperCase()}
        </span>
        <span className={`text-xs font-bold uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority}
        </span>
      </div>
      
      <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
        {ticket.title}
      </h3>
      <p className="mt-2 text-sm text-gray-500 line-clamp-2 h-10">
        {ticket.description}
      </p>
      
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {new Date(ticket.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {ticket.responses?.length || 0}
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {ticket.category}
          </div>
        </div>
      </div>
    </Link>
  );
}
