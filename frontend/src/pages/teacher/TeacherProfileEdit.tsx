import { useEffect, useState, type FormEvent } from 'react';
import { Camera } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import TeacherCard from '../../components/teacher/TeacherCard';
import SmartImage from '../../components/common/SmartImage';
import { SkeletonRows } from '../../components/common/Skeleton';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fileToDataUrl } from '../../utils/images';
import type { Teacher } from '../../types';

export default function TeacherProfileEdit() {
  useDocumentTitle('My profile');
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { data: teacher } = useAsync(() => teacherService.getTeacherById(user!.id), [user?.id]);
  const [form, setForm] = useState<Teacher | null>(null);
  const [skills, setSkills] = useState('');
  const [quals, setQuals] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (teacher && !form) { setForm(teacher); setSkills(teacher.skills.join(', ')); setQuals(teacher.qualifications.join('\n')); }
  }, [teacher]);

  if (!form) return <DashboardLayout role="teacher"><PageHeader title="My profile" /><SkeletonRows rows={6} /></DashboardLayout>;

  const set = <K extends keyof Teacher>(k: K, v: Teacher[K]) => setForm({ ...form, [k]: v });
  const preview: Teacher = { ...form, skills: skills.split(',').map((s) => s.trim()).filter(Boolean) };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || form.price < 200) return setError('Please complete all required fields. Price must be at least ₹200.');
    setError('');
    setBusy(true);
    try {
      const t = await teacherService.updateProfile(form.id, {
        name: form.name, image: form.image, imageFallback: form.image.startsWith('data:') ? undefined : form.imageFallback,
        location: form.location, online: form.online, description: form.description, bio: form.bio, price: Number(form.price),
        experienceYears: Number(form.experienceYears), teachingStyle: form.teachingStyle, firstClassFree: form.firstClassFree,
        skills: preview.skills, qualifications: quals.split('\n').map((q) => q.trim()).filter(Boolean),
      });
      updateUser({ name: t.name, avatar: t.image });
      toast('Profile saved. Changes are live on your public page.');
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <DashboardLayout role="teacher">
      <PageHeader title="My profile" subtitle="This is what learners see before they book you." />
      <div className="row g-4">
        <div className="col-xl-8">
          <form className="panel" onSubmit={save}>
            <div className="photo-upload mb-4">
              <label className="photo-drop">
                <SmartImage src={form.image} fallback={form.imageFallback} name={form.name} alt="Profile photo" />
                <span className="photo-overlay"><Camera size={18} /></span>
                <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set('image', await fileToDataUrl(f, 600)); }} />
              </label>
              <div><strong>Profile photo</strong><p className="text-muted-qh small mb-0">This photo leads your card in search results.</p></div>
            </div>
            <div className="row g-3">
              <div className="col-md-6 field"><label className="label" htmlFor="e-name">Display name</label><input id="e-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
              <div className="col-md-6 field"><label className="label" htmlFor="e-loc">City</label><input id="e-loc" className="input" value={form.location} onChange={(e) => set('location', e.target.value)} /></div>
              <div className="col-12 field">
                <label className="label" htmlFor="e-desc">Card headline <span className="label-value">{form.description.length}/140</span></label>
                <input id="e-desc" maxLength={140} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="col-12 field"><label className="label" htmlFor="e-bio">About you</label><textarea id="e-bio" rows={5} className="input" value={form.bio} onChange={(e) => set('bio', e.target.value)} /></div>
              <div className="col-md-4 field"><label className="label" htmlFor="e-price">Price per class (₹)</label><input id="e-price" type="number" min={200} step={50} className="input" value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></div>
              <div className="col-md-4 field"><label className="label" htmlFor="e-exp">Experience (years)</label><input id="e-exp" type="number" min={0} className="input" value={form.experienceYears} onChange={(e) => set('experienceYears', Number(e.target.value))} /></div>
              <div className="col-md-4 field"><label className="label">Subject</label><input className="input" value={form.subject} disabled title="Contact support to change your subject" /></div>
              <div className="col-12 field"><label className="label" htmlFor="e-skills">Skills <span className="text-muted-qh">(comma separated)</span></label><input id="e-skills" className="input" value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
              <div className="col-12 field"><label className="label" htmlFor="e-quals">Qualifications <span className="text-muted-qh">(one per line)</span></label><textarea id="e-quals" rows={3} className="input" value={quals} onChange={(e) => setQuals(e.target.value)} /></div>
              <div className="col-12 field"><label className="label" htmlFor="e-style">Teaching style</label><textarea id="e-style" rows={2} className="input" value={form.teachingStyle} onChange={(e) => set('teachingStyle', e.target.value)} /></div>
              <div className="col-md-6"><label className="switch-row"><span>Offer classes online</span><input type="checkbox" className="switch" checked={form.online} onChange={(e) => set('online', e.target.checked)} /></label></div>
              <div className="col-md-6"><label className="switch-row"><span>First class free</span><input type="checkbox" className="switch" checked={form.firstClassFree} onChange={(e) => set('firstClassFree', e.target.checked)} /></label></div>
            </div>
            {error && <p className="field-error mt-2">{error}</p>}
            <button className="btn btn-primary mt-3" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
          </form>
        </div>
        <div className="col-xl-4">
          <div className="sticky-preview">
            <span className="label">Card preview</span>
            <TeacherCard teacher={preview} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
