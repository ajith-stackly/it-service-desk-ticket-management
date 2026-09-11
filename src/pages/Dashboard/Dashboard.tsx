import { useMemo } from 'react';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/Dashboard/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../hooks/useTickets';
import Loader from '../../components/common/Loader';
import { ErrorState } from '../../components/common/States';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import { statusColors, priorityColors } from '../../utils/permissions';
import { formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const { tickets, loading, error, refetch } = useTickets();

  const scoped = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Admin') return tickets;
    if (user.role === 'Support Agent') return tickets.filter((t) => t.assignedAgent === user.id);
    return tickets.filter((t) => t.createdBy === user.id);
  }, [tickets, user]);

  const count = (fn: (t: (typeof tickets)[0]) => boolean) => scoped.filter(fn).length;

  if (loading) return <Layout><Loader label="Loading dashboard..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} onRetry={refetch} /></Layout>;

  const recent = [...scoped]
    .sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime())
    .slice(0, 6);

  return (
    <Layout>
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-ink-800">
          {user?.role === 'Admin' && 'Admin dashboard'}
          {user?.role === 'Support Agent' && 'My queue'}
          {user?.role === 'Employee' && 'My dashboard'}
        </h1>
        <p className="text-ink-400 text-[13.5px] mt-1">Overview of ticket activity and statistics.</p>
      </div>

      {user?.role === 'Admin' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <StatCard label="Total" value={scoped.length} icon="◫" accent="neutral" />
          <StatCard label="Open" value={count((t) => t.status === 'Open')} icon="◧" accent="neutral" />
          <StatCard label="Assigned" value={count((t) => t.status === 'Assigned')} icon="◍" accent="primary" />
          <StatCard label="In progress" value={count((t) => t.status === 'In Progress')} icon="◐" accent="signal" />
          <StatCard label="Pending" value={count((t) => t.status === 'Pending')} icon="◑" accent="signal" />
          <StatCard label="Resolved" value={count((t) => t.status === 'Resolved')} icon="◒" accent="primary" />
          <StatCard label="Closed" value={count((t) => t.status === 'Closed')} icon="●" accent="neutral" />
          <StatCard label="Critical" value={count((t) => t.priority === 'Critical')} icon="▲" accent="critical" />
          <StatCard
            label="Unassigned"
            value={count((t) => !t.assignedAgent && t.status !== 'Cancelled')}
            icon="◌"
            accent="critical"
          />
        </div>
      )}

      {user?.role === 'Support Agent' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard label="Assigned to me" value={scoped.length} icon="◫" accent="neutral" />
          <StatCard label="New" value={count((t) => t.status === 'Assigned')} icon="◍" accent="primary" />
          <StatCard label="In progress" value={count((t) => t.status === 'In Progress')} icon="◐" accent="signal" />
          <StatCard label="Pending" value={count((t) => t.status === 'Pending')} icon="◑" accent="signal" />
          <StatCard label="Resolved" value={count((t) => t.status === 'Resolved')} icon="◒" accent="primary" />
          <StatCard label="High priority" value={count((t) => t.priority === 'High' || t.priority === 'Critical')} icon="▲" accent="critical" />
        </div>
      )}

      {user?.role === 'Employee' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <StatCard label="Total" value={scoped.length} icon="◫" accent="neutral" />
          <StatCard label="Open" value={count((t) => t.status === 'Open')} icon="◧" accent="neutral" />
          <StatCard label="In progress" value={count((t) => t.status === 'In Progress' || t.status === 'Assigned' || t.status === 'Pending')} icon="◐" accent="signal" />
          <StatCard label="Resolved" value={count((t) => t.status === 'Resolved')} icon="◒" accent="primary" />
          <StatCard label="Closed" value={count((t) => t.status === 'Closed')} icon="●" accent="neutral" />
        </div>
      )}

      <div className="bg-white rounded-lg border border-ink-100 shadow-card">
        <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-800 text-[14.5px]">Recent activity</h2>
          <Link to="/tickets" className="text-[13px] text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-ink-400 text-sm px-5 py-10 text-center">No tickets yet.</p>
        ) : (
          <div className="divide-y divide-ink-100">
            {recent.map((t) => (
              <Link
                key={t.id}
                to={`/tickets/${t.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-ink-50/60 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-ink-800 truncate">
                    <span className="text-ink-400 font-data font-normal mr-2.5 text-xs">{t.id}</span>
                    {t.subject}
                  </p>
                  <p className="text-xs text-ink-400 mt-1">Updated {formatDate(t.updatedDate)}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Badge label={t.priority} className={priorityColors[t.priority]} />
                  <Badge label={t.status} className={statusColors[t.status]} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
