import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import Avatar from '../../components/common/Avatar';
import { SkeletonRows } from '../../components/common/Skeleton';
import TeacherReviewModal from './TeacherReviewModal';
import { adminService } from '../../api/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateYear } from '../../utils/formatters';
import type { Teacher } from '../../types';

export default function AdminVerification() {
  useDocumentTitle('Teacher verification');
  const { toast } = useToast();
  const [status, setStatus] = useState('pending');
  const [selected, setSelected] = useState<Teacher | null>(null);
  const { data } = useAsync(() => adminService.getApplications(), []);
  const rows = (data ?? []).filter((t) => !status || t.status === status);

  const approve = async (t: Teacher) => { await adminService.approve(t.id); toast(`${t.name} is now verified and visible in search.`); };
  const reject = async (t: Teacher, reason: string) => { await adminService.reject(t.id, reason); toast(`${t.name}'s application was rejected.`, 'info'); };

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Teacher verification" subtitle="Check each applicant's proof before their profile goes live." />
      {!data ? <SkeletonRows /> : (
        <DataTable<Teacher>
          key={status}
          rows={rows}
          rowKey={(t) => t.id}
          searchText={(t) => `${t.name} ${t.subject} ${t.email}`}
          searchPlaceholder="Search applicants"
          emptyTitle={status === 'pending' ? 'No pending applications' : 'No applications'}
          emptyText="New applications appear here as soon as they're submitted."
          toolbar={
            <select className="input input-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="">All</option>
            </select>
          }
          columns={[
            { key: 'teacher', header: 'Teacher', render: (t) => <span className="cell-person"><Avatar src={t.image} fallback={t.imageFallback} name={t.name} size={34} />{t.name}</span>, sortValue: (t) => t.name },
            { key: 'subject', header: 'Subject', render: (t) => t.subject, sortValue: (t) => t.subject },
            { key: 'email', header: 'Email', render: (t) => <span className="text-muted-qh">{t.email}</span>, hideOnMobile: true },
            { key: 'submitted', header: 'Submitted', render: (t) => (t.submittedAt ? formatDateYear(t.submittedAt) : '—'), sortValue: (t) => t.submittedAt ?? '', hideOnMobile: true },
            { key: 'status', header: 'Status', render: (t) => <StatusPill status={t.status} /> },
            {
              key: 'actions', header: 'Actions', align: 'right',
              render: (t) => (
                <div className="cell-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(t)}>View</button>
                  {t.status === 'pending' && <>
                    <button className="btn btn-primary btn-sm" onClick={() => approve(t)}>Approve</button>
                    <button className="btn btn-danger-soft btn-sm" onClick={() => setSelected(t)}>Reject</button>
                  </>}
                </div>
              ),
            },
          ]}
        />
      )}
      <TeacherReviewModal teacher={selected} onClose={() => setSelected(null)} onApprove={approve} onReject={reject} />
    </DashboardLayout>
  );
}
