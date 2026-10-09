import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, IndianRupee, Star, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import { MoneyBarChart } from '../../components/dashboard/charts';
import Avatar from '../../components/common/Avatar';
import { teacherService } from '../../api/teacherService';
import { bookingService } from '../../api/bookingService';
import { paymentService } from '../../api/paymentService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { dayOfISO, formatDate, formatINR, timeRange } from '../../utils/formatters';
import { earningsSummary } from '../../utils/earnings';
import { adminService } from '../../api/adminService';

export default function TeacherDashboard() {
  useDocumentTitle('Teacher dashboard');
  const { user } = useAuth();
  const [params] = useSearchParams();
  const { data, error, reload } = useAsync(async () => {
    const [teacher, bookings, payments, learners] = await Promise.all([
      teacherService.getTeacherById(user!.id), bookingService.getTeacherBookings(user!.id), paymentService.getTeacherTransactions(user!.id),
      adminService.getLearners(),
    ]);
    return { teacher, bookings, payments, learners };
  }, [user?.id]);

  return (
    <DashboardLayout role="teacher">
      {params.get('denied') && <div className="notice notice-warning mb-3">That page is for a different account type, so we brought you to your dashboard.</div>}
      {error ? <ErrorState onRetry={reload} /> : !data ? <SkeletonDashboard /> : (() => {
        const { teacher, bookings, payments, learners } = data;
        const upcoming = bookings.filter((b) => b.status === 'upcoming').sort(bookingService.sortAsc);
        const e = earningsSummary(payments);
        return (
          <>
            <div className="page-header">
              <div>
                <h1 className="h-page">Hello, {teacher.name}</h1>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {teacher.verified ? <VerifiedBadge size="md" /> : <span className="pill pill-warning">Verification {teacher.status}</span>}
                  <span className="text-muted-qh">{teacher.subject} · {formatINR(teacher.price)} per class</span>
                </div>
              </div>
              <div className="page-header-actions">
                <Link to={`/t/${teacher.id}`} className="btn btn-secondary">View public profile</Link>
                <Link to="/teacher/availability" className="btn btn-primary">Edit availability</Link>
              </div>
            </div>

            <div className="stat-grid cols-5">
              <StatCard icon={Users} label="Total students" value={teacher.studentCount} />
              <StatCard icon={CalendarCheck} label="Upcoming classes" value={upcoming.length} tone="peach" />
              <StatCard icon={CheckCircle2} label="Completed classes" value={teacher.completedClasses.toLocaleString('en-IN')} tone="neutral" />
              <StatCard icon={Star} label="Average rating" value={teacher.rating ? teacher.rating.toFixed(1) : '—'} hint={`${teacher.reviewCount} reviews`} tone="warning" />
              <StatCard icon={IndianRupee} label="Total earnings" value={formatINR(e.total)} hint={`${formatINR(e.pending)} pending`} />
            </div>

            <div className="row g-4 mt-1">
              <div className="col-xl-7">
                <div className="panel h-100">
                  <div className="panel-head">
                    <h2 className="h-section mb-0">Monthly earnings</h2>
                    <Link to="/teacher/earnings" className="btn btn-ghost btn-sm">Details</Link>
                  </div>
                  <MoneyBarChart data={e.series} />
                </div>
              </div>
              <div className="col-xl-5">
                <div className="panel h-100">
                  <div className="panel-head">
                    <h2 className="h-section mb-0">Upcoming classes</h2>
                    <Link to="/teacher/bookings" className="btn btn-ghost btn-sm">All bookings</Link>
                  </div>
                  {upcoming.length === 0 ? (
                    <EmptyState compact icon={CalendarCheck} title="No upcoming classes." text="Open more hours to get booked." />
                  ) : (
                    <ul className="up-list">
                      {upcoming.slice(0, 5).map((b) => {
                        const l = learners.find((x) => x.id === b.learnerId);
                        return (
                          <li key={b.id}>
                            <Avatar src={l?.avatar} name={b.learnerName} size={38} />
                            <div>
                              <strong>{b.learnerName}</strong>
                              <span className="text-muted-qh small">{dayOfISO(b.date).slice(0, 3)}, {formatDate(b.date, { day: 'numeric', month: 'short' })} · {timeRange(b.time, b.durationMins)}</span>
                            </div>
                            <span className="ms-auto small">{b.isFree ? 'Free' : formatINR(b.amount)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </DashboardLayout>
  );
}
