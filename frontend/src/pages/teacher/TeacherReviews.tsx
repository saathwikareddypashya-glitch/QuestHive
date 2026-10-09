import { MessageSquareText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import ReviewCard from '../../components/teacher/ReviewCard';
import Rating from '../../components/common/Rating';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonRows } from '../../components/common/Skeleton';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function TeacherReviews() {
  useDocumentTitle('Reviews');
  const { user } = useAuth();
  const { data } = useAsync(async () => {
    const [teacher, reviews] = await Promise.all([teacherService.getTeacherById(user!.id), teacherService.getReviews(user!.id)]);
    return { teacher, reviews };
  }, [user?.id]);

  return (
    <DashboardLayout role="teacher">
      <PageHeader title="Reviews" subtitle="What your learners say about your classes." />
      {!data ? <SkeletonRows /> : (
        <>
          <div className="panel review-summary">
            <div className="rs-score">
              <strong>{data.teacher.rating ? data.teacher.rating.toFixed(1) : '—'}</strong>
              <Rating value={data.teacher.rating} stars size={16} />
              <span className="text-muted-qh small">{data.teacher.reviewCount} reviews in total</span>
            </div>
            <div className="rs-bars">
              {[5, 4, 3, 2, 1].map((r) => {
                const n = data.reviews.filter((x) => x.rating === r).length;
                return (
                  <div key={r} className="rs-bar">
                    <span>{r}★</span>
                    <span className="bar"><span style={{ width: `${data.reviews.length ? (n / data.reviews.length) * 100 : 0}%` }} /></span>
                    <span className="text-muted-qh">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {data.reviews.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No reviews yet." text="Reviews appear here after learners finish a class with you." />
          ) : (
            <div className="review-list mt-4">{data.reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
