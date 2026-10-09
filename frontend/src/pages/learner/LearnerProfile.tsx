import { useEffect, useState, type FormEvent } from 'react';
import { Camera, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import SmartImage from '../../components/common/SmartImage';
import { SkeletonRows } from '../../components/common/Skeleton';
import { authService } from '../../api/authService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fileToDataUrl } from '../../utils/images';
import { formatDateYear } from '../../utils/formatters';
import type { Gender } from '../../types';

export default function LearnerProfile() {
  useDocumentTitle('Profile');
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { data: learner } = useAsync(() => authService.getLearner(user!.id), [user?.id]);
  const [form, setForm] = useState({ name: '', email: '', gender: 'Female' as Gender, avatar: '', location: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (learner) setForm({ name: learner.name, email: learner.email, gender: learner.gender, avatar: learner.avatar, location: learner.location ?? '' });
  }, [learner?.id]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please complete all required fields with a valid email.');
    setError('');
    setBusy(true);
    try {
      const l = await authService.updateLearner(user!.id, form);
      updateUser({ name: l.name, email: l.email, avatar: l.avatar });
      toast('Profile saved.');
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <DashboardLayout role="learner">
      <PageHeader title="Profile" subtitle="This is how teachers see you when you book." />
      {!learner ? <SkeletonRows rows={4} /> : (
        <div className="row g-4">
          <div className="col-lg-8">
            <form className="panel" onSubmit={save}>
              <div className="photo-upload mb-4">
                <label className="photo-drop is-round">
                  <SmartImage src={form.avatar} name={form.name || 'You'} alt="Profile picture" />
                  <span className="photo-overlay"><Camera size={18} /></span>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setForm({ ...form, avatar: await fileToDataUrl(f, 320) });
                  }} />
                </label>
                <div>
                  <strong>Profile picture</strong>
                  <p className="text-muted-qh small mb-0">Click the photo to upload a new one.</p>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-6 field">
                  <label className="label" htmlFor="p-name">Name</label>
                  <input id="p-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-md-6 field">
                  <label className="label" htmlFor="p-email">Email</label>
                  <input id="p-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="col-md-6 field">
                  <label className="label" htmlFor="p-gender">Gender</label>
                  <select id="p-gender" className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}>
                    <option>Female</option><option>Male</option><option>Other</option>
                  </select>
                </div>
                <div className="col-md-6 field">
                  <label className="label" htmlFor="p-loc">City</label>
                  <input id="p-loc" className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
              </div>
              {error && <p className="field-error">{error}</p>}
              <button className="btn btn-primary mt-2" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
            </form>
          </div>
          <div className="col-lg-4">
            <div className="panel learner-rating">
              <span className="text-muted-qh small">Learner rating</span>
              <div className="lr-score"><Star size={22} fill="currentColor" /> {learner.rating.toFixed(1)}</div>
              <p className="mb-0">“{learner.ratingNote}”</p>
              <span className="text-muted-qh small">Based on feedback from your teachers</span>
            </div>
            <div className="panel mt-3">
              <div className="kv"><span>Member since</span><strong>{formatDateYear(learner.joinedAt)}</strong></div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
