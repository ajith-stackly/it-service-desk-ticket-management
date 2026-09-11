import { useMemo } from 'react';
import Layout from '../../components/common/Layout';
import { useTickets } from '../../hooks/useTickets';
import { useUsers } from '../../hooks/useUsers';
import Loader from '../../components/common/Loader';
import { ErrorState } from '../../components/common/States';
import { Status, Priority } from '../../types/ticket';
import { statusColors, priorityColors } from '../../utils/permissions';
import Badge from '../../components/common/Badge';

const Reports = () => {
  const { tickets, loading, error, refetch } = useTickets();
  const { users } = useUsers();

  const byStatus = useMemo(() => {
    const statuses: Status[] = ['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Cancelled'];
    return statuses.map((s) => ({ status: s, count: tickets.filter((t) => t.status === s).length }));
  }, [tickets]);

  const byPriority = useMemo(() => {
    const priorities: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
    return priorities.map((p) => ({ priority: p, count: tickets.filter((t) => t.priority === p).length }));
  }, [tickets]);

  const byAgent = useMemo(() => {
    const agents = users.filter((u) => u.role === 'Support Agent');
    return agents.map((a) => ({
      agent: a.fullName,
      total: tickets.filter((t) => t.assignedAgent === a.id).length,
      resolved: tickets.filter((t) => t.assignedAgent === a.id && (t.status === 'Resolved' || t.status === 'Closed')).length,
    }));
  }, [tickets, users]);

  if (loading) return <Layout><Loader label="Loading reports..." /></Layout>;
  if (error) return <Layout><ErrorState message={error} onRetry={refetch} /></Layout>;

  const maxStatus = Math.max(1, ...byStatus.map((s) => s.count));

  return (
    <Layout>
      <h1 className="text-xl font-semibold text-ink-800 mb-1">Reports</h1>
      <p className="text-ink-400 text-sm mb-6">Ticket breakdown and agent performance.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-card border border-ink-100 p-6">
          <h3 className="font-semibold text-ink-800 mb-4">Tickets by Status</h3>
          <div className="space-y-3">
            {byStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <div className="w-28 shrink-0"><Badge label={s.status} className={statusColors[s.status]} /></div>
                <div className="flex-1 bg-ink-50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary-500 h-full rounded-full"
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-ink-600 w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-ink-100 p-6">
          <h3 className="font-semibold text-ink-800 mb-4">Tickets by Priority</h3>
          <div className="grid grid-cols-2 gap-4">
            {byPriority.map((p) => (
              <div key={p.priority} className="border border-ink-100 rounded-lg p-4 text-center">
                <Badge label={p.priority} className={priorityColors[p.priority]} />
                <p className="text-2xl font-bold text-ink-800 mt-2">{p.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card border border-ink-100 p-6">
        <h3 className="font-semibold text-ink-800 mb-4">Agent Performance</h3>
        {byAgent.length === 0 ? (
          <p className="text-sm text-ink-400">No support agents yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-ink-400 text-xs uppercase">
              <tr>
                <th className="text-left py-2">Agent</th>
                <th className="text-left py-2">Assigned</th>
                <th className="text-left py-2">Resolved/Closed</th>
                <th className="text-left py-2">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {byAgent.map((a) => (
                <tr key={a.agent}>
                  <td className="py-2.5 font-medium text-ink-700">{a.agent}</td>
                  <td className="py-2.5">{a.total}</td>
                  <td className="py-2.5">{a.resolved}</td>
                  <td className="py-2.5">{a.total ? Math.round((a.resolved / a.total) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
