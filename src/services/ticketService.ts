import api from './api';
import { Ticket } from '../types/ticket';

export const ticketService = {
  getAll: () => api.get<Ticket[]>('/tickets').then((r) => r.data),
  getById: (id: string) => api.get<Ticket>(`/tickets/${id}`).then((r) => r.data),
  create: (ticket: Omit<Ticket, 'id'>) => api.post<Ticket>('/tickets', ticket).then((r) => r.data),
  update: (id: string, ticket: Partial<Ticket>) =>
    api.put<Ticket>(`/tickets/${id}`, ticket).then((r) => r.data),
  patch: (id: string, ticket: Partial<Ticket>) =>
    api.patch<Ticket>(`/tickets/${id}`, ticket).then((r) => r.data),
  remove: (id: string) => api.delete(`/tickets/${id}`),
};
