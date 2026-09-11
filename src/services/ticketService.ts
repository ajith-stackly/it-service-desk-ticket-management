import api from './api';
import { Ticket } from '../types/ticket';
import { normalizeTicketStatus, normalizePriority } from '../utils/normalize';

const normalizeTicket = (t: Ticket): Ticket => ({
  ...t,
  status: normalizeTicketStatus(t.status),
  priority: normalizePriority(t.priority),
  activity: t.activity ?? [],
});

export const ticketService = {
  getAll: () => api.get<Ticket[]>('/tickets').then((r) => r.data.map(normalizeTicket)),
  getById: (id: string) => api.get<Ticket>(`/tickets/${id}`).then((r) => normalizeTicket(r.data)),
  create: (ticket: Omit<Ticket, 'id'>) =>
    api.post<Ticket>('/tickets', ticket).then((r) => normalizeTicket(r.data)),
  update: (id: string, ticket: Partial<Ticket>) =>
    api.put<Ticket>(`/tickets/${id}`, ticket).then((r) => normalizeTicket(r.data)),
  patch: (id: string, ticket: Partial<Ticket>) =>
    api.patch<Ticket>(`/tickets/${id}`, ticket).then((r) => normalizeTicket(r.data)),
  remove: (id: string) => api.delete(`/tickets/${id}`),
};
