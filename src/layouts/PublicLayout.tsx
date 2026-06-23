import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bus, Menu, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { publicNav } from '../data/platform';
import { useAuth } from '../contexts/AuthContext';

function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
        <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
              <Bus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight">BusGo</p>
              <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Travel smarter</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  item.to === '/vendor/register'
                    ? `rounded-full border px-4 py-2 text-sm font-bold transition ${isActive ? 'border-amber-400 bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20' : 'border-amber-300/70 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200 dark:hover:bg-amber-400/20'}`
                    : `rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <Link to={user?.role === 'vendor' ? '/vendor' : user?.role === 'admin' ? '/admin' : '/app'} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                <UserRound className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">Login</Link>
                <Link to="/register" className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20">Register</Link>
              </>
            )}
          </div>

          <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden dark:border-white/10 dark:bg-slate-900" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden dark:border-white/10 dark:bg-slate-950">
            <div className="mx-auto grid max-w-7xl gap-2">
              {publicNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    item.to === '/vendor/register'
                      ? `rounded-xl px-4 py-3 text-sm font-bold ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200'}`
                      : 'rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold dark:border-white/10">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-xl bg-teal-600 px-4 py-3 text-center text-sm font-semibold text-white">Register</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <Outlet />
    </div>
  );
}

export default PublicLayout;
