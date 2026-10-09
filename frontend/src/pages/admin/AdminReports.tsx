import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import { CHART } from '../../components/dashboard/charts';
import { adminService } from '../../api/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatINR } from '../../utils/formatters';

export default function AdminReports() {
  useDocumentTitle('Reports');
  const { data } = useAsync(() => adminService.getReport(), []);
  const tip = { borderRadius: 10, border: '1px solid #E8E1D6', fontSize: 13 };
  return (
    <DashboardLayout role="admin">
      <PageHeader title="Reports" subtitle="Where learning happens on QuestHive." />
      {!data ? <SkeletonDashboard /> : (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="panel h-100">
              <h2 className="h-section">Bookings by category</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.byCategory} layout="vertical" margin={{ left: 40, right: 16 }}>
                  <CartesianGrid horizontal={false} stroke={CHART.grid} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} width={120} />
                  <Tooltip contentStyle={tip} cursor={{ fill: CHART.tint }} />
                  <Bar dataKey="bookings" fill={CHART.deep} radius={[0, 6, 6, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="panel h-100">
              <h2 className="h-section">Top teachers by earnings</h2>
              <ol className="rank-list">
                {data.topTeachers.map((t, i) => (
                  <li key={t.id}>
                    <span className="rank">{i + 1}</span>
                    <Avatar src={t.image} fallback={t.imageFallback} name={t.name} size={36} />
                    <div><strong>{t.name}</strong><span className="text-muted-qh small">{t.subject} · ★ {t.rating.toFixed(1)}</span></div>
                    <strong className="ms-auto">{formatINR(t.earnings)}</strong>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="panel">
              <h2 className="h-section">Review ratings</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.ratings}>
                  <CartesianGrid vertical={false} stroke={CHART.grid} />
                  <XAxis dataKey="rating" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={tip} cursor={{ fill: CHART.tint }} />
                  <Bar dataKey="count" fill={CHART.base} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="panel">
              <h2 className="h-section">Payment methods</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.methods}>
                  <CartesianGrid vertical={false} stroke={CHART.grid} />
                  <XAxis dataKey="method" tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.text, fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={tip} cursor={{ fill: CHART.tint }} />
                  <Bar dataKey="count" fill={CHART.peach} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
