import { useState, useEffect } from 'react';
import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom';
import { Bus, Menu, X, LogOut, User, ShieldCheck } from 'lucide-react';
import { clearStoredAuth, getStoredUser } from '../../utils/auth';

export type BusGoNavItem = {
  label: string;
  to: string;
};

type BusGoNavbarProps = {
  navItems?: BusGoNavItem[];
  variant?: 'public' | 'app';
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaTo?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTo?: string;
  onLogout?: () => void;
  notificationsCount?: number;
  showGreeting?: boolean;
  className?: string;
};

const defaultPublicItems: BusGoNavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Routes', to: '/search-buses' },
  { label: 'Book Tickets', to: '/search-buses?book=1' },
  { label: 'Reviews', to: '/#reviews' },
  { label: 'Become Vendor', to: '/vendor/signup' },
];

export function BusGoNavbar({
  navItems = defaultPublicItems,
  variant = 'public',
  title = 'BusGo',
  subtitle,
  ctaLabel = 'Login',
  ctaTo = '/login',
  secondaryCtaLabel = 'Register',
  secondaryCtaTo = '/signup',
  onLogout,
  showGreeting = true,
  className = '',
}: BusGoNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const user = getStoredUser();
  const isAuthenticated = Boolean(localStorage.getItem('busgoToken'));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    clearStoredAuth();
    onLogout?.();
    navigate('/login');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border-b border-gray-100/80'
          : 'bg-transparent'
      } ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-4 py-3">
          {/* Logo */}
          <RouterLink to="/" className="group flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-emerald-500/30">
              <Bus className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-lg font-extrabold tracking-tight text-slate-900">{title}</span>
              <span className="-mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-600">
                {subtitle || 'Premium Travel'}
              </span>
            </div>
          </RouterLink>

          {/* Desktop Nav */}
          <nav className="no-scrollbar hidden max-w-[48vw] items-center gap-1 overflow-x-auto whitespace-nowrap lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-emerald-500 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-2.5">
            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">
                    {initials || 'U'}
                  </div>
                  <div className="min-w-0">
                    {showGreeting && (
                      <p className="text-[10px] uppercase tracking-wider text-slate-400">Welcome</p>
                    )}
                    <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
                      {user?.name || 'Traveler'}
                    </p>
                  </div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2.5">
                <RouterLink
                  to={secondaryCtaTo}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <User className="h-4 w-4" />
                  {secondaryCtaLabel}
                </RouterLink>
                <RouterLink
                  to={ctaTo}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {ctaLabel}
                </RouterLink>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`relative lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                scrolled
                  ? 'bg-white border border-gray-200 text-slate-700 hover:bg-gray-50'
                  : 'bg-white/80 backdrop-blur-sm border border-white/20 text-slate-700 hover:bg-white'
              }`}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <hr className="my-2 border-gray-100" />

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <RouterLink
                  to={secondaryCtaTo}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  {secondaryCtaLabel}
                </RouterLink>
                <RouterLink
                  to={ctaTo}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {ctaLabel}
                </RouterLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default BusGoNavbar;

