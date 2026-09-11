import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../hooks/useCategories';
import { useTickets } from '../../hooks/useTickets';
import { ticketService } from '../../services/ticketService';
import { useToast } from '../../context/ToastContext';
import { nowISO, generateTicketId } from '../../utils/helpers';
import { ContactMethod, Priority } from '../../types/ticket';
import Loader from '../../components/common/Loader';

const inputClass =
  'w-full px-3.5 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition';

const CreateTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { categories, loading: catLoading } = useCategories();
  const { tickets } = useTickets();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('Email');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const activeCategories = categories.filter((c) => c.status === 'Active');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = 'Subject is required.';
    else if (subject.trim().length < 5) e.subject = 'Subject must be at least 5 characters.';
    if (!description.trim()) e.description = 'Description is required.';
    else if (description.trim().length < 15) e.description = 'Description must be at least 15 characters.';
    if (!category) e.category = 'Category is required.';
    if (!priority) e.priority = 'Priority is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate() || !user) return;
    setSubmitting(true);
    try {
      const now = nowISO();
      const newTicket = {
        id: generateTicketId(tickets.length),
        subject: subject.trim(),
        description: description.trim(),
        createdBy: user.id,
        createdByName: user.fullName,
        assignedAgent: null,
        assignedAgentName: null,
        category,
        priority,
        status: 'Open' as const,
        contactMethod,
        createdDate: now,
        updatedDate: now,
        dueDate: null,
        resolution: null,
        resolutionNotes: null,
        resolutionDate: null,
        activity: [{ timestamp: now, message: `Ticket created by ${user.fullName}` }],
      };
      const created = await ticketService.create(newTicket as any);
      showToast('Ticket created successfully!', 'success');
      navigate(`/tickets/${created.id}`);
    } catch (err) {
      showToast('Failed to create ticket. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (catLoading) return <Layout><Loader label="Loading form..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-ink-800 mb-1">Create support ticket</h1>
        <p className="text-ink-400 text-[13.5px] mb-6">Describe your issue and we'll get it sorted.</p>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg border border-ink-100 shadow-card p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              className={`${inputClass} ${errors.subject ? 'border-[#D9847D]' : 'border-ink-200'}`}
            />
            {errors.subject && <p className="text-[#9B3A32] text-xs mt-1.5">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Provide as much detail as possible..."
              className={`${inputClass} ${errors.description ? 'border-[#D9847D]' : 'border-ink-200'}`}
            />
            {errors.description && <p className="text-[#9B3A32] text-xs mt-1.5">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputClass} ${errors.category ? 'border-[#D9847D]' : 'border-ink-200'}`}
              >
                <option value="">Select category</option>
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-[#9B3A32] text-xs mt-1.5">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={`${inputClass} border-ink-200`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-2">Preferred contact method</label>
            <div className="flex gap-5">
              {(['Email', 'Phone', 'Chat'] as ContactMethod[]).map((m) => (
                <label key={m} className="flex items-center gap-2 text-[13.5px] text-ink-600 cursor-pointer">
                  <input
                    type="radio"
                    checked={contactMethod === m}
                    onChange={() => setContactMethod(m)}
                    className="accent-primary-600"
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-md text-[13px] font-medium text-ink-500 hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-md text-[13px] font-medium bg-ink-900 hover:bg-primary-700 text-white disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit ticket'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateTicket;
