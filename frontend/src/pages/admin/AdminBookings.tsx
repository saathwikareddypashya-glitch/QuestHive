import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import { SkeletonRows } from '../../components/common/Skeleton';
import { bookingService } from '../../api/bookingService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, formatINR, formatTime } from '../../utils/formatters';
import type { Booking } from '../../types';

export default function AdminBookings() {
  useDocumentTitle('Bookings');
  const [status, setStatus] = useState('');
  const { data } = useAsync(() => bookingService.getAll(), []);
  const rows = (data ?? []).filter((b) => !status || b.status === status);
  return (
    <DashboardLayout role="admin">
      <PageHeader title="Bookings" subtitle={data ? `${data.length} bookings across the platform` : 'All bookings'} />
      {!data ? <SkeletonRows /> : (
        <DataTable<Booking>
          key={status}
          rows={rows}
          rowKey={(b) => b.id}
          pageSize={10}
          searchText={(b) => `${b.id} ${b.learnerName} ${b.teacherName} ${b.subject}`}
          searchPlaceholder="Search by ID, learner, teacher or subject"
          toolbar={
            <select className="input input-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
            </select>
          }
          columns={[
            { key: 'id', header: 'ID', render: (b) => <span className="mono-ish">{b.id}</span>, hideOnMobile: true },
            { key: 'learner', header: 'Learner', render: (b) => b.learnerName, sortValue: (b) => b.learnerName },
            { key: 'teacher', header: 'Teacher', render: (b) => <>{b.teacherName}<small className="d-block text-muted-qh">{b.subject}</small></>, sortValue: (b) => b.teacherName },
            { key: 'when', header: 'When', render: (b) => `${formatDate(b.date)}, ${formatTime(b.time)}`, sortValue: (b) => b.date + b.time },
            { key: 'amount', header: 'Amount', render: (b) => (b.isFree ? 'Free' : formatINR(b.amount)), sortValue: (b) => b.amount, align: 'right' },
            { key: 'status', header: 'Status', render: (b) => <StatusPill status={b.status} /> },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
