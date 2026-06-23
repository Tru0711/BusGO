import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { StoredUser } from '../../utils/auth';
import { getRoleHome } from '../../data/platform';
import { authService } from '../../services/authService';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'otp' | 'reset-password' | 'vendor-register' | 'vendor-login';

function AuthFlowPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState<StoredUser['role']>(mode.startsWith('vendor') ? 'vendor' : 'user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login' || mode === 'vendor-login';
  const isRegister = mode === 'register' || mode === 'vendor-register';
  const title = mode === 'forgot-password' ? 'Forgot password' : mode === 'otp' ? 'OTP verification' : mode === 'reset-password' ? 'Reset password' : isRegister ? 'Create your BusGo account' : 'Welcome back to BusGo';
  const subtitle = mode.startsWith('vendor') ? 'Operator onboarding, verification, fleet, routes, bookings, and revenue.' : 'Search, book, manage trips, wallet, passengers, and support.';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        await authService.forgotPassword(email);
        return;
      }

      const response = isRegister
        ? await authService.register({ name, email, password, role, companyName: role === 'vendor' ? name : undefined })
        : await authService.login(email, password);
      login(response.token, response.user);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || getRoleHome(response.user), { replace: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-slate-900 lg:grid-cols-[0.85fr_1fr]">
        <aside className="bg-[linear-gradient(135deg,#0f766e,#0f172a)] p-8 text-white">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
            <Bus className="h-6 w-6" />
          </div>
          <h1 className="mt-8 text-3xl font-black">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">{subtitle}</p>
          <div className="mt-8 grid gap-3">
            {['Register', 'Login', 'Forgot Password', 'OTP Verification', 'Reset Password'].map((step) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-teal-200" />
                {step}
              </div>
            ))}
          </div>
        </aside>

        <form onSubmit={submit} className="p-6 sm:p-8">
          <div className="grid gap-5">
            {isRegister && (
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{role === 'vendor' ? 'Company / owner name' : 'Full name'}</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950">
                  <UserRound className="h-4 w-4 text-teal-600" />
                  <input value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" />
                </div>
              </label>
            )}

            {(isLogin || isRegister || mode === 'forgot-password') && (
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Email</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950">
                  <Mail className="h-4 w-4 text-teal-600" />
                  <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" />
                </div>
              </label>
            )}

            {(isLogin || isRegister || mode === 'reset-password') && (
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Password</span>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950">
                  <KeyRound className="h-4 w-4 text-teal-600" />
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" />
                </div>
              </label>
            )}

            {(isLogin || isRegister) && (
              <div className="grid gap-2 sm:grid-cols-3">
                {(['user', 'vendor', 'admin'] as StoredUser['role'][]).map((nextRole) => (
                  <button key={nextRole} type="button" onClick={() => setRole(nextRole)} className={`rounded-2xl border px-4 py-3 text-sm font-bold capitalize ${role === nextRole ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' : 'border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300'}`}>
                    {nextRole}
                  </button>
                ))}
              </div>
            )}

            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

            <button type="submit" disabled={loading} className="rounded-2xl bg-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Please wait...' : mode === 'forgot-password' ? 'Send reset OTP' : mode === 'otp' ? 'Verify OTP' : mode === 'reset-password' ? 'Reset password' : isRegister ? 'Create account' : 'Login'}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-slate-500 dark:text-slate-300">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/forgot-password">Forgot password</Link>
            <Link to="/vendor/register">Vendor registration</Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AuthFlowPage;
