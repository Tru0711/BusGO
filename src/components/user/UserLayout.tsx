import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BusGoNavbar, type BusGoNavItem } from '../layout/BusGoNavbar';
import BusGoFooter from '../layout/BusGoFooter';
import { apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/auth';

function UserLayout() {
  const user = useMemo(() => getStoredUser(), []);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !localStorage.getItem('busgoToken')) {
      return;
    }

    let mounted = true;
    apiRequest<{ unreadCount: number }>('/notifications/unread-count')
      .then((response) => {
        if (mounted) {
          setUnreadCount(response.unreadCount || 0);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [user]);

  const navItems: BusGoNavItem[] = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.13),_transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef5fb_42%,#f5f7fb_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,#050816_0%,#0b1120_42%,#111827_100%)] dark:text-slate-100">
      <BusGoNavbar
        variant="app"
        navItems={navItems}
        title="BusGo"
        subtitle="Travel control center"
        onLogout={() => undefined}
        notificationsCount={unreadCount}
        showGreeting
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <BusGoFooter compact />
    </div>
  );
}

export default UserLayout;
