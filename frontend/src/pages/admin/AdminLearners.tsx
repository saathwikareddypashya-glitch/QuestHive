import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Avatar from '../../components/common/Avatar';
import { SkeletonRows } from '../../components/common/Skeleton';
import { adminService } from '../../api/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateYear, formatINR } from '../../utils/formatters';

export default function AdminLearners() {
  useDocumentTitle('Learners');
  const { data } = useAsync(() => adminService.getLearners(), []);
  type Row = NonNullable<typeof data>[number];
  return (
    <DashboardLayout role="admin">
      <PageHeader title="Learners" subtitle={data ? `${data.length} learner accounts` : 'All learner accounts'} />
      {!data ? <SkeletonRows /> : (
        <DataTable<Row>
          rows={data}
          rowKey={(l) => l.id}
          searchText={(l) => `${l.name} ${l.email} ${l.location ?? ''}`}
          searchPlaceholder="Search learners"
          columns={[
            { key: 'name', header: 'Learner', render: (l) => <span className="cell-person"><Avatar src={l.avatar} name={l.name} size={34} /><span>{l.name}<small className="d-block text-muted-qh">{l.email}</small></span></span>, sortValue: (l) => l.name },
            { key: 'gender', header: 'Gender', render: (l) => l.gender, hideOnMobile: true },
            { key: 'joined', header: 'Joined', render: (l) => formatDateYear(l.joinedAt), sortValue: (l) => l.joinedAt, hideOnMobile: true },
            { key: 'bookings', header: 'Bookings', render: (l) => l.bookings, sortValue: (l) => l.bookings, align: 'center' },
            { key: 'spent', header: 'Spent', render: (l) => formatINR(l.spent), sortValue: (l) => l.spent, align: 'right' },
            { key: 'rating', header: 'Rating', render: (l) => `★ ${l.rating.toFixed(1)}`, sortValue: (l) => l.rating },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
