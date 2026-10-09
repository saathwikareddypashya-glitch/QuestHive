import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import StatCard from '../../components/common/StatCard';
import { SkeletonRows } from '../../components/common/Skeleton';
import { CreditCard, IndianRupee, RotateCcw } from 'lucide-react';
import { paymentService } from '../../api/paymentService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateYear, formatINR } from '../../utils/formatters';
import type { Payment } from '../../types';

export default function LearnerPayments() {
  useDocumentTitle('Payments');
  const { user } = useAuth();
  const { data } = useAsync(() => paymentService.getLearnerPayments(user!.id), [user?.id]);
  const paid = data?.filter((p) => p.status !== 'Refunded') ?? [];
  const refunded = data?.filter((p) => p.status === 'Refunded') ?? [];

  return (
    <DashboardLayout role="learner">
      <PageHeader title="Payments" subtitle="Receipts for every class you've paid for." />
      <div className="stat-grid cols-3">
        <StatCard icon={IndianRupee} label="Total spent" value={formatINR(paid.reduce((s, p) => s + p.amount, 0))} />
        <StatCard icon={CreditCard} label="Payments" value={paid.length} tone="neutral" />
        <StatCard icon={RotateCcw} label="Refunded" value={formatINR(refunded.reduce((s, p) => s + p.amount, 0))} tone="peach" />
      </div>
      {!data ? <SkeletonRows /> : (
        <DataTable<Payment>
          rows={data}
          rowKey={(p) => p.id}
          searchText={(p) => `${p.teacherName} ${p.subject} ${p.method}`}
          searchPlaceholder="Search payments"
          emptyTitle="No payments yet"
          emptyText="Free first classes don't show up here."
          columns={[
            { key: 'date', header: 'Date', render: (p) => formatDateYear(p.date), sortValue: (p) => p.date },
            { key: 'class', header: 'Class', render: (p) => <><strong>{p.subject}</strong><div className="text-muted-qh small">with {p.teacherName}</div></> },
            { key: 'method', header: 'Method', render: (p) => p.method, hideOnMobile: true },
            { key: 'amount', header: 'Amount', render: (p) => formatINR(p.amount), sortValue: (p) => p.amount, align: 'right' },
            { key: 'status', header: 'Status', render: (p) => <StatusPill status={p.status === 'Refunded' ? 'refunded' : 'paid'} label={p.status === 'Refunded' ? 'Refunded' : 'Paid'} /> },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
