import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import ticketService from '../services/ticketService';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'hardware',
    priority: 'medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ticketService.createTicket(formData);
      navigate('/tickets');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create ticket. Please check the form.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Link to="/tickets" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Request</h1>
          <p className="text-gray-500 text-sm mt-1">Submit a new support ticket to our technical team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex gap-3 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Issue Title
          </label>
          <div className="mt-2">
            <input
              type="text"
              required
              placeholder="E.g., Sensor X in Building A offline"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Description
          </label>
          <div className="mt-2">
            <textarea
              required
              rows={4}
              placeholder="Please provide detailed information about the issue you are experiencing..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="input-field"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">Include any error messages or steps to reproduce.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Category
            </label>
            <div className="mt-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="input-field"
              >
                <option value="hardware">Hardware/Sensor Issue</option>
                <option value="software">Platform/Software Bug</option>
                <option value="billing">Billing Inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Priority
            </label>
            <div className="mt-2">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="input-field"
              >
                <option value="low">Low - General Inquiry</option>
                <option value="medium">Medium - Non-critical Issue</option>
                <option value="high">High - System Degradation</option>
                <option value="critical">Critical - Complete Outage</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <Link to="/tickets" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Submitting...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
