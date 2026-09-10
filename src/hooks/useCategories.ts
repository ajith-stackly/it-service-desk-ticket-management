import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { Category } from '../types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories. Make sure JSON Server is running on port 4000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, setCategories, loading, error, refetch: fetchCategories };
}
