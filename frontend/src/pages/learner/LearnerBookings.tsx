import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarClock, History, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import BookingRow from '../../components/dashboard/BookingRow';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonRows } from '../../components/common/Skeleton';
import Modal from '../../components/common/Modal';
import ReviewForm from '../../components/review/ReviewForm';
import { bookingService } from '../../api/bookingService';
import { teacherService } from '../../api/teacherService';
import { reviewService } from '../../api/reviewService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Booking } from '../../types';
import { dayOfISO, formatTime } from '../../utils/formatters';

type Tab = 'upcoming' | 'past' | 'cancelled';

export default function LearnerBookings() {
  useDocumentTitle('My classes');
  const { user } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'upcoming';
  const [reviewFor, setReviewFor] = useState<Booking | null>(null);
  const [cancelFor, setCancelFor] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, error, reload } = useAsync(async () => {
    const [bookings, teachers] = await Promise.all([bookingService.getLearnerBookings(user!.id), teacherService.getAllTeachers()]);
    return { bookings, teachers };
  }, [user?.id]);

  const list = data
    ? data.bookings
        .filter((b) => (tab === 'upcoming' ? b.status === 'upcoming' : tab === 'past' ? b.status === 'completed' : b.status === 'cancelled'))
        .sort(tab === 'upcoming' ? bookingService.sortAsc : (a, b) => bookingService.sortAsc(b, a))
    : null;
  const counts = data ? {
    upcoming: data.bookings.filter((b) => b.status === 'upcoming').length,
    past: data.bookings.filter((b) => b.status === 'completed').length,
    cancelled: data.bookings.filter((b) => b.status === 'cancelled').length,
  } : { upcoming: 0, past: 0, cancelled: 0 };

  const confirmCancel = async () => {
    if (!cancelFor) return;
    setBusy(true);
    try { await bookingService.cancel(cancelFor.id); toast('Class cancelled. Your refund is on its way.', 'info'); setCancelFor(null); }
    catch (e) { toast((e as Error).message, 'error'); }
    finally { setBusy(false); }
  };

  return (
    <DashboardLayout role="learner">
      <PageHeader title="My classes" subtitle="Everything you've booked, in one place." actions={<Link to="/explore" className="btn btn-primary">Book a class</Link>} />
      <div className="tabs" role="tablist">
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'is-on' : ''} onClick={() => setParams({ tab: t })}>
            {t === 'upcoming' ? 'Upcoming' : t === 'past' ? 'Past' : 'Cancelled'} <span className="tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {error ? <ErrorState onRetry={reload} /> : !list ? <SkeletonRows /> : list.length === 0 ? (
        tab === 'upcoming'
          ? <EmptyState icon={CalendarClock} title="Your learning journey starts here." text="You have no upcoming classes." action={<Link to="/explore" className="btn btn-primary">Explore teachers</Link>} />
          : tab === 'past'
            ? <EmptyState icon={History} title="Your completed classes will appear here." text="After each class you can leave a review for your teacher." />
            : <EmptyState icon={XCircle} title="No cancelled classes." text="Classes you cancel will show up here with their refund status." />
      ) : (
        <div className="booking-list">
          {list.map((b) => {
            const t = data!.teachers.find((x) => x.id === b.teacherId);
            return (
              <BookingRow
                key={b.id}
                booking={b}
                title={b.teacherName}
                image={t?.image}
                fallback={t?.imageFallback}
                actions={
                  <>
                    <Link to={`/t/${b.teacherId}`} className="btn btn-ghost btn-sm">View teacher</Link>
                    {b.status === 'upcoming' && <button className="btn btn-secondary btn-sm" onClick={() => setCancelFor(b)}>Cancel</button>}
                    {b.status === 'completed' && !b.reviewed && <button className="btn btn-primary btn-sm" onClick={() => setReviewFor(b)}>Leave review</button>}
                    {b.status === 'completed' && b.reviewed && <span className="pill pill-success">Reviewed</span>}
                    {b.status !== 'upcoming' && <Link to={`/booking/${b.teacherId}`} className="btn btn-secondary btn-sm">Book again</Link>}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      <Modal open={!!reviewFor} onClose={() => setReviewFor(null)} title={reviewFor ? `Review your ${reviewFor.subject} class` : ''}>
        {reviewFor && (
          <ReviewForm
            teacherName={reviewFor.teacherName}
            onSubmit={async (rating, comment) => {
              await reviewService.submit(reviewFor.id, rating, comment, user!);
              toast('Thanks! Your review is live on the teacher’s profile.');
              setReviewFor(null);
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!cancelFor}
        onClose={() => setCancelFor(null)}
        title="Cancel this class?"
        size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setCancelFor(null)}>Keep class</button>
          <button className="btn btn-danger" onClick={confirmCancel} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel class'}</button>
        </>}
      >
        {cancelFor && <p className="mb-0">Your {cancelFor.subject} class with {cancelFor.teacherName} on {dayOfISO(cancelFor.date)} at {formatTime(cancelFor.time)} will be cancelled{cancelFor.amount ? ' and the payment refunded' : ''}.</p>}
      </Modal>
    </DashboardLayout>
  );
}
