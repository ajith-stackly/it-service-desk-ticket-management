import { useState, FormEvent } from 'react';
import Layout from '../../components/common/Layout';
import { useCategories } from '../../hooks/useCategories';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import { EmptyState, ErrorState } from '../../components/common/States';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Category } from '../../types/category';

const CategoryManagement = () => {
  const { categories, setCategories, loading, error, refetch } = useCategories();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description);
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Category name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (editing) {
        const updated = await categoryService.update(editing.id, {
          ...editing,
          name: name.trim(),
          description: description.trim(),
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showToast('Category updated!', 'success');
      } else {
        const created = await categoryService.create({
          name: name.trim(),
          description: description.trim(),
          status: 'Active',
        });
        setCategories((prev) => [...prev, created]);
        showToast('Category created!', 'success');
      }
      setModalOpen(false);
    } catch {
      showToast('Failed to save category.', 'error');
    }
  };

  const toggleStatus = async (c: Category) => {
    try {
      const newStatus = c.status === 'Active' ? 'Inactive' : 'Active';
      const updated = await categoryService.update(c.id, { ...c, status: newStatus });
      setCategories((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
      showToast(`Category ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.remove(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast('Category deleted.', 'success');
    } catch {
      showToast('Failed to delete category.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-800">Category management</h1>
          <p className="text-ink-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-ink-900 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition self-start"
        >
          + Add category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card border border-ink-100 overflow-hidden">
        {loading ? (
          <Loader label="Loading categories..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-ink-50">
                    <td className="px-4 py-3 font-medium text-ink-800">{c.name}</td>
                    <td className="px-4 py-3 text-ink-400 hidden md:table-cell">{c.description || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(c)}>
                        <Badge
                          label={c.status}
                          className={
                            c.status === 'Active'
                              ? 'bg-primary-50 text-primary-800 border-primary-300'
                              : 'bg-ink-100 text-ink-500 border-ink-200'
                          }
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => openEdit(c)} className="text-ink-400 hover:text-primary-600 text-xs">Edit</button>
                      <button onClick={() => setDeleteTarget(c)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Category Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.name ? 'border-red-400' : 'border-ink-200'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-ink-200 rounded-lg text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-ink-600 hover:bg-ink-50 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {editing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
};

export default CategoryManagement;
