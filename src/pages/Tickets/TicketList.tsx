import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../hooks/useTickets';
import { useCategories } from '../../hooks/useCategories';
import { useUsers } from '../../hooks/useUsers';
import Loader from '../../components/common/Loader';
import { EmptyState, ErrorState } from '../../components/common/States';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { statusColors, priorityColors } from '../../utils/permissions';
import { formatDate } from '../../utils/helpers';
import { Priority, Status } from '../../types/ticket';

const PAGE_SIZE = 8;

const TicketList = () => {
  const { user } = useAuth();
  const { tickets, loading, error, refetch } = useTickets();
  const { categories } = useCategories();
  const { users } = useUsers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const agents = users.filter((u) => u.role === 'Support Agent');

  const scoped = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Admin') return tickets;
    if (user.role === 'Support Agent') return tickets.filter((t) => t.assignedAgent === user.id);
    return tickets.filter((t) => t.createdBy === user.id);
  }, [tickets, user]);

  const filtered = useMemo(() => {
    let result = scoped.filter((t) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.createdByName.toLowerCase().includes(q) ||
        (t.assignedAgentName || '').toLowerCase().includes(q);
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const matchesPriority = !priorityFilter || t.priority === priorityFilter;
      const matchesCategory = !categoryFilter || t.category === categoryFilter;
      const matchesAgent = !agentFilter || t.assignedAgent === agentFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAgent;
    });

    const priorityRank: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

    switch (sortBy) {
      case 'newest':
        result = result.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        break;
      case 'oldest':
        result = result.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
        break;
      case 'priority':
        result = result.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
        break;
      case 'updated':
        result = result.sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());
        break;
    }
    return result;
  }, [scoped, search, statusFilter, priorityFilter, categoryFilter, agentFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statuses: Status[] = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled'];
  const priorities: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setAgentFilter('');
    setSortBy('newest');
    setPage(1);
  };

  const inputClass =
    'px-3 py-2 border border-ink-200 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white';

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink-800">
            {user?.role === 'Employee' ? 'My tickets' : 'Tickets'}
          </h1>
          <p className="text-ink-400 text-[13.5px] mt-1">
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-1.5 bg-ink-900 hover:bg-primary-700 text-white px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors self-start"
        >
          + Create ticket
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-ink-100 shadow-card p-4 mb-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Search ID, subject, name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={`lg:col-span-2 ${inputClass}`}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as Status | '');
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value as Priority | '');
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">All priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className={inputClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        {user?.role === 'Admin' && (
          <select
            value={agentFilter}
            onChange={(e) => {
              setAgentFilter(e.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.fullName}</option>
            ))}
          </select>
        )}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={inputClass}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Highest priority</option>
          <option value="updated">Recently updated</option>
        </select>
        <button
          onClick={resetFilters}
          className="text-[13px] text-ink-400 hover:text-ink-700 text-left"
        >
          Clear filters
        </button>
      </div>

      <div className="bg-white rounded-lg border border-ink-100 shadow-card overflow-hidden">
        {loading ? (
          <Loader label="Loading tickets..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No tickets found" subtitle="Try adjusting your search or filters." />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead className="bg-ink-50/70 text-ink-400 text-[11px] uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Ticket</th>
                    <th className="text-left px-4 py-3 font-medium">Subject</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-left px-4 py-3 font-medium">Agent</th>
                    <th className="text-left px-4 py-3 font-medium">Priority</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {paged.map((t) => (
                    <tr key={t.id} className="hover:bg-primary-50/60 transition-colors cursor-default">
                      <td className="px-4 py-3 font-medium text-primary-700 font-data">
                        <Link to={`/tickets/${t.id}`}>{t.id}</Link>
                      </td>
                      <td className="px-4 py-3 text-ink-700 max-w-xs truncate">
                        <Link to={`/tickets/${t.id}`}>{t.subject}</Link>
                      </td>
                      <td className="px-4 py-3 text-ink-500">{t.category}</td>
                      <td className="px-4 py-3 text-ink-500">{t.assignedAgentName || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge label={t.priority} className={priorityColors[t.priority]} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={t.status} className={statusColors[t.status]} />
                      </td>
                      <td className="px-4 py-3 text-ink-400 font-data text-xs">{formatDate(t.createdDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-ink-100">
              {paged.map((t) => (
                <Link
                  key={t.id}
                  to={`/tickets/${t.id}`}
                  className="block px-4 py-3.5 hover:bg-primary-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-data text-ink-400">{t.id}</span>
                    <div className="flex gap-1.5">
                      <Badge label={t.priority} className={priorityColors[t.priority]} />
                      <Badge label={t.status} className={statusColors[t.status]} />
                    </div>
                  </div>
                  <p className="text-[13.5px] font-medium text-ink-800 mb-1">{t.subject}</p>
                  <p className="text-xs text-ink-400">
                    {t.category} · {t.assignedAgentName || 'Unassigned'} · {formatDate(t.createdDate)}
                  </p>
                </Link>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default TicketList;
