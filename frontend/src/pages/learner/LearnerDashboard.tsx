import { Link, useSearchParams } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Heart, IndianRupee, CalendarClock, Star, ArrowRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import TeacherGrid from '../../components/teacher/TeacherGrid';
import SmartImage from '../../components/common/SmartImage';
import StatusPill from '../../components/common/StatusPill';
import { bookingService } from '../../api/bookingService';
import { teacherService } from '../../api/teacherService';
import { paymentService } from '../../api/paymentService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { dayOfISO, formatDate, formatINR, formatTime } from '../../utils/formatters';

export default function LearnerDashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [params] = useSearchParams();
  const { data, error, reload } = useAsync(async () => {
    const [bookings, teachers, payments] = await Promise.all([
      bookingService.getLearnerBookings(user!.id),
      teacherService.getAllTeachers(),
      paymentService.getLearnerPayments(user!.id),
    ]);
    return { bookings, teachers, payments };
  }, [user?.id]);

  return (
    <DashboardLayout role="learner">
      {params.get('denied') && <div className="notice notice-warning mb-3">That page is for a different account type, so we brought you to your dashboard.</div>}
      {error ? <ErrorState onRetry={reload} /> : !data ? <SkeletonDashboard /> : (() => {
        const upcoming = data.bookings.filter((b) => b.status === 'upcoming').sort(bookingService.sortAsc);
        const completed = data.bookings.filter((b) => b.status === 'completed');
        const toReview = completed.filter((b) => !b.reviewed);
        const spent = data.payments.filter((p) => p.status !== 'Refunded').reduce((s, p) => s + p.amount, 0);
        const next = upcoming[0];
        const nextTeacher = next && data.teachers.find((t) => t.id === next.teacherId);
        const bookedIds = new Set(data.bookings.map((b) => b.teacherId));
        const recommended = data.teachers
          .filter((t) => t.status === 'verified' && !bookedIds.has(t.id))
          .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
          .slice(0, 4);

        return (
          <>
            <div className="page-header">
              <div>
                <h1 className="h-page">Welcome back, {user!.name.split(' ')[0]}</h1>
                <p className="text-muted-qh mb-0">{upcoming.length ? `You have ${upcoming.length} upcoming ${upcoming.length === 1 ? 'class' : 'classes'}.` : 'No classes booked yet — find a teacher to get started.'}</p>
              </div>
              <Link to="/explore" className="btn btn-primary">Book a class</Link>
            </div>

            {next && nextTeacher ? (
              <div className="next-class">
                <SmartImage src={nextTeacher.image} fallback={nextTeacher.imageFallback} name={nextTeacher.name} alt="" className="nc-photo" />
                <div className="nc-main">
                  <span className="text-muted-qh small">Your next class</span>
                  <h2 className="nc-title">{next.subject} with {next.teacherName}</h2>
                  <p className="nc-meta">{dayOfISO(next.date)}, {formatDate(next.date, { day: 'numeric', month: 'short' })} · {formatTime(next.time)} · {next.isFree ? 'Free' : formatINR(next.amount)}</p>
                  <StatusPill status={next.isFree ? 'free' : 'paid'} label={next.isFree ? 'Free class' : '✓ Paid'} />
                </div>
                <Link to="/learner/bookings?tab=upcoming" className="btn btn-primary">View class</Link>
              </div>
            ) : (
              <EmptyState icon={CalendarClock} title="Your learning journey starts here." text="Book your first class — most teachers offer the first one free." action={<Link to="/explore" className="btn btn-primary">Explore teachers</Link>} />
            )}

            <div className="stat-grid">
              <StatCard icon={CalendarCheck} label="Upcoming classes" value={upcoming.length} />
              <StatCard icon={CheckCircle2} label="Completed classes" value={completed.length} tone="neutral" />
              <StatCard icon={Heart} label="Favorite teachers" value={favorites.length} tone="peach" />
              <StatCard icon={IndianRupee} label="Total spent" value={formatINR(spent)} tone="neutral" />
            </div>

            {toReview.length > 0 && (
              <Link to="/learner/reviews" className="review-nudge">
                <Star size={18} />
                <span>You have {toReview.length} {toReview.length === 1 ? 'class' : 'classes'} waiting for a review. It takes 30 seconds and helps other learners.</span>
                <ArrowRight size={16} />
              </Link>
            )}

            <div className="section-head mt-5">
              <div>
                <h2 className="h-section">Recommended for you</h2>
                <p className="text-muted-qh small mb-0">Top-rated teachers you haven't tried yet.</p>
              </div>
              <Link to="/explore" className="btn btn-ghost btn-sm">See more</Link>
            </div>
            <TeacherGrid teachers={recommended} />
          </>
        );
      })()}
    </DashboardLayout>
  );
}
