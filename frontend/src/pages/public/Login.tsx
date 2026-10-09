import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Info, Loader2 } from 'lucide-react';
import Logo from '../../components/common/Logo';
import { dashboardPath, useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Role } from '../../types';

const roles: { role: Role; label: string }[] = [
  { role: 'learner', label: 'Learner' },
  { role: 'teacher', label: 'Teacher' },
  { role: 'admin', label: 'Admin' },
];

const demoAccounts: Record<Role, { email: string; password: string; who: string }> = {
  learner: { email: 'ananya@questhive.demo', password: 'demo1234', who: 'Ananya Sharma' },
  teacher: { email: 'gunjan@questhive.demo', password: 'demo1234', who: 'Gunjan (Guitar)' },
  admin: { email: 'admin@questhive.demo', password: 'admin123', who: 'Platform admin' },
};

/** Only send people back to a page their role is allowed to open. */
function canAccess(path: string, role: Role) {
  if (path.startsWith('/learner') || path.startsWith('/booking') || path.startsWith('/payment')) return role === 'learner';
  if (path.startsWith('/teacher/')) return role === 'teacher';
  if (path.startsWith('/admin')) return role === 'admin';
  return true;
}

export default function Login() {
  useDocumentTitle('Sign in');
  const [params] = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>((params.get('role') as Role) || 'learner');
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const redirect = params.get('redirect');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Please enter your email and password.');
    setError('');
    setBusy(true);
    try {
      const u = await login(email.trim(), password, role, remember);
      toast(`Welcome back, ${u.name.split(' ')[0]}.`);
      navigate(redirect && canAccess(redirect, u.role) ? redirect : dashboardPath(u.role), { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const demo = demoAccounts[role];

  return (
    <div className="auth-page page-fade">
      <div className="auth-card">
        <Logo />
        <h1 className="h-page mt-4">Sign in to QuestHive</h1>
        <p className="text-muted-qh">{redirect ? 'Sign in to continue where you left off.' : 'Welcome back. Choose your account type and sign in.'}</p>

        <form onSubmit={submit} noValidate>
          <div className="segmented" role="tablist" aria-label="Account type">
            {roles.map((r) => (
              <button key={r.role} type="button" role="tab" aria-selected={role === r.role} className={role === r.role ? 'is-on' : ''}
                onClick={() => { setRole(r.role); setError(''); }}>
                {r.label}
              </button>
            ))}
          </div>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <div className="pw-wrap">
              <input id="password" type={showPw ? 'text' : 'password'} className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" className="icon-btn pw-toggle" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember me on this device</span>
          </label>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button className="btn btn-primary btn-block btn-lg mt-2" type="submit" disabled={busy}>
            {busy && <Loader2 size={18} className="spin" />} Sign in
          </button>
        </form>

        <div className="demo-hint">
          <Info size={15} />
          <span>
            Demo {role} account: <strong>{demo.email}</strong> / <strong>{demo.password}</strong>{' '}
            <button type="button" className="link-btn" onClick={() => { setEmail(demo.email); setPassword(demo.password); setError(''); }}>Fill in</button>
          </span>
        </div>

        <p className="auth-foot">
          New to QuestHive? <Link to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>Create an account</Link>
          {' · '}<Link to="/register/teacher">Apply to teach</Link>
        </p>
      </div>
    </div>
  );
}
