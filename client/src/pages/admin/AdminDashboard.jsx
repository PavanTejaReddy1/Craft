import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import { Users, FolderOpen, FileText, DollarSign, Flag, CheckCircle2, XCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { formatCurrency, formatRelativeTime, formatDate } from '../../utils/format.js';

const StatCard = ({ icon: Icon, label, value, color = 'brand' }) => {
  const colorMap = { brand: 'bg-brand-50 text-brand-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600', yellow: 'bg-yellow-50 text-yellow-600', gray: 'bg-gray-100 text-gray-500' };
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}><Icon className="w-5 h-5" /></div>
      <div><p className="text-xs text-gray-500 mb-0.5">{label}</p><p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p></div>
    </div>
  );
};

export const AdminDashboard = () => {
  const { data, isLoading } = useQuery('admin-stats', () => adminApi.getStats().then((r) => r.data.stats));

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>;

  const stats = data || {};

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Shield className="w-6 h-6 text-brand-600" /> Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and moderation tools.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.users?.total} color="brand" />
          <StatCard icon={FolderOpen} label="Total Projects" value={stats.projects?.total} color="green" />
          <StatCard icon={FileText} label="Contracts" value={stats.contracts} color="yellow" />
          <StatCard icon={DollarSign} label="Est. Revenue" value={formatCurrency(stats.estimatedRevenue)} color="gray" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <StatCard icon={Users} label="Clients" value={stats.users?.clients} />
          <StatCard icon={Users} label="Developers" value={stats.users?.developers} />
          <StatCard icon={FolderOpen} label="Open Projects" value={stats.projects?.open} color="green" />
          <StatCard icon={FolderOpen} label="Active Projects" value={stats.projects?.active} color="yellow" />
        </div>

        {stats.pendingReports > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <Flag className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">{stats.pendingReports} pending report{stats.pendingReports !== 1 ? 's' : ''}</p>
              <p className="text-sm text-red-600">Review flagged content in the Reports section.</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

// ─── Admin Users Page ─────────────────────────────────────────────────────────
export const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-users', search, role],
    () => adminApi.getUsers({ search, role, limit: 30 }).then((r) => r.data)
  );

  const suspendMutation = useMutation(
    ({ id, reason }) => adminApi.suspendUser(id, reason),
    { onSuccess: () => { toast.success('User suspended'); queryClient.invalidateQueries('admin-users'); setSuspendModal(null); } }
  );

  const unsuspendMutation = useMutation(
    (id) => adminApi.unsuspendUser(id),
    { onSuccess: () => { toast.success('User unsuspended'); queryClient.invalidateQueries('admin-users'); } }
  );

  const verifyMutation = useMutation(
    (id) => adminApi.verifyUser(id),
    { onSuccess: () => { toast.success('User verified'); queryClient.invalidateQueries('admin-users'); } }
  );

  const users = data?.users || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="flex gap-3">
          <input className="input flex-1" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input w-36" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="client">Clients</option>
            <option value="developer">Developers</option>
          </select>
        </div>

        {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : (
          <div className="card divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u._id} className="flex items-center gap-4 p-4">
                <Avatar src={u.avatar} name={u.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />}
                    {u.isSuspended && <Badge color="red">Suspended</Badge>}
                  </div>
                  <p className="text-xs text-gray-500">{u.email} · {u.role}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!u.isVerified && u.role !== 'admin' && (
                    <Button size="sm" variant="secondary" onClick={() => verifyMutation.mutate(u._id)}>Verify</Button>
                  )}
                  {u.isSuspended ? (
                    <Button size="sm" variant="secondary" onClick={() => unsuspendMutation.mutate(u._id)}>Unsuspend</Button>
                  ) : u.role !== 'admin' ? (
                    <Button size="sm" variant="danger" onClick={() => setSuspendModal(u._id)}>Suspend</Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={!!suspendModal} onClose={() => setSuspendModal(null)} title="Suspend User" size="sm">
          <div className="p-6 space-y-4">
            <textarea className="input" rows={3} placeholder="Reason for suspension..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
            <div className="flex gap-3">
              <Button variant="danger" className="flex-1" loading={suspendMutation.isLoading}
                onClick={() => suspendMutation.mutate({ id: suspendModal, reason: suspendReason })}>
                Confirm Suspend
              </Button>
              <Button variant="secondary" onClick={() => setSuspendModal(null)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
};

// ─── Admin Reports Page ───────────────────────────────────────────────────────
export const AdminReportsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery('admin-reports', () => adminApi.getReports({ status: 'pending' }).then((r) => r.data));

  const resolveMutation = useMutation(
    ({ id, status, note }) => adminApi.resolveReport(id, { status, adminNote: note }),
    { onSuccess: () => { toast.success('Report updated'); queryClient.invalidateQueries('admin-reports'); } }
  );

  const reports = data?.reports || [];

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> :
        reports.length === 0 ? (
          <div className="card p-16 text-center text-gray-400">No pending reports. 🎉</div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge color="red">{r.entityType}</Badge>
                      <Badge color="yellow">{r.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{r.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">By {r.reporter?.name} · {formatRelativeTime(r.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => resolveMutation.mutate({ id: r._id, status: 'dismissed' })}>Dismiss</Button>
                    <Button size="sm" variant="danger" onClick={() => resolveMutation.mutate({ id: r._id, status: 'resolved' })}>Resolve</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </AppLayout>
  );
};
