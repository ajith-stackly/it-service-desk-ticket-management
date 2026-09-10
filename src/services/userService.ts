import api from './api';
import { User } from '../types/user';

export const userService = {
  getAll: () => api.get<User[]>('/users').then((r) => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  findByEmail: (email: string) =>
    api.get<User[]>(`/users?email=${encodeURIComponent(email)}`).then((r) => r.data[0] || null),
  create: (user: Omit<User, 'id'>) => api.post<User>('/users', user).then((r) => r.data),
  update: (id: string, user: Partial<User>) => api.put<User>(`/users/${id}`, user).then((r) => r.data),
  patch: (id: string, user: Partial<User>) => api.patch<User>(`/users/${id}`, user).then((r) => r.data),
  remove: (id: string) => api.delete(`/users/${id}`),
};
