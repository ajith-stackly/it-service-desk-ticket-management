import api from './api';
import { Comment } from '../types/comment';

export const commentService = {
  getAll: () => api.get<Comment[]>('/comments').then((r) => r.data),
  getByTicket: (ticketId: string) =>
    api.get<Comment[]>(`/comments?ticketId=${ticketId}`).then((r) => r.data),
  getById: (id: string) => api.get<Comment>(`/comments/${id}`).then((r) => r.data),
  create: (comment: Omit<Comment, 'id'>) =>
    api.post<Comment>('/comments', comment).then((r) => r.data),
  update: (id: string, comment: Partial<Comment>) =>
    api.put<Comment>(`/comments/${id}`, comment).then((r) => r.data),
  remove: (id: string) => api.delete(`/comments/${id}`),
};
