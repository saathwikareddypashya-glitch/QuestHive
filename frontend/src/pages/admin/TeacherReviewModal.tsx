import { useState } from 'react';
import { Check, FileText, X } from 'lucide-react';
import Modal from '../../components/common/Modal';
import SmartImage from '../../components/common/SmartImage';
import StatusPill from '../../components/common/StatusPill';
import { formatDateYear, formatINR, formatTimeShort } from '../../utils/formatters';
import type { Teacher } from '../../types';

interface Props {
  teacher: Teacher | null;
  onClose: () => void;
  onApprove: (t: Teacher) => Promise<void>;
  onReject: (t: Teacher, reason: string) => Promise<void>;
}

export default function TeacherReviewModal({ teacher, onClose, onApprove, onReject }: Props) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const close = () => { setRejecting(false); setReason(''); onClose(); };
  if (!teacher) return null;
  const t = teacher;
  const decided = t.status !== 'pending';

  const run = async (kind: 'approve' | 'reject') => {
    setBusy(kind);
    try {
      if (kind === 'approve') await onApprove(t); else await onReject(t, reason);
      close();
    } finally { setBusy(''); }
  };

  return (
    <Modal
      open
      onClose={close}
      title="Teacher application"
      size="lg"
      footer={decided ? <button className="btn btn-secondary" onClick={close}>Close</button> : rejecting ? (
        <>
          <button className="btn btn-secondary" onClick={() => setRejecting(false)}>Back</button>
          <button className="btn btn-danger" onClick={() => run('reject')} disabled={!!busy}>{busy === 'reject' ? 'Rejecting…' : 'Confirm rejection'}</button>
        </>
      ) : (
        <>
          <button className="btn btn-danger-soft" onClick={() => setRejecting(true)}><X size={16} /> Reject</button>
          <button className="btn btn-primary" onClick={() => run('approve')} disabled={!!busy}><Check size={16} /> {busy === 'approve' ? 'Approving…' : 'Approve teacher'}</button>
        </>
      )}
    >
      <div className="app-review">
        <div className="ar-left">
          <SmartImage className="ar-photo" src={t.image} fallback={t.imageFallback} name={t.name} alt={t.name} />
          <h3 className="h-section mb-0">{t.name}</h3>
          <span className="text-muted-qh">{t.subject} · {t.location}</span>
          <StatusPill status={t.status} />
          <dl className="ar-dl">
            <div><dt>Email</dt><dd>{t.email}</dd></div>
            <div><dt>Gender</dt><dd>{t.gender}</dd></div>
            <div><dt>Experience</dt><dd>{t.experienceYears} years</dd></div>
            <div><dt>Price</dt><dd>{formatINR(t.price)} / {t.classDurationMins} min</dd></div>
            <div><dt>Submitted</dt><dd>{t.submittedAt ? formatDateYear(t.submittedAt) : '—'}</dd></div>
          </dl>
        </div>
        <div className="ar-right">
          <h4 className="label">Bio</h4>
          <p>{t.bio}</p>
          <h4 className="label">Qualifications</h4>
          <ul className="tick-list">{t.qualifications.map((q) => <li key={q}><Check size={14} /> {q}</li>)}</ul>
          <h4 className="label">Availability</h4>
          <p className="small">{t.availability.map((a) => `${a.day.slice(0, 3)} ${formatTimeShort(a.start)}–${formatTimeShort(a.end)}`).join(' · ') || '—'}</p>
          <h4 className="label">Uploaded certificate / proof</h4>
          <div className="doc-preview">
            {t.certificate?.startsWith('data:image') ? <img src={t.certificate} alt="Uploaded proof" /> : <div className="doc-file"><FileText size={32} /> {t.certificateName ?? 'No file'}</div>}
          </div>
          {t.status === 'rejected' && t.rejectionReason && <div className="notice notice-error mt-3">Rejected: {t.rejectionReason}</div>}
          {rejecting && (
            <div className="field mt-3">
              <label className="label" htmlFor="reject-reason">Reason for rejection (sent to the applicant)</label>
              <textarea id="reject-reason" className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. The certificate is unreadable. Please upload a clearer scan." />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
