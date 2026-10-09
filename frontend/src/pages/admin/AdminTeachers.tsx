import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import Avatar from '../../components/common/Avatar';
import { SkeletonRows } from '../../components/common/Skeleton';
import { adminService } from '../../api/adminService';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatINR } from '../../utils/formatters';
import type { Teacher } from '../../types';

export default function AdminTeachers() {
  useDocumentTitle('Teachers');
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const { data } = useAsync(() => adminService.getTeachers(), []);
  const rows = (data ?? []).filter((t) => !status || t.status === status);

  const setTeacherStatus = async (t: Teacher, s: Teacher['status']) => {
    await adminService.setStatus(t.id, s);
    toast(s === 'verified' ? `${t.name} marked as verified.` : `${t.name}'s verified badge removed.`, 'info');
  };

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Teachers" subtitle={data ? `${data.length} teacher accounts` : 'All teacher accounts'} />
      {!data ? <SkeletonRows /> : (
        <DataTable<Teacher>
          key={status}
          rows={rows}
          rowKey={(t) => t.id}
          searchText={(t) => `${t.name} ${t.subject} ${t.location}`}
          searchPlaceholder="Search teachers"
          toolbar={
            <select className="input input-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          }
          columns={[
            { key: 'teacher', header: 'Teacher', render: (t) => <span className="cell-person"><Avatar src={t.image} fallback={t.imageFallback} name={t.name} size={34} /><span>{t.name}<small className="d-block text-muted-qh">{t.location}</small></span></span>, sortValue: (t) => t.name },
            { key: 'subject', header: 'Subject', render: (t) => t.subject, sortValue: (t) => t.subject },
            { key: 'rating', header: 'Rating', render: (t) => (t.rating ? `★ ${t.rating.toFixed(1)}` : '—'), sortValue: (t) => t.rating },
            { key: 'students', header: 'Students', render: (t) => t.studentCount, sortValue: (t) => t.studentCount, hideOnMobile: true },
            { key: 'price', header: 'Price', render: (t) => formatINR(t.price), sortValue: (t) => t.price, hideOnMobile: true },
            { key: 'status', header: 'Status', render: (t) => <StatusPill status={t.status} /> },
            {
              key: 'actions', header: 'Actions', align: 'right',
              render: (t) => (
                <div className="cell-actions">
                  <Link to={`/t/${t.id}`} className="btn btn-ghost btn-sm">View</Link>
                  {t.status === 'verified' && <button className="btn btn-secondary btn-sm" onClick={() => setTeacherStatus(t, 'unverified')}>Unverify</button>}
                  {t.status === 'unverified' && <button className="btn btn-primary btn-sm" onClick={() => setTeacherStatus(t, 'verified')}>Verify</button>}
                  {t.status === 'pending' && <Link to="/admin/verification" className="btn btn-primary btn-sm">Review</Link>}
                </div>
              ),
            },
          ]}
        />
      )}
    </DashboardLayout>
  );
}
