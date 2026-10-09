import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Rating from '../../components/common/Rating';
import Modal from '../../components/common/Modal';
import { SkeletonRows } from '../../components/common/Skeleton';
import { reviewService } from '../../api/reviewService';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateYear } from '../../utils/formatters';
import type { Review } from '../../types';

export default function AdminReviews() {
  useDocumentTitle('Reviews');
  const { toast } = useToast();
  const [rating, setRating] = useState('');
  const [removing, setRemoving] = useState<Review | null>(null);
  const { data } = useAsync(() => reviewService.getAll(), []);
  const { data: teachers } = useAsync(() => teacherService.getAllTeachers(), []);
  const teacherName = (id: string) => teachers?.find((t) => t.id === id)?.name ?? '—';
  const rows = (data ?? []).filter((r) => !rating || r.rating === Number(rating));

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Reviews" subtitle="Moderate reviews that break community guidelines." />
      {!data ? <SkeletonRows /> : (
        <DataTable<Review>
          key={rating}
          rows={rows}
          rowKey={(r) => r.id}
          searchText={(r) => `${r.learnerName} ${teacherName(r.teacherId)} ${r.comment}`}
          searchPlaceholder="Search reviews"
          toolbar={
            <select className="input input-sm" value={rating} onChange={(e) => setRating(e.target.value)} aria-label="Filter by rating">
              <option value="">All ratings</option>{[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
            </select>
          }
          columns={[
            { key: 'rating', header: 'Rating', render: (r) => <Rating value={r.rating} stars size={13} />, sortValue: (r) => r.rating },
            { key: 'comment', header: 'Review', render: (r) => <span className="cell-clamp">{r.comment}</span> },
            { key: 'teacher', header: 'Teacher', render: (r) => teacherName(r.teacherId), sortValue: (r) => teacherName(r.teacherId) },
            { key: 'learner', header: 'Learner', render: (r) => r.learnerName, hideOnMobile: true },
            { key: 'date', header: 'Date', render: (r) => formatDateYear(r.date), sortValue: (r) => r.date, hideOnMobile: true },
            { key: 'a', header: '', align: 'right', render: (r) => <button className="btn btn-danger-soft btn-sm" onClick={() => setRemoving(r)}>Remove</button> },
          ]}
        />
      )}
      <Modal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove this review?"
        size="sm"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setRemoving(null)}>Keep</button>
          <button className="btn btn-danger" onClick={async () => { await reviewService.remove(removing!.id); toast('Review removed.', 'info'); setRemoving(null); }}>Remove review</button>
        </>}
      >
        <p className="mb-0">“{removing?.comment}” — {removing?.learnerName}. The teacher's rating will be recalculated.</p>
      </Modal>
    </DashboardLayout>
  );
}
