import { Check, Clock, FileText, ShieldCheck, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { SkeletonRows } from '../../components/common/Skeleton';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDateYear } from '../../utils/formatters';

export default function TeacherVerification() {
  useDocumentTitle('Verification');
  const { user } = useAuth();
  const { data: t } = useAsync(() => teacherService.getTeacherById(user!.id), [user?.id]);

  const steps = t ? [
    { label: 'Application submitted', date: t.submittedAt, done: true },
    { label: 'Documents reviewed', date: t.verifiedAt, done: t.status === 'verified' || t.status === 'rejected' },
    { label: t.status === 'rejected' ? 'Application rejected' : 'Profile verified and live', date: t.verifiedAt, done: t.status === 'verified', failed: t.status === 'rejected' },
  ] : [];

  return (
    <DashboardLayout role="teacher">
      <PageHeader title="Verification" subtitle="Verified teachers get a badge and rank higher in search." />
      {!t ? <SkeletonRows rows={3} /> : (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className={`panel verify-status status-${t.status}`}>
              <div className="vs-icon">{t.status === 'verified' ? <ShieldCheck size={28} /> : t.status === 'rejected' ? <XCircle size={28} /> : <Clock size={28} />}</div>
              <div>
                <h2 className="h-section mb-1">
                  {t.status === 'verified' ? 'You are a verified teacher' : t.status === 'rejected' ? 'Your application needs changes' : 'Verification in progress'}
                </h2>
                <p className="text-muted-qh mb-2">
                  {t.status === 'verified'
                    ? `Verified on ${t.verifiedAt ? formatDateYear(t.verifiedAt) : '—'}. Your badge is visible on your profile and in search.`
                    : t.status === 'rejected' ? t.rejectionReason : 'Our team usually reviews documents within 48 hours.'}
                </p>
                {t.status === 'verified' && <VerifiedBadge size="md" />}
              </div>
            </div>
            <div className="panel mt-4">
              <h2 className="h-section">Timeline</h2>
              <ol className="timeline">
                {steps.map((s) => (
                  <li key={s.label} className={s.failed ? 'is-failed' : s.done ? 'is-done' : ''}>
                    <span className="tl-dot">{s.failed ? <XCircle size={14} /> : s.done ? <Check size={14} /> : null}</span>
                    <div><strong>{s.label}</strong>{s.done && s.date && <span className="text-muted-qh small d-block">{formatDateYear(s.date)}</span>}</div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="panel">
              <h2 className="h-section">Submitted documents</h2>
              {t.certificate ? (
                <div className="doc-preview">
                  {t.certificate.startsWith('data:image') ? <img src={t.certificate} alt="Uploaded certificate" /> : <div className="doc-file"><FileText size={32} /> {t.certificateName}</div>}
                </div>
              ) : <p className="text-muted-qh">No documents uploaded.</p>}
              <p className="text-muted-qh small mt-2 mb-0">{t.certificateName}</p>
              <h3 className="label mt-3">Qualifications on file</h3>
              <ul className="tick-list">{t.qualifications.map((q) => <li key={q}><Check size={14} /> {q}</li>)}</ul>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
