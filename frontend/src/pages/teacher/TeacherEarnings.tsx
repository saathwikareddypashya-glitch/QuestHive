import { CheckCircle2, Clock, IndianRupee, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import { SkeletonDashboard } from '../../components/common/Skeleton';
import { MoneyBarChart } from '../../components/dashboard/charts';
import { paymentService } from '../../api/paymentService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { earningsSummary } from '../../utils/earnings';
import { formatINR, formatShortDate } from '../../utils/formatters';
import type { Payment } from '../../types';

export default function TeacherEarnings() {
  useDocumentTitle('Earnings');
  const { user } = useAuth();
  const { data } = useAsync(() => paymentService.getTeacherTransactions(user!.id), [user?.id]);

  return (
    <DashboardLayout role="teacher">
      <PageHeader title="Earnings" subtitle="Payments for your classes. Pending amounts are released after each class is completed." />
      {!data ? <SkeletonDashboard /> : (() => {
        const e = earningsSummary(data);
        return (
          <>
            <div className="stat-grid">
              <StatCard icon={IndianRupee} label="Total earnings" value={formatINR(e.total)} />
              <StatCard icon={TrendingUp} label="This month" value={formatINR(e.month)} tone="peach" />
              <StatCard icon={Clock} label="Pending" value={formatINR(e.pending)} tone="warning" hint="For upcoming classes" />
              <StatCard icon={CheckCircle2} label="Completed" value={formatINR(e.completed)} tone="neutral" hint="Released to you" />
            </div>
            <div className="panel mt-4">
              <h2 className="h-section">Monthly earnings</h2>
              <MoneyBarChart data={e.series} height={280} />
            </div>
            <h2 className="h-section mt-5">Transactions</h2>
            <DataTable<Payment>
              rows={data}
              rowKey={(p) => p.id}
              searchText={(p) => `${p.learnerName} ${p.status}`}
              searchPlaceholder="Search by student or status"
              columns={[
                { key: 'date', header: 'Date', render: (p) => formatShortDate(p.date), sortValue: (p) => p.date },
                { key: 'student', header: 'Student', render: (p) => p.learnerName.split(' ')[0], sortValue: (p) => p.learnerName },
                { key: 'class', header: 'Class', render: (p) => p.subject, hideOnMobile: true },
                { key: 'amount', header: 'Amount', render: (p) => formatINR(p.amount), sortValue: (p) => p.amount, align: 'right' },
                { key: 'status', header: 'Status', render: (p) => <StatusPill status={p.status} /> },
              ]}
            />
          </>
        );
      })()}
    </DashboardLayout>
  );
}
