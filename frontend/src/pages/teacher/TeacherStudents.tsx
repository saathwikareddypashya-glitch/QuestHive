import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Avatar from '../../components/common/Avatar';
import { SkeletonRows } from '../../components/common/Skeleton';
import { bookingService } from '../../api/bookingService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminService } from '../../api/adminService';
import { formatDateYear, formatINR } from '../../utils/formatters';

interface StudentRow { id: string; name: string; avatar?: string; classes: number; upcoming: number; last: string; paid: number; rating?: number }

export default function TeacherStudents() {
  useDocumentTitle('Students');
  const { user } = useAuth();
  const { data } = useAsync(async () => {
    const [bookings, learners] = await Promise.all([bookingService.getTeacherBookings(user!.id), adminService.getLearners()]);
    const map = new Map<string, StudentRow>();
    bookings.filter((b) => b.status !== 'cancelled').forEach((b) => {
      const l = learners.find((x) => x.id === b.learnerId);
      const row = map.get(b.learnerId) ?? { id: b.learnerId, name: b.learnerName, avatar: l?.avatar, classes: 0, upcoming: 0, last: '', paid: 0, rating: l?.rating };
      if (b.status === 'completed') { row.classes += 1; if (b.date > row.last) row.last = b.date; }
      if (b.status === 'upcoming') row.upcoming += 1;
      row.paid += b.amount;
      map.set(b.learnerId, row);
    });
    return Array.from(map.values()).sort((a, b) => b.classes - a.classes);
  }, [user?.id]);

  return (
    <DashboardLayout role="teacher">
      <PageHeader title="Students" subtitle={data ? `${data.length} learners have booked you on QuestHive.` : 'Learners who have booked you.'} />
      {!data ? <SkeletonRows /> : (
        <DataTable<StudentRow>
          rows={data}
          rowKey={(r) => r.id}
          searchText={(r) => r.name}
          searchPlaceholder="Search students"
          emptyTitle="No students yet"
          columns={[
            { key: 'name', header: 'Student', render: (r) => <span className="cell-person"><Avatar src={r.avatar} name={r.name} size={32} />{r.name}</span>, sortValue: (r) => r.name },
            { key: 'classes', header: 'Classes done', render: (r) => r.classes, sortValue: (r) => r.classes, align: 'center' },
            { key: 'upcoming', header: 'Upcoming', render: (r) => r.upcoming || '—', sortValue: (r) => r.upcoming, align: 'center' },
            { key: 'last', header: 'Last class', render: (r) => (r.last ? formatDateYear(r.last) : '—'), sortValue: (r) => r.last, hideOnMobile: true },
            { key: 'paid', header: 'Total paid', render: (r) => formatINR(r.paid), sortValue: (r) => r.paid, align: 'right' },
            { key: 'rating', header: 'Learner rating', render: (r) => (r.rating ? `★ ${r.rating.toFixed(1)}` : '—'), hideOnMobile: true },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
