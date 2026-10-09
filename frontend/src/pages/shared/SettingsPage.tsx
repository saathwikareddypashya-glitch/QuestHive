import { useState, type FormEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { adminService } from '../../api/adminService';
import { authService } from '../../api/authService';
import { COMMISSION } from '../../api/adminService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { user } = useAuth();
  const { toast } = useToast();
  const { clearDraft } = useBooking();
  const [prefs, setPrefs] = useState({ email: true, reminders: true, marketing: false, sms: false });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  const [pwBusy, setPwBusy] = useState(false);
  const savePw = async (e: FormEvent) => {
    e.preventDefault();
    if (!pw.current || !pw.next) return setPwError('Please complete all required fields.');
    if (pw.next.length < 6) return setPwError('Use at least 6 characters for your new password.');
    if (pw.next !== pw.confirm) return setPwError('The new passwords don’t match.');
    setPwError('');
    setPwBusy(true);
    try {
      await authService.changePassword(user!.role, user!.id, pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      toast('Password updated. Use the new one next time you sign in.');
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setPwBusy(false);
    }
  };

  const toggles: { key: keyof typeof prefs; label: string; hint: string }[] = [
    { key: 'email', label: 'Booking emails', hint: 'Confirmations, changes and cancellations.' },
    { key: 'reminders', label: 'Class reminders', hint: 'A reminder 24 hours and 1 hour before each class.' },
    { key: 'sms', label: 'SMS alerts', hint: 'Text messages for urgent changes only.' },
    { key: 'marketing', label: 'Tips and offers', hint: 'Occasional emails about new teachers and features.' },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle={`Signed in as ${user?.email}`} />
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="panel h-100">
            <h2 className="h-section">Notifications</h2>
            {toggles.map((t) => (
              <label key={t.key} className="switch-row is-spaced">
                <span><strong>{t.label}</strong><small className="d-block text-muted-qh">{t.hint}</small></span>
                <input type="checkbox" className="switch" checked={prefs[t.key]} onChange={(e) => { setPrefs({ ...prefs, [t.key]: e.target.checked }); toast('Preference saved.'); }} />
              </label>
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <form className="panel h-100" onSubmit={savePw}>
            <h2 className="h-section">Change password</h2>
            {(['current', 'next', 'confirm'] as const).map((k) => (
              <div className="field" key={k}>
                <label className="label" htmlFor={`pw-${k}`}>{k === 'current' ? 'Current password' : k === 'next' ? 'New password' : 'Confirm new password'}</label>
                <input id={`pw-${k}`} type="password" className="input" value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} />
              </div>
            ))}
            {pwError && <p className="field-error">{pwError}</p>}
            <button className="btn btn-primary" type="submit" disabled={pwBusy}>{pwBusy ? 'Updating…' : 'Update password'}</button>
          </form>
        </div>
        {user?.role === 'admin' && (
          <div className="col-12">
            <div className="panel">
              <h2 className="h-section">Platform</h2>
              <div className="row g-3">
                <div className="col-md-4"><div className="kv"><span>Platform commission</span><strong>{COMMISSION * 100}%</strong></div></div>
                <div className="col-md-4"><div className="kv"><span>Currency</span><strong>INR (₹)</strong></div></div>
                <div className="col-md-4"><div className="kv"><span>Default class length</span><strong>60 minutes</strong></div></div>
              </div>
            </div>
          </div>
        )}
        <div className="col-12">
          <div className="panel panel-danger">
            <div>
              <h2 className="h-section">Reset demo data</h2>
              <p className="text-muted-qh mb-0">Restore every teacher, booking, review and payment to the original demo state.</p>
            </div>
            <button className="btn btn-danger-soft" onClick={async () => { try { await adminService.resetDemo(); clearDraft(); toast('Demo data reset.', 'info'); } catch (e) { toast((e as Error).message, 'error'); } }}>
              <RotateCcw size={16} /> Reset data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
