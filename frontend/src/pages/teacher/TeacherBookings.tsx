import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import Avatar from '../../components/common/Avatar';
import { SkeletonRows } from '../../components/common/Skeleton';
import { bookingService } from '../../api/bookingService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { adminService } from '../../api/adminService';
import { dayOfISO, formatDate, formatINR, isPastSlot, timeRange } from '../../utils/formatters';
import type { Booking, BookingStatus } from '../../types';

export default function TeacherBookings() {
  useDocumentTitle('Bookings');
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<BookingStatus>('upcoming');
  const { data } = useAsync(() => bookingService.getTeacherBookings(user!.id), [user?.id]);
  const { data: learnerList } = useAsync(() => adminService.getLearners(), []);
  const learners = learnerList ?? [];
  const rows = (data ?? []).filter((b) => b.status === tab).sort(tab === 'upcoming' ? bookingService.sortAsc : (a, b) => bookingService.sortAsc(b, a));
  const count = (s: BookingStatus) => (data ?? []).filter((b) => b.status === s).length;

  const complete = async (b: Booking) => {
    await bookingService.markCompleted(b.id);
    toast(`Marked ${b.learnerName.split(' ')[0]}'s class as completed.`);
  };

  return (
    <DashboardLayout role="teacher">
      <PageHeader title="Bookings" subtitle="Your classes with learners." />
      <div className="tabs" role="tablist">
        {(['upcoming', 'completed', 'cancelled'] as BookingStatus[]).map((s) => (
          <button key={s} role="tab" aria-selected={tab === s} className={tab === s ? 'is-on' : ''} onClick={() => setTab(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} <span className="tab-count">{count(s)}</span>
          </button>
        ))}
      </div>
      {!data ? <SkeletonRows /> : (
        <DataTable<Booking>
          key={tab}
          rows={rows}
          rowKey={(b) => b.id}
          searchText={(b) => `${b.learnerName} ${b.id}`}
          searchPlaceholder="Search by student"
          emptyTitle={`No ${tab} classes`}
          columns={[
            { key: 'student', header: 'Student', render: (b) => <span className="cell-person"><Avatar src={learners.find((l) => l.id === b.learnerId)?.avatar} name={b.learnerName} size={32} />{b.learnerName}</span>, sortValue: (b) => b.learnerName },
            { key: 'date', header: 'Date', render: (b) => `${dayOfISO(b.date).slice(0, 3)}, ${formatDate(b.date, { day: 'numeric', month: 'short' })}`, sortValue: (b) => b.date + b.time },
            { key: 'time', header: 'Time', render: (b) => timeRange(b.time, b.durationMins), hideOnMobile: true },
            { key: 'amount', header: 'Amount', render: (b) => (b.isFree ? <StatusPill status="free" label="Free trial" /> : formatINR(b.amount)), sortValue: (b) => b.amount, align: 'right' },
            { key: 'status', header: 'Status', render: (b) => <StatusPill status={b.status} /> },
            {
              key: 'action', header: '', align: 'right',
              render: (b) => b.status === 'upcoming'
                ? <button className="btn btn-secondary btn-sm" onClick={() => complete(b)} title={isPastSlot(b.date, b.time) ? '' : 'Demo: mark as done early'}>Mark completed</button>
                : null,
            },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
