import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Clock, GraduationCap, IndianRupee, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Avatar from '../../components/common/Avatar';
import StatusPill from '../../components/common/StatusPill';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import { TrendAreaChart } from '../../components/dashboard/charts';
import { adminService, COMMISSION } from '../../api/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatINR, relativeTime } from '../../utils/formatters';

export default function AdminDashboard() {
  useDocumentTitle('Admin');
  const [params] = useSearchParams();
  const { data } = useAsync(async () => {
    const [stats, apps] = await Promise.all([adminService.getStats(), adminService.getApplications()]);
    return { stats, apps: apps.filter((a) => a.status === 'pending') };
  }, []);

  return (
    <DashboardLayout role="admin">
      {params.get('denied') && <div className="notice notice-warning mb-3">That page is for a different account type, so we brought you to your dashboard.</div>}
      {!data ? <SkeletonDashboard /> : (
        <>
          <div className="page-header">
            <div>
              <h1 className="h-page">Platform overview</h1>
              <p className="text-muted-qh mb-0">Last 6 months of activity on QuestHive.</p>
            </div>
            <Link to="/admin/verification" className="btn btn-primary">Review applications ({data.stats.pending})</Link>
          </div>
          <div className="stat-grid cols-5">
            <StatCard icon={Users} label="Total learners" value={data.stats.learners} />
            <StatCard icon={GraduationCap} label="Total teachers" value={data.stats.teachers} tone="neutral" />
            <StatCard icon={Clock} label="Pending verification" value={data.stats.pending} tone="warning" />
            <StatCard icon={BookOpen} label="Total bookings" value={data.stats.bookings} tone="peach" />
            <StatCard icon={IndianRupee} label="Platform revenue" value={formatINR(data.stats.revenue)} hint={`${COMMISSION * 100}% of ${formatINR(data.stats.gmv)}`} />
          </div>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <div className="panel h-100"><h2 className="h-section">Bookings per month</h2><TrendAreaChart data={data.stats.series} dataKey="bookings" label="Bookings" /></div>
            </div>
            <div className="col-lg-6">
              <div className="panel h-100"><h2 className="h-section">Platform revenue</h2><TrendAreaChart data={data.stats.series} dataKey="revenue" label="Revenue" money /></div>
            </div>
          </div>
          <div className="panel mt-4">
            <div className="panel-head">
              <h2 className="h-section mb-0">Waiting for verification</h2>
              <Link to="/admin/verification" className="btn btn-ghost btn-sm">Open queue</Link>
            </div>
            {data.apps.length === 0 ? <EmptyState compact icon={Clock} title="All caught up." text="No applications are waiting." /> : (
              <ul className="up-list">
                {data.apps.map((t) => (
                  <li key={t.id}>
                    <Avatar src={t.image} fallback={t.imageFallback} name={t.name} size={38} />
                    <div><strong>{t.name}</strong><span className="text-muted-qh small">{t.subject} · submitted {relativeTime(t.submittedAt + 'T09:00:00')}</span></div>
                    <span className="ms-auto"><StatusPill status="pending" /></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
