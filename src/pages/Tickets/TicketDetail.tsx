import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ticketService } from '../../services/ticketService';
import { useUsers } from '../../hooks/useUsers';
import { Ticket, Status, Priority } from '../../types/ticket';
import { Comment } from '../../types/comment';
import { commentService } from '../../services/commentService';
import Loader from '../../components/common/Loader';
import { ErrorState } from '../../components/common/States';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  can,
  getAvailableActions,
  statusColors,
  priorityColors,
} from '../../utils/permissions';
import { formatDate, formatDateTime, nowISO } from '../../utils/helpers';

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { users } = useUsers();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('Medium');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const t = await ticketService.getById(id);
      setTicket(t);
    } catch (err) {
      setError('Ticket not found or server unreachable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const loadComments = useCallback(async () => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      const c = await commentService.getByTicket(id);
      setComments(c);
    } catch {
      // non-fatal — comments panel will just show empty state
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (loading) return <Layout><Loader label="Loading ticket..." /></Layout>;
  if (error || !ticket || !user) return <Layout><ErrorState message={error || 'Ticket not found.'} onRetry={load} /></Layout>;

  if (!can.viewTicket(user.role, ticket, user.id)) {
    return (
      <Layout>
        <ErrorState message="You do not have permission to view this ticket." />
      </Layout>
    );
  }

  const agents = users.filter((u) => u.role === 'Support Agent' && u.status === 'Active');
  const availableActions = getAvailableActions(user.role, ticket, user.id);

  const pushActivity = (message: string, current: Ticket): Ticket['activity'] => [
    ...current.activity,
    { timestamp: nowISO(), message },
  ];

  const handleStatusChange = async (newStatus: Status) => {
    try {
      const now = nowISO();
      const label = `Status changed to ${newStatus === 'Open' && ticket.status === 'Resolved' ? 'Reopened' : newStatus} by ${user.fullName}`;
      const updated: Partial<Ticket> = {
        status: newStatus,
        updatedDate: now,
        activity: pushActivity(label, ticket),
      };
      const saved = await ticketService.update(ticket.id, { ...ticket, ...updated });
      setTicket(saved);
      showToast(`Ticket status updated to "${newStatus}"`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) return;
    const agent = agents.find((a) => a.id === selectedAgent);
    if (!agent) return;
    try {
      const now = nowISO();
      const wasAssigned = !!ticket.assignedAgent;
      const message = wasAssigned
        ? `Reassigned from ${ticket.assignedAgentName} to ${agent.fullName} by ${user.fullName}`
        : `Ticket assigned to ${agent.fullName} by ${user.fullName}`;
      const updated: Partial<Ticket> = {
        assignedAgent: agent.id,
        assignedAgentName: agent.fullName,
        status: ticket.status === 'Open' ? 'Assigned' : ticket.status,
        updatedDate: now,
        activity: pushActivity(message, ticket),
      };
      const saved = await ticketService.update(ticket.id, { ...ticket, ...updated });
      setTicket(saved);
      setAssignModalOpen(false);
      setSelectedAgent('');
      showToast('Ticket assigned successfully!', 'success');
    } catch {
      showToast('Failed to assign ticket.', 'error');
    }
  };

  const handleAddComment = async () => {
    const text = newComment.trim();
    if (!text || !ticket) return;
    setPostingComment(true);
    try {
      const now = new Date();
      const created = await commentService.create({
        ticketId: ticket.id,
        userId: user.id,
        userName: user.fullName,
        comment: text,
        createdDate: now.toISOString(),
        createdTime: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      });
      setComments((prev) => [...prev, created]);
      const saved = await ticketService.update(ticket.id, {
        activity: pushActivity(`Comment added by ${user.fullName}`, ticket),
      });
      setTicket(saved);
      setNewComment('');
      showToast('Comment added.', 'success');
    } catch {
      showToast('Failed to add comment.', 'error');
    } finally {
      setPostingComment(false);
    }
  };


  const handleUnassign = async () => {
    try {
      const now = nowISO();
      const updated: Partial<Ticket> = {
        assignedAgent: null,
        assignedAgentName: null,
        status: 'Open',
        updatedDate: now,
        activity: pushActivity(`Ticket unassigned by ${user.fullName}`, ticket),
      };
      const saved = await ticketService.update(ticket.id, { ...ticket, ...updated });
      setTicket(saved);
      showToast('Ticket unassigned.', 'info');
    } catch {
      showToast('Failed to unassign ticket.', 'error');
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      showToast('Resolution summary is required.', 'error');
      return;
    }
    try {
      const now = nowISO();
      const updated: Partial<Ticket> = {
        status: 'Resolved',
        resolution: resolution.trim(),
        resolutionNotes: resolutionNotes.trim(),
        resolutionDate: now,
        updatedDate: now,
        activity: pushActivity(`Resolution added and ticket resolved by ${user.fullName}`, ticket),
      };
      const saved = await ticketService.update(ticket.id, { ...ticket, ...updated });
      setTicket(saved);
      setResolveModalOpen(false);
      showToast('Ticket resolved successfully!', 'success');
    } catch {
      showToast('Failed to resolve ticket.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await ticketService.remove(ticket.id);
      showToast('Ticket deleted.', 'success');
      navigate('/tickets');
    } catch {
      showToast('Failed to delete ticket.', 'error');
    }
  };

  const openEditModal = () => {
    setEditSubject(ticket.subject);
    setEditDescription(ticket.description);
    setEditPriority(ticket.priority);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editSubject.trim() || editSubject.trim().length < 5) {
      showToast('Subject must be at least 5 characters.', 'error');
      return;
    }
    if (!editDescription.trim() || editDescription.trim().length < 15) {
      showToast('Description must be at least 15 characters.', 'error');
      return;
    }
    try {
      const now = nowISO();
      const priorityChanged = editPriority !== ticket.priority;
      const updated: Partial<Ticket> = {
        subject: editSubject.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        updatedDate: now,
        activity: pushActivity(
          `Ticket edited by ${user.fullName}${priorityChanged ? ` (priority changed to ${editPriority})` : ''}`,
          ticket
        ),
      };
      const saved = await ticketService.update(ticket.id, { ...ticket, ...updated });
      setTicket(saved);
      setEditModalOpen(false);
      showToast('Ticket updated successfully!', 'success');
    } catch {
      showToast('Failed to update ticket.', 'error');
    }
  };

  const canEdit = can.editTicket(user.role, ticket, user.id);
  const canDelete = can.deleteTicket(user.role);
  const canAssign = can.assignTicket(user.role);
  const canResolve = can.addResolution(user.role) && (user.role === 'Admin' || ticket.assignedAgent === user.id);
  const canComment = can.addComment(user.role, ticket, user.id);
  const canUpdatePriority = can.updatePriority(user.role, ticket, user.id);

  return (
    <Layout>
      <div className="mb-4">
        <Link to="/tickets" className="text-[13px] text-ink-400 hover:text-primary-600 font-medium transition-colors">
          ← Back to tickets
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-lg border border-ink-100 shadow-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-ink-400 font-data mb-1.5">{ticket.id}</p>
                <h1 className="text-lg font-semibold text-ink-800 leading-snug">{ticket.subject}</h1>
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                <Badge label={ticket.priority} className={priorityColors[ticket.priority]} />
                <Badge label={ticket.status} className={statusColors[ticket.status]} />
              </div>
            </div>
            <p className="text-ink-500 text-[13.5px] whitespace-pre-wrap leading-relaxed mb-5">
              {ticket.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm border-t border-ink-100 pt-4">
              <div>
                <p className="text-ink-400 text-[11px] uppercase tracking-wide mb-0.5">Created by</p>
                <p className="text-ink-700 font-medium text-[13.5px]">{ticket.createdByName}</p>
              </div>
              <div>
                <p className="text-ink-400 text-[11px] uppercase tracking-wide mb-0.5">Assigned agent</p>
                <p className="text-ink-700 font-medium text-[13.5px]">{ticket.assignedAgentName || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-ink-400 text-[11px] uppercase tracking-wide mb-0.5">Category</p>
                <p className="text-ink-700 font-medium text-[13.5px]">{ticket.category}</p>
              </div>
              <div>
                <p className="text-ink-400 text-[11px] uppercase tracking-wide mb-0.5">Created</p>
                <p className="text-ink-700 font-medium text-[13.5px] font-data">{formatDate(ticket.createdDate)}</p>
              </div>
              <div>
                <p className="text-ink-400 text-[11px] uppercase tracking-wide mb-0.5">Updated</p>
                <p className="text-ink-700 font-medium text-[13.5px] font-data">{formatDate(ticket.updatedDate)}</p>
              </div>
              <div>
                <p className="text-ink-400 text-[11px] uppercase tracking-wide mb-0.5">Due date</p>
                <p className="text-ink-700 font-medium text-[13.5px] font-data">{formatDate(ticket.dueDate)}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-ink-100">
              {canEdit && (
                <button onClick={openEditModal} className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors">
                  Edit
                </button>
              )}
              {canAssign && (
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="px-3 py-1.5 text-[13px] font-medium rounded-md bg-ink-800 text-white hover:bg-ink-700 transition-colors"
                >
                  {ticket.assignedAgent ? 'Reassign' : 'Assign'} agent
                </button>
              )}
              {canAssign && ticket.assignedAgent && (
                <button onClick={handleUnassign} className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors">
                  Unassign
                </button>
              )}
              {availableActions
                .filter((a) => a !== 'Resolved')
                .map((action) => (
                  <button
                    key={action}
                    onClick={() => handleStatusChange(action)}
                    className="px-3 py-1.5 text-[13px] font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    {action === 'Open' && ticket.status === 'Resolved' ? 'Reopen' : `Move to ${action}`}
                  </button>
                ))}
              {canResolve && availableActions.includes('Resolved') && (
                <button
                  onClick={() => setResolveModalOpen(true)}
                  className="px-3 py-1.5 text-[13px] font-medium rounded-md bg-primary-700 text-white hover:bg-primary-800 transition-colors"
                >
                  Resolve ticket
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-[#EFC0BB] text-[#9B3A32] hover:bg-[#FBE7E5] transition-colors ml-auto"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Resolution */}
          {ticket.resolution && (
            <div className="bg-primary-50 rounded-lg border border-primary-200 p-6">
              <h3 className="font-semibold text-primary-800 mb-2 text-[14.5px]">Resolution</h3>
              <p className="text-[13.5px] text-primary-900 mb-2 leading-relaxed">{ticket.resolution}</p>
              {ticket.resolutionNotes && (
                <p className="text-[13px] text-primary-700 italic mb-2">{ticket.resolutionNotes}</p>
              )}
              <p className="text-xs text-primary-600 font-data">Resolved {formatDate(ticket.resolutionDate)}</p>
            </div>
          )}
          {/* Comments */}
          <div className="bg-white rounded-lg border border-ink-100 shadow-card p-6">
            <h3 className="font-semibold text-ink-800 mb-4 text-[14.5px]">
              Comments {comments.length > 0 && <span className="text-ink-400 font-normal">({comments.length})</span>}
            </h3>

            {commentsLoading ? (
              <Loader label="Loading comments..." />
            ) : comments.length === 0 ? (
              <p className="text-[13px] text-ink-400 py-2">No comments yet.</p>
            ) : (
              <div className="space-y-4 mb-5">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-md bg-ink-800 text-white flex items-center justify-center font-semibold text-[12px] shrink-0">
                      {c.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold text-ink-800">{c.userName}</p>
                        <p className="text-[11px] text-ink-400 font-data">
                          {formatDate(c.createdDate)} · {c.createdTime}
                        </p>
                      </div>
                      <p className="text-[13.5px] text-ink-600 leading-relaxed mt-0.5 whitespace-pre-wrap">
                        {c.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {canComment ? (
              <div className="border-t border-ink-100 pt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-ink-200 rounded-md text-[13px] bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || postingComment}
                    className="px-4 py-2 rounded-md text-[13px] font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {postingComment ? 'Posting...' : 'Post comment'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-ink-400 border-t border-ink-100 pt-4">
                You don't have permission to comment on this ticket.
              </p>
            )}
          </div>
        </div>

        {/* Activity Timeline sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-lg border border-ink-100 shadow-card p-6">
            <h3 className="font-semibold text-ink-800 mb-4 text-[14.5px]">Activity history</h3>
            <div className="space-y-4">
              {[...ticket.activity].reverse().map((a, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                    {idx !== ticket.activity.length - 1 && <div className="w-px flex-1 bg-ink-100" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-[13px] text-ink-700 leading-snug">{a.message}</p>
                    <p className="text-[11px] text-ink-400 mt-1 font-data">{formatDateTime(a.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign ticket" size="sm">
        <div className="space-y-4">
          <div className="text-[13px] text-ink-500 space-y-0.5">
            <p>Ticket: <span className="font-medium text-ink-700 font-data">{ticket.id}</span></p>
            <p>Current agent: <span className="font-medium text-ink-700">{ticket.assignedAgentName || 'None'}</span></p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Select support agent</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              <option value="">Choose an agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.fullName} — {a.department}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 text-[13px] font-medium text-ink-500 hover:bg-ink-50 rounded-md">
              Cancel
            </button>
            <button onClick={handleAssign} disabled={!selectedAgent} className="px-4 py-2 text-[13px] font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
              Confirm assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal isOpen={resolveModalOpen} onClose={() => setResolveModalOpen(false)} title="Resolve ticket" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Resolution *</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={3}
              placeholder="Summarize how this was resolved..."
              className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Resolution notes</label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={2}
              placeholder="Additional notes (optional)"
              className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setResolveModalOpen(false)} className="px-4 py-2 text-[13px] font-medium text-ink-500 hover:bg-ink-50 rounded-md">
              Cancel
            </button>
            <button onClick={handleResolve} className="px-4 py-2 text-[13px] font-medium bg-primary-700 text-white rounded-md hover:bg-primary-800">
              Mark as resolved
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit ticket" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Subject</label>
            <input
              type="text"
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          {canUpdatePriority && (
            <div>
              <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-ink-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-[13px] font-medium text-ink-500 hover:bg-ink-50 rounded-md">
              Cancel
            </button>
            <button onClick={handleEditSave} className="px-4 py-2 text-[13px] font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Save changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete ticket"
        message={`Are you sure you want to delete ticket ${ticket.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Layout>
  );
};

export default TicketDetail;
