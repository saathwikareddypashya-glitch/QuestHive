import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Gender } from '../../types';

export default function Register() {
  useDocumentTitle('Create an account');
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', gender: 'Female' as Gender });
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) return setError('Please complete all required fields.');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Enter a valid email address.');
    if (form.password.length < 6) return setError('Use at least 6 characters for your password.');
    if (form.password !== form.confirm) return setError('The two passwords don’t match.');
    setError('');
    setBusy(true);
    try {
      const u = await register({ name: form.name, email: form.email, password: form.password, gender: form.gender }, remember);
      toast(`Welcome to QuestHive, ${u.name.split(' ')[0]}! Your account is ready.`);
      navigate(params.get('redirect') || '/learner/dashboard', { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page page-fade">
      <div className="auth-card">
        <Logo />
        <h1 className="h-page mt-4">Create your learner account</h1>
        <p className="text-muted-qh">Book classes, save teachers and track your learning. You'll sign in with this email and password next time.</p>
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label className="label" htmlFor="r-name">Full name</label>
            <input id="r-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </div>
          <div className="field">
            <label className="label" htmlFor="r-email">Email</label>
            <input id="r-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </div>
          <div className="field">
            <label className="label" htmlFor="r-pw">Password</label>
            <div className="pw-wrap">
              <input id="r-pw" type={showPw ? 'text' : 'password'} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" placeholder="At least 6 characters" />
              <button type="button" className="icon-btn pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="r-pw2">Confirm password</label>
            <input id="r-pw2" type={showPw ? 'text' : 'password'} className="input" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
          </div>
          <fieldset className="field">
            <legend className="label">Gender</legend>
            <div className="chip-row">
              {(['Female', 'Male', 'Other'] as Gender[]).map((g) => (
                <button key={g} type="button" className={`chip ${form.gender === g ? 'is-on' : ''}`} onClick={() => setForm({ ...form, gender: g })}>{g}</button>
              ))}
            </div>
          </fieldset>
          <label className="check-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Keep me signed in on this device</span>
          </label>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block btn-lg mt-2" type="submit" disabled={busy}>
            {busy && <Loader2 size={18} className="spin" />} Create account
          </button>
        </form>
        <div className="teach-callout">
          <GraduationCap size={18} />
          <span>Want to teach instead? <Link to="/register/teacher">Apply as a teacher</Link></span>
        </div>
        <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
