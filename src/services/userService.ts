import api from './api';
import { User } from '../types/user';
import { normalizeRole, normalizeUserStatus } from '../utils/normalize';

const normalizeUser = (u: User): User => ({
  ...u,
  role: normalizeRole(u.role),
  status: normalizeUserStatus(u.status),
});

export const userService = {
  getAll: () => api.get<User[]>('/users').then((r) => r.data.map(normalizeUser)),
  getById: (id: string) => api.get<User>(`/users/${id}`).then((r) => normalizeUser(r.data)),
  findByEmail: (email: string) =>
    api
      .get<User[]>(`/users?email=${encodeURIComponent(email)}`)
      .then((r) => (r.data[0] ? normalizeUser(r.data[0]) : null)),
  create: (user: Omit<User, 'id'>) => api.post<User>('/users', user).then((r) => normalizeUser(r.data)),
  update: (id: string, user: Partial<User>) =>
    api.put<User>(`/users/${id}`, user).then((r) => normalizeUser(r.data)),
  patch: (id: string, user: Partial<User>) =>
    api.patch<User>(`/users/${id}`, user).then((r) => normalizeUser(r.data)),
  remove: (id: string) => api.delete(`/users/${id}`),
};
