import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Check, CheckCircle2, ChevronLeft, FileText, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react';
import Logo from '../../components/common/Logo';
import SmartImage from '../../components/common/SmartImage';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { teacherService } from '../../api/teacherService';
import { useToast } from '../../context/ToastContext';
import { fileToDataUrl } from '../../utils/images';
import { DAYS, formatINR, formatTimeShort, fromMinutes, toMinutes, uid } from '../../utils/formatters';
import { rangesOverlap } from '../../utils/slots';
import type { AvailabilityRange, Day, Gender } from '../../types';

const STEPS = ['Basic details', 'Teaching details', 'Verification', 'Pricing', 'Availability', 'Review'];
const TIMES = Array.from({ length: 33 }, (_, i) => fromMinutes(6 * 60 + i * 30)); // 06:00 → 22:00

interface Form {
  name: string; gender: Gender; email: string; password: string; image: string; location: string;
  subject: string; category: string; bio: string; experienceYears: string; qualifications: string;
  certificate: string; certificateName: string; certificateIsImage: boolean;
  price: string; classDurationMins: number; availability: AvailabilityRange[];
}

const empty: Form = {
  name: '', gender: 'Female', email: '', password: '', image: '', location: '',
  subject: '', category: '', bio: '', experienceYears: '', qualifications: '',
  certificate: '', certificateName: '', certificateIsImage: false,
  price: '1500', classDurationMins: 60, availability: [],
};

