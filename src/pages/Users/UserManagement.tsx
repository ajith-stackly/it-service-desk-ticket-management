import { useState, useMemo, FormEvent } from 'react';
import Layout from '../../components/common/Layout';
import { useUsers } from '../../hooks/useUsers';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import { EmptyState, ErrorState } from '../../components/common/States';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { roleColors } from '../../utils/permissions';
import { isValidEmail, isValidPhone, formatDate, nowISO } from '../../utils/helpers';
import { Role, User } from '../../types/user';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  department: '',
  role: 'Employee' as Role,
};

const UserManagement = () => {
  const { users, setUsers, loading, error, refetch } = useUsers();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setForm({
      fullName: u.fullName,
      email: u.email,
      password: '',
      phone: u.phone,
      department: u.department,
      role: u.role,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email.';
    if (!editingUser && !form.password) e.password = 'Password is required.';
    else if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (!form.phone.trim()) e.phone = 'Phone is required.';
    else if (!isValidPhone(form.phone)) e.phone = 'Enter a valid phone number.';
    if (!form.department.trim()) e.department = 'Department is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (editingUser) {
        const payload: Partial<User> = {
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          department: form.department.trim(),
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        const updated = await userService.update(editingUser.id, { ...editingUser, ...payload });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        showToast('User updated successfully!', 'success');
      } else {
        const created = await userService.create({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim(),
          department: form.department.trim(),
          role: form.role,
          status: 'Active',
          createdDate: nowISO(),
        });
        setUsers((prev) => [...prev, created]);
        showToast('User created successfully!', 'success');
      }
      setModalOpen(false);
    } catch {
      showToast('Failed to save user.', 'error');
    }
  };

  const handleToggleStatus = async (u: User) => {
    try {
      const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
      const updated = await userService.update(u.id, { ...u, status: newStatus });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      showToast(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await userService.remove(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showToast('User deleted.', 'success');
    } catch {
      showToast('Failed to delete user.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-800 dark:text-ink-100">User management</h1>
          <p className="text-ink-400 dark:text-ink-500 text-sm mt-1">{filtered.length} users</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-ink-900 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition self-start"
        >
          + Add user
        </button>
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-lg shadow-card border border-ink-100 dark:border-ink-700 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-ink-200 dark:border-ink-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-ink-200 dark:border-ink-700 rounded-lg text-sm"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Support Agent">Support Agent</option>
          <option value="Employee">Employee</option>
        </select>
      </div>

      <div className="bg-white dark:bg-ink-800 rounded-lg shadow-card border border-ink-100 dark:border-ink-700 overflow-hidden">
        {loading ? (
          <Loader label="Loading users..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-700/40 text-ink-400 dark:text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Department</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/50">
                    <td className="px-4 py-3 font-medium text-ink-800 dark:text-ink-100">{u.fullName}</td>
                    <td className="px-4 py-3 text-ink-400 dark:text-ink-500 hidden md:table-cell">{u.email}</td>
                    <td className="px-4 py-3 text-ink-400 dark:text-ink-500 hidden lg:table-cell">{u.department}</td>
                    <td className="px-4 py-3"><Badge label={u.role} className={roleColors[u.role]} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleStatus(u)}>
                        <Badge
                          label={u.status}
                          className={
                            u.status === 'Active'
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 border-primary-300 dark:border-primary-700'
                              : 'bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-400 border-ink-200 dark:border-ink-700'
                          }
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => setViewUser(u)} className="text-ink-400 dark:text-ink-500 hover:text-primary-600 dark:hover:text-primary-400 text-xs">View</button>
                      <button onClick={() => openEditModal(u)} className="text-ink-400 dark:text-ink-500 hover:text-primary-600 dark:hover:text-primary-400 text-xs">Edit</button>
                      <button onClick={() => setDeleteTarget(u)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1">Full Name *</label>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.fullName ? 'border-red-400' : 'border-ink-200 dark:border-ink-700'}`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1">Email *</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.email ? 'border-red-400' : 'border-ink-200 dark:border-ink-700'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1">
              Password {editingUser ? '(leave blank to keep current)' : '*'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.password ? 'border-red-400' : 'border-ink-200 dark:border-ink-700'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.phone ? 'border-red-400' : 'border-ink-200 dark:border-ink-700'}`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1">Department *</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.department ? 'border-red-400' : 'border-ink-200 dark:border-ink-700'}`}
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full px-3 py-2 border border-ink-200 dark:border-ink-700 rounded-lg text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="Support Agent">Support Agent</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700/50 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="sm">
        {viewUser && (
          <div className="space-y-3 text-sm">
            <div><p className="text-ink-400 dark:text-ink-500 text-xs">Full Name</p><p className="font-medium">{viewUser.fullName}</p></div>
            <div><p className="text-ink-400 dark:text-ink-500 text-xs">Email</p><p className="font-medium">{viewUser.email}</p></div>
            <div><p className="text-ink-400 dark:text-ink-500 text-xs">Phone</p><p className="font-medium">{viewUser.phone}</p></div>
            <div><p className="text-ink-400 dark:text-ink-500 text-xs">Department</p><p className="font-medium">{viewUser.department}</p></div>
            <div><p className="text-ink-400 dark:text-ink-500 text-xs">Role</p><Badge label={viewUser.role} className={roleColors[viewUser.role]} /></div>
            <div><p className="text-ink-400 dark:text-ink-500 text-xs">Created</p><p className="font-medium">{formatDate(viewUser.createdDate)}</p></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
};

export default UserManagement;
