import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bus, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { adminNav, userNav, vendorNav, type NavItem } from '../data/platform';
import { useAuth } from '../contexts/AuthContext';
import type { StoredUser } from '../utils/auth';

type DashboardLayoutProps = {
  role: StoredUser['role'];
};

const roleCopy = {
  user: { title: 'Traveler Dashboard', subtitle: 'Trips, tickets, wallet, and support' },
  vendor: { title: 'Vendor Workspace', subtitle: 'Fleet, schedules, bookings, and revenue' },
  admin: { title: 'Admin Console', subtitle: 'Platform operations and governance' },
};

const navByRole: Record<StoredUser['role'], NavItem[]> = {
  user: userNav,
  vendor: vendorNav,
  admin: adminNav,
};

function DashboardLayout({ role }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const copy = roleCopy[role];
  const navItems = navByRole[role];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-white/10">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-600 text-white">
          <Bus className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-black text-slate-950 dark:text-white">BusGo</p>
          <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">{role}</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${role === 'user' ? 'app' : role}`}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'}`
              }
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-white/10">
        <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block dark:border-white/10 dark:bg-slate-950">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close sidebar" className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-[min(20rem,88vw)] bg-white shadow-2xl dark:bg-slate-950">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
          <div className="flex min-h-18 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden dark:border-white/10 dark:bg-slate-900" aria-label="Open sidebar">
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-slate-950 dark:text-white">{copy.title}</h1>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link to="/" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:block dark:text-slate-300 dark:hover:bg-white/10">Public site</Link>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                {(user?.name || role).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
