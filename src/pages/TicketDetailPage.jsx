import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, PlayCircle, AlertCircle, Clock, Search, ShieldAlert } from 'lucide-react';
import ticketService from '../services/ticketService';

export default function TicketDetailPage({ currentUser }) {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const isAdminOrTech = currentUser?.role === 'admin' || currentUser?.role === 'technician';

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const data = await ticketService.getTicket(id);
      setTicket(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await ticketService.updateStatus(id, newStatus);
      fetchTicket();
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      await ticketService.addResponse(id, reply, isInternal);
      setReply('');
      setIsInternal(false);
      fetchTicket();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert("Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ticket) return <div>Ticket not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Info */}
      <div className="flex items-center gap-4">
        <Link to="/tickets" className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white border border-gray-200 shadow-sm">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">#{ticket.id}</h1>
            <h1 className="text-xl font-semibold text-gray-800">{ticket.title}</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
            Opened by {ticket.user_email} on {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Conversation Thread */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            {/* Original Problem Description */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                  {ticket.user_email[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{ticket.user_email}</span>
                    <span className="text-xs text-gray-500">Original Post</span>
                  </div>
                  <div className="mt-2 text-gray-700 whitespace-pre-wrap">{ticket.description}</div>
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="p-6 space-y-6">
              {ticket.responses?.map((res) => (
                <div key={res.id} className={`flex items-start gap-4 ${res.is_internal ? 'pl-14' : ''}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    res.responder_email?.includes('admin') || res.responder_email?.includes('tech') 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-primary-100 text-primary-700'
                  }`}>
                    {(res.responder_email || '?')[0].toUpperCase()}
                  </div>
                  <div className={`flex-1 rounded-2xl p-4 ${
                    res.is_internal ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-100'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{res.responder_email || res.author_name}</span>
                      <div className="flex items-center gap-2">
                        {res.is_internal && <span className="text-xs font-bold text-amber-700 uppercase">Internal Note</span>}
                        <span className="text-xs text-gray-500">{new Date(res.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap text-sm">{res.message}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Reply Box */}
            {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
                <form onSubmit={handleReply}>
                  <textarea
                    rows={4}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your response here..."
                    className="input-field mb-3"
                    required
                  />
                  <div className="flex justify-between items-center">
                    {isAdminOrTech ? (
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input 
                          type="checkbox" 
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-amber-500"
                        />
                        Internal Note (Hidden from Customer)
                      </label>
                    ) : <div></div>}
                    <button
                      type="submit"
                      disabled={submitting || !reply.trim()}
                      className="btn-primary"
                    >
                      {submitting ? 'Sending...' : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Reply
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Ticket Details</h3>
            
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500 font-medium">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    ticket.status === 'open' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                    ticket.status === 'in_progress' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                    'bg-green-50 text-green-700 ring-green-600/20'
                  }`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-gray-500 font-medium">Priority</dt>
                <dd className="mt-1 font-medium capitalize text-gray-900">{ticket.priority}</dd>
              </div>
              
              <div>
                <dt className="text-gray-500 font-medium">Category</dt>
                <dd className="mt-1 capitalize text-gray-900">{ticket.category}</dd>
              </div>
            </dl>
          </div>

          {/* Admin & Owner Tools */}
          {(isAdminOrTech || currentUser?.id === ticket.user) && (
            <div className={`card p-5 border-2 ${isAdminOrTech ? 'border-primary-100' : 'border-emerald-100'}`}>
              <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2 ${
                isAdminOrTech ? 'text-primary-900 border-primary-100' : 'text-emerald-900 border-emerald-100'
              }`}>
                {isAdminOrTech ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {isAdminOrTech ? 'Staff Controls' : 'Ticket Actions'}
              </h3>
              
              <div className="space-y-3">
                <p className="text-xs text-gray-500 font-medium mb-1">Status Management</p>
                {isAdminOrTech && ticket.status === 'open' && (
                  <button 
                    onClick={() => handleStatusChange('in_progress')}
                    className="w-full justify-center btn-secondary !bg-yellow-50 !text-yellow-700 !border-yellow-200 hover:!bg-yellow-100"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </button>
                )}
                {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                  <button 
                    onClick={() => handleStatusChange('resolved')}
                    className="w-full justify-center btn-secondary !bg-emerald-50 !text-emerald-700 !border-emerald-200 hover:!bg-emerald-100"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isAdminOrTech ? 'Resolve Ticket' : 'Mark as Resolved'}
                  </button>
                )}
                {ticket.status === 'resolved' && (
                  <button 
                    onClick={() => handleStatusChange('closed')}
                    className="w-full justify-center btn-secondary"
                  >
                    {isAdminOrTech ? 'Close Archival' : 'Close Ticket'}
                  </button>
                )}
                {ticket.status === 'closed' && (
                   <p className="text-center text-xs text-gray-400 italic py-2">
                     This ticket is closed and archived.
                   </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