export default function TeacherRegister() {
  useDocumentTitle('Apply to teach');
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [range, setRange] = useState<{ day: Day; start: string; end: string }>({ day: 'Monday', start: '17:00', end: '20:00' });

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!f.name.trim()) e.name = 'Enter your full name.';
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.';
      if (f.password.length < 6) e.password = 'Use at least 6 characters.';
      if (!f.image) e.image = 'Add a clear profile photo — learners book faces they can see.';
    }
    if (s === 1) {
      if (!f.subject) e.subject = 'Choose the subject you teach.';
      if (f.bio.trim().length < 40) e.bio = 'Write at least 40 characters about yourself and how you teach.';
      if (!f.experienceYears || Number(f.experienceYears) < 0) e.experienceYears = 'Enter your years of experience.';
      if (!f.qualifications.trim()) e.qualifications = 'Add at least one qualification.';
    }
    if (s === 2 && !f.certificate) e.certificate = 'Upload a degree, certificate or other proof.';
    if (s === 3 && (!Number(f.price) || Number(f.price) < 200)) e.price = 'Enter a price of at least ₹200.';
    if (s === 4 && f.availability.length === 0) e.availability = 'Add at least one time range.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } else toast('Please complete all required fields.', 'error'); };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try { set('image', await fileToDataUrl(file, 480)); setErrors((e) => ({ ...e, image: '' })); }
    catch (err) { setErrors((e) => ({ ...e, image: (err as Error).message })); }
  };
  const onCert = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setErrors((e) => ({ ...e, certificate: 'Files must be under 5 MB.' }));
    try {
      const url = await fileToDataUrl(file, 1000);
      setF((x) => ({ ...x, certificate: url || 'uploaded', certificateName: file.name, certificateIsImage: file.type.startsWith('image/') }));
      setErrors((e) => ({ ...e, certificate: '' }));
    } catch (err) { setErrors((e) => ({ ...e, certificate: (err as Error).message })); }
  };

  const addRange = () => {
    if (toMinutes(range.end) - toMinutes(range.start) < f.classDurationMins)
      return setErrors({ availability: `The range must be at least ${f.classDurationMins} minutes long.` });
    if (f.availability.some((a) => a.day === range.day && rangesOverlap(a, range)))
      return setErrors({ availability: `That overlaps another ${range.day} range.` });
    set('availability', [...f.availability, { id: uid('av'), ...range }].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start)));
    setErrors({});
  };

  const submit = async () => {
    setBusy(true);
    try {
      await teacherService.apply({
        name: f.name.trim(), gender: f.gender, email: f.email.trim(), password: f.password, image: f.image,
        subject: f.subject, category: f.category, bio: f.bio.trim(), experienceYears: Number(f.experienceYears),
        qualifications: f.qualifications.split('\n').map((q) => q.trim()).filter(Boolean),
        certificate: f.certificate, certificateName: f.certificateName, price: Number(f.price),
        classDurationMins: f.classDurationMins, availability: f.availability, location: f.location.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page page-fade">
        <div className="auth-card text-center">
          <div className="confirm-check mx-auto" aria-hidden><Check size={36} strokeWidth={2.5} /></div>
          <h1 className="h-page">Your application has been submitted.</h1>
          <p className="text-muted-qh">Your profile will become visible once verified. We usually review applications within 48 hours. After approval, sign in as a teacher with {f.email} and the password you just chose.</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
            <Link to="/" className="btn btn-primary">Back to home</Link>
            <Link to="/login?role=admin" className="btn btn-secondary">Sign in as admin to review it</Link>
            <Link to={`/login?role=teacher&email=${encodeURIComponent(f.email)}`} className="btn btn-ghost">Teacher sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="field-error">{errors[k]}</p> : null);

  return (
    <div className="page-fade register-teacher">
      <div className="container-qh narrow">
        <div className="rt-top">
          <Link to="/become-a-teacher" className="back-link"><ChevronLeft size={16} /> Back</Link>
          <Logo />
        </div>
        <h1 className="h-page-lg">Apply to teach on QuestHive</h1>
        <div className="rt-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          <div className="rt-bar"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
          <ol className="rt-steps">
            {STEPS.map((s, i) => (
              <li key={s} className={i < step ? 'is-done' : i === step ? 'is-current' : ''}>
                <span>{i < step ? <Check size={12} /> : i + 1}</span>{s}
              </li>
            ))}
          </ol>
        </div>

        <div className="panel rt-panel">
          <h2 className="h-section">Step {step + 1}: {STEPS[step]}</h2>

          {step === 0 && (
            <div className="row g-3">
              <div className="col-12 photo-upload">
                <label className={`photo-drop ${errors.image ? 'is-invalid' : ''}`}>
                  {f.image ? <img src={f.image} alt="Profile preview" /> : <Camera size={28} />}
                  <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} />
                </label>
                <div>
                  <strong>Profile picture</strong>
                  <p className="text-muted-qh small mb-1">A friendly, well-lit photo of your face. JPG or PNG.</p>
                  <Err k="image" />
                </div>
              </div>
              <div className="col-md-6 field">
                <label className="label" htmlFor="t-name">Full name</label>
                <input id="t-name" className={`input ${errors.name ? 'is-invalid' : ''}`} value={f.name} onChange={(e) => set('name', e.target.value)} />
                <Err k="name" />
              </div>
              <div className="col-md-6 field">
                <label className="label" htmlFor="t-loc">City</label>
                <input id="t-loc" className="input" value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Hyderabad" />
              </div>
              <div className="col-md-6 field">
                <label className="label" htmlFor="t-email">Email</label>
                <input id="t-email" type="email" className={`input ${errors.email ? 'is-invalid' : ''}`} value={f.email} onChange={(e) => set('email', e.target.value)} />
                <Err k="email" />
              </div>
              <div className="col-md-6 field">
                <label className="label" htmlFor="t-pw">Password</label>
                <input id="t-pw" type="password" className={`input ${errors.password ? 'is-invalid' : ''}`} value={f.password} onChange={(e) => set('password', e.target.value)} />
                <Err k="password" />
              </div>
              <fieldset className="col-12 field">
                <legend className="label">Gender</legend>
                <div className="chip-row">
                  {(['Female', 'Male', 'Other'] as Gender[]).map((g) => (
                    <button key={g} type="button" className={`chip ${f.gender === g ? 'is-on' : ''}`} onClick={() => set('gender', g)}>{g}</button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {step === 1 && (
            <div className="row g-3">
              <div className="col-md-8 field">
                <label className="label" htmlFor="t-subject">Subject</label>
                <select
                  id="t-subject"
                  className={`input ${errors.subject ? 'is-invalid' : ''}`}
                  value={f.subject}
                  onChange={(e) => {
                    const cat = categories?.find((c) => c.subjects.includes(e.target.value));
                    setF((x) => ({ ...x, subject: e.target.value, category: cat?.id ?? '' }));
                  }}
                >
                  <option value="">Choose a subject</option>
                  {categories?.map((c) => (
                    <optgroup key={c.id} label={c.shortName}>
                      {c.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  ))}
                </select>
                <Err k="subject" />
              </div>
              <div className="col-md-4 field">
                <label className="label" htmlFor="t-exp">Experience (years)</label>
                <input id="t-exp" type="number" min={0} className={`input ${errors.experienceYears ? 'is-invalid' : ''}`} value={f.experienceYears} onChange={(e) => set('experienceYears', e.target.value)} />
                <Err k="experienceYears" />
              </div>
              <div className="col-12 field">
                <label className="label" htmlFor="t-bio">Bio <span className="label-value">{f.bio.length}/600</span></label>
                <textarea id="t-bio" rows={5} maxLength={600} className={`input ${errors.bio ? 'is-invalid' : ''}`} value={f.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Who are you, what do you teach, and what will learners be able to do after your classes?" />
                <Err k="bio" />
              </div>
              <div className="col-12 field">
                <label className="label" htmlFor="t-qual">Qualifications <span className="text-muted-qh">(one per line)</span></label>
                <textarea id="t-qual" rows={3} className={`input ${errors.qualifications ? 'is-invalid' : ''}`} value={f.qualifications} onChange={(e) => set('qualifications', e.target.value)} placeholder={'B.Tech Computer Science, JNTU\nAWS Certified Developer'} />
                <Err k="qualifications" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-muted-qh">Upload a degree, certificate or any proof of your expertise. Only our verification team sees this.</p>
              <label className={`file-drop ${errors.certificate ? 'is-invalid' : ''}`}>
                <UploadCloud size={28} />
                <strong>{f.certificateName || 'Choose a file to upload'}</strong>
                <span className="text-muted-qh small">PDF, JPG or PNG · up to 5 MB</span>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => onCert(e.target.files?.[0])} />
              </label>
              <Err k="certificate" />
              {f.certificate && (
                <div className="doc-preview mt-3">
                  {f.certificateIsImage ? <img src={f.certificate} alt="Certificate preview" /> : <div className="doc-file"><FileText size={32} /> {f.certificateName}</div>}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="row g-3">
              <div className="col-md-6 field">
                <label className="label" htmlFor="t-price">Price per class (₹)</label>
                <input id="t-price" type="number" min={200} step={50} className={`input ${errors.price ? 'is-invalid' : ''}`} value={f.price} onChange={(e) => set('price', e.target.value)} />
                <Err k="price" />
              </div>
              <div className="col-md-6 field">
                <label className="label" htmlFor="t-dur">Class duration</label>
                <select id="t-dur" className="input" value={f.classDurationMins} onChange={(e) => set('classDurationMins', Number(e.target.value))}>
                  {[30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} minutes</option>)}
                </select>
              </div>
              <div className="col-12">
                <div className="notice notice-info">
                  Teachers in this category usually charge {formatINR(1200)}–{formatINR(2800)}. You keep 85% — at {formatINR(Number(f.price) || 0)} that's {formatINR((Number(f.price) || 0) * 0.85)} per class.
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-muted-qh">Add the weekly hours when learners can book you. Slots are created automatically from these ranges.</p>
              <div className="range-adder">
                <select className="input" value={range.day} onChange={(e) => setRange({ ...range, day: e.target.value as Day })} aria-label="Day">
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select className="input" value={range.start} onChange={(e) => setRange({ ...range, start: e.target.value })} aria-label="Start time">
                  {TIMES.map((t) => <option key={t} value={t}>{formatTimeShort(t)}</option>)}
                </select>
                <span className="text-muted-qh">to</span>
                <select className="input" value={range.end} onChange={(e) => setRange({ ...range, end: e.target.value })} aria-label="End time">
                  {TIMES.map((t) => <option key={t} value={t}>{formatTimeShort(t)}</option>)}
                </select>
                <button type="button" className="btn btn-secondary" onClick={addRange}><Plus size={16} /> Add</button>
              </div>
              <Err k="availability" />
              <ul className="range-list">
                {f.availability.map((a) => (
                  <li key={a.id}>
                    <strong>{a.day}</strong>
                    <span>{formatTimeShort(a.start)} — {formatTimeShort(a.end)}</span>
                    <button type="button" className="icon-btn" aria-label="Remove range" onClick={() => set('availability', f.availability.filter((x) => x.id !== a.id))}><Trash2 size={15} /></button>
                  </li>
                ))}
                {f.availability.length === 0 && <li className="text-muted-qh">No hours added yet.</li>}
              </ul>
            </div>
          )}

          {step === 5 && (
            <div className="review-grid">
              <div className="review-profile">
                <SmartImage src={f.image} name={f.name || 'New teacher'} alt="" />
                <div>
                  <strong>{f.name}</strong>
                  <span className="text-muted-qh small">{f.subject} · {f.location || 'Online'}</span>
                </div>
              </div>
              <dl className="review-dl">
                <div><dt>Email</dt><dd>{f.email}</dd><button className="link-btn" onClick={() => setStep(0)}>Edit</button></div>
                <div><dt>Gender</dt><dd>{f.gender}</dd></div>
                <div><dt>Experience</dt><dd>{f.experienceYears} years</dd><button className="link-btn" onClick={() => setStep(1)}>Edit</button></div>
                <div><dt>Bio</dt><dd>{f.bio}</dd></div>
                <div><dt>Qualifications</dt><dd>{f.qualifications.split('\n').filter(Boolean).join(', ')}</dd></div>
                <div><dt>Proof</dt><dd>{f.certificateName}</dd><button className="link-btn" onClick={() => setStep(2)}>Edit</button></div>
                <div><dt>Price</dt><dd>{formatINR(Number(f.price))} per {f.classDurationMins}-minute class</dd><button className="link-btn" onClick={() => setStep(3)}>Edit</button></div>
                <div><dt>Availability</dt><dd>{f.availability.map((a) => `${a.day.slice(0, 3)} ${formatTimeShort(a.start)}–${formatTimeShort(a.end)}`).join(', ')}</dd><button className="link-btn" onClick={() => setStep(4)}>Edit</button></div>
              </dl>
              <div className="notice notice-info"><CheckCircle2 size={16} /> By submitting, you confirm the information and documents are genuine.</div>
            </div>
          )}

          <div className="rt-actions">
            {step > 0 && <button className="btn btn-secondary" onClick={back} disabled={busy}>Back</button>}
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary ms-auto" onClick={next}>Continue</button>
            ) : (
              <button className="btn btn-primary ms-auto" onClick={submit} disabled={busy}>
                {busy && <Loader2 size={16} className="spin" />} Submit for verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
