import api from './api';
import { Category } from '../types/category';

export const categoryService = {
  getAll: () => api.get<Category[]>('/categories').then((r) => r.data),
  getById: (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data),
  create: (category: Omit<Category, 'id'>) =>
    api.post<Category>('/categories', category).then((r) => r.data),
  update: (id: string, category: Partial<Category>) =>
    api.put<Category>(`/categories/${id}`, category).then((r) => r.data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
