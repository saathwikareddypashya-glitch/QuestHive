import { useState } from 'react';
import { CheckCircle2, Clock, IndianRupee, RotateCcw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import StatCard from '../../components/common/StatCard';
import { SkeletonRows } from '../../components/common/Skeleton';
import { paymentService } from '../../api/paymentService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateYear, formatINR } from '../../utils/formatters';
import type { Payment } from '../../types';

export default function AdminPayments() {
  useDocumentTitle('Payments');
  const [status, setStatus] = useState('');
  const { data } = useAsync(() => paymentService.getAll(), []);
  const sum = (s: string) => (data ?? []).filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);
  const rows = (data ?? []).filter((p) => !status || p.status === status);
  return (
    <DashboardLayout role="admin">
      <PageHeader title="Payments" subtitle="Every simulated transaction on the platform." />
      <div className="stat-grid">
        <StatCard icon={IndianRupee} label="Gross volume" value={formatINR(sum('Completed') + sum('Pending'))} />
        <StatCard icon={CheckCircle2} label="Completed" value={formatINR(sum('Completed'))} tone="neutral" />
        <StatCard icon={Clock} label="Pending" value={formatINR(sum('Pending'))} tone="warning" />
        <StatCard icon={RotateCcw} label="Refunded" value={formatINR(sum('Refunded'))} tone="peach" />
      </div>
      {!data ? <SkeletonRows /> : (
        <DataTable<Payment>
          key={status}
          rows={rows}
          rowKey={(p) => p.id}
          pageSize={10}
          searchText={(p) => `${p.id} ${p.learnerName} ${p.teacherName} ${p.method}`}
          searchPlaceholder="Search payments"
          toolbar={
            <select className="input input-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option><option>Completed</option><option>Pending</option><option>Refunded</option>
            </select>
          }
          columns={[
            { key: 'date', header: 'Date', render: (p) => formatDateYear(p.date), sortValue: (p) => p.date },
            { key: 'learner', header: 'Learner', render: (p) => p.learnerName, sortValue: (p) => p.learnerName },
            { key: 'teacher', header: 'Teacher', render: (p) => `${p.teacherName} · ${p.subject}`, hideOnMobile: true },
            { key: 'method', header: 'Method', render: (p) => p.method, hideOnMobile: true },
            { key: 'amount', header: 'Amount', render: (p) => formatINR(p.amount), sortValue: (p) => p.amount, align: 'right' },
            { key: 'status', header: 'Status', render: (p) => <StatusPill status={p.status} /> },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
