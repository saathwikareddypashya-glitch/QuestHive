import { Link } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import ReviewForm from '../../components/review/ReviewForm';
import ReviewCard from '../../components/teacher/ReviewCard';
import EmptyState from '../../components/common/EmptyState';
import SmartImage from '../../components/common/SmartImage';
import { SkeletonRows } from '../../components/common/Skeleton';
import { bookingService } from '../../api/bookingService';
import { reviewService } from '../../api/reviewService';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { dayOfISO, formatDate } from '../../utils/formatters';

export default function LearnerReviews() {
  useDocumentTitle('Reviews');
  const { user } = useAuth();
  const { toast } = useToast();
  const { data } = useAsync(async () => {
    const [bookings, reviews, teachers] = await Promise.all([
      bookingService.getLearnerBookings(user!.id), reviewService.getLearnerReviews(user!.id), teacherService.getAllTeachers(),
    ]);
    return { bookings, reviews, teachers };
  }, [user?.id]);

  const pending = data?.bookings.filter((b) => b.status === 'completed' && !b.reviewed) ?? [];

  return (
    <DashboardLayout role="learner">
      <PageHeader title="Reviews" subtitle="Rate your completed classes and see what you've shared." />
      {!data ? <SkeletonRows rows={3} /> : (
        <>
          <h2 className="h-section">Waiting for your review</h2>
          {pending.length === 0 ? (
            <EmptyState compact icon={MessageSquareText} title="Your completed classes will appear here." text="Once a class is finished, you can rate it from this page." action={<Link to="/learner/bookings?tab=upcoming" className="btn btn-secondary">View upcoming classes</Link>} />
          ) : (
            <div className="pending-reviews">
              {pending.map((b) => {
                const t = data.teachers.find((x) => x.id === b.teacherId);
                return (
                  <div key={b.id} className="panel pending-review">
                    <div className="pr-head">
                      <SmartImage src={t?.image} fallback={t?.imageFallback} name={b.teacherName} alt="" />
                      <div>
                        <strong>{b.subject} with {b.teacherName}</strong>
                        <span className="text-muted-qh small">{dayOfISO(b.date)}, {formatDate(b.date, { day: 'numeric', month: 'long' })}</span>
                      </div>
                    </div>
                    <ReviewForm compact teacherName={b.teacherName} onSubmit={async (rating, comment) => {
                      await reviewService.submit(b.id, rating, comment, user!);
                      toast(`Review submitted for ${b.teacherName}.`);
                    }} />
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="h-section mt-5">Your reviews</h2>
          {data.reviews.length === 0 ? (
            <p className="text-muted-qh">You haven't written any reviews yet.</p>
          ) : (
            <div className="review-list">
              {data.reviews.map((r) => <ReviewCard key={r.id} review={r} teacherName={data.teachers.find((t) => t.id === r.teacherId)?.name} />)}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
