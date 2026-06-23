import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AdminLogin from './AdminLogin';
import { apiRequest } from '../../utils/api';
import { clearStoredAuth, getStoredUser } from '../../utils/auth';
import NotificationBell from '../../components/common/NotificationBell';
import RouteSkeleton from '../../components/ui/RouteSkeleton';

const Vendors = lazy(() => import('./Vendors'));
const Users = lazy(() => import('./Users'));
const Bookings = lazy(() => import('./Bookings'));
const AdminBusManagement = lazy(() => import('./AdminBusManagement'));
const AdminBookingManagement = lazy(() => import('./AdminBookingManagement'));
const AdminUserManagement = lazy(() => import('./AdminUserManagement'));
const AdminRevenueReports = lazy(() => import('./AdminRevenueReports'));
const AdminSettings = lazy(() => import('./AdminSettings'));

type AdminSection = 'dashboard' | 'vendors' | 'users' | 'bookings' | 'bus-management' | 'booking-management' | 'user-management' | 'revenue-reports' | 'settings';

type AdminStats = {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
};

function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalVendors: 0, totalBookings: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  const user = useMemo(() => getStoredUser(), [refreshKey]);
  const isAdminLoggedIn = Boolean(localStorage.getItem('busgoToken')) && user?.role === 'admin';

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('busgoToken'));
    if (hasToken && user?.role !== 'admin') {
      clearStoredAuth();
      setRefreshKey((current) => current + 1);
    }
  }, [user]);

  useEffect(() => {
    if (!isAdminLoggedIn) return;

    setStatsLoading(true);
    apiRequest<{ stats: AdminStats }>('/admin/stats')
      .then((response) => setStats(response.stats))
      .catch(() => setStats({ totalUsers: 0, totalVendors: 0, totalBookings: 0 }))
      .finally(() => setStatsLoading(false));
  }, [isAdminLoggedIn]);

  const handleLoginSuccess = () => {
    setRefreshKey((current) => current + 1);
  };

  const handleLogout = () => {
    clearStoredAuth();
    setActiveSection('dashboard');
    setRefreshKey((current) => current + 1);
  };

  if (!isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const renderMainPanel = () => {
    if (activeSection === 'vendors') return <Suspense fallback={<RouteSkeleton variant="admin" />}><Vendors /></Suspense>;
    if (activeSection === 'users') return <Suspense fallback={<RouteSkeleton variant="admin" />}><Users /></Suspense>;
    if (activeSection === 'bookings') return <Suspense fallback={<RouteSkeleton variant="booking" />}><Bookings /></Suspense>;
    if (activeSection === 'bus-management') return <Suspense fallback={<RouteSkeleton variant="admin" />}><AdminBusManagement /></Suspense>;
    if (activeSection === 'booking-management') return <Suspense fallback={<RouteSkeleton variant="booking" />}><AdminBookingManagement /></Suspense>;
    if (activeSection === 'user-management') return <Suspense fallback={<RouteSkeleton variant="admin" />}><AdminUserManagement /></Suspense>;
    if (activeSection === 'revenue-reports') return <Suspense fallback={<RouteSkeleton variant="admin" />}><AdminRevenueReports /></Suspense>;
    if (activeSection === 'settings') return <Suspense fallback={<RouteSkeleton variant="profile" />}><AdminSettings /></Suspense>;

    return (
      <Stack spacing={2.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Welcome Admin
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid rgba(23,49,59,0.10)', flex: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Users</Typography>
            <Typography variant="h4">{statsLoading ? '...' : stats.totalUsers}</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid rgba(23,49,59,0.10)', flex: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Vendors</Typography>
            <Typography variant="h4">{statsLoading ? '...' : stats.totalVendors}</Typography>
          </Paper>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid rgba(23,49,59,0.10)', flex: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
            <Typography variant="h4">{statsLoading ? '...' : stats.totalBookings}</Typography>
          </Paper>
        </Stack>
      </Stack>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, bgcolor: '#f7f4ee', minWidth: 0 }}>
      <Paper
        elevation={0}
        sx={{
          width: { xs: '100%', md: 240 },
          flex: { md: '0 0 240px' },
          p: 2,
          borderRight: { xs: 0, md: '1px solid rgba(23,49,59,0.10)' },
          borderBottom: { xs: '1px solid rgba(23,49,59,0.10)', md: 0 },
          borderRadius: 0,
          position: { md: 'sticky' },
          top: 0,
          alignSelf: { md: 'flex-start' },
          maxHeight: { md: '100vh' },
          overflowY: 'auto',
        }}
      >
        <Stack spacing={1} sx={{ alignItems: 'stretch' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, px: 1, py: 1 }}>
            Admin Panel
          </Typography>
          <Button variant={activeSection === 'dashboard' ? 'contained' : 'text'} onClick={() => setActiveSection('dashboard')}>Dashboard</Button>
          <Button variant={activeSection === 'vendors' ? 'contained' : 'text'} onClick={() => setActiveSection('vendors')}>Vendors</Button>
          <Button variant={activeSection === 'users' ? 'contained' : 'text'} onClick={() => setActiveSection('users')}>Users</Button>
          <Button variant={activeSection === 'bookings' ? 'contained' : 'text'} onClick={() => setActiveSection('bookings')}>Bookings</Button>
          <Button variant={activeSection === 'bus-management' ? 'contained' : 'text'} onClick={() => setActiveSection('bus-management')}>Bus Management</Button>
          <Button variant={activeSection === 'booking-management' ? 'contained' : 'text'} onClick={() => setActiveSection('booking-management')}>Booking Management</Button>
          <Button variant={activeSection === 'user-management' ? 'contained' : 'text'} onClick={() => setActiveSection('user-management')}>User Management</Button>
          <Button variant={activeSection === 'revenue-reports' ? 'contained' : 'text'} onClick={() => setActiveSection('revenue-reports')}>Revenue Reports</Button>
          <Button variant={activeSection === 'settings' ? 'contained' : 'text'} onClick={() => setActiveSection('settings')}>Settings</Button>
          <Button color="error" variant="outlined" onClick={handleLogout}>Logout</Button>
        </Stack>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2.5, md: 4 }, overflowX: 'clip' }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live bookings, vendors, users, and alerts.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-end' }} sx={{ flexWrap: 'wrap' }}>
              <NotificationBell />
              <Button component="a" href="/notifications" variant="outlined">
                Notifications
              </Button>
            </Stack>
          </Stack>
          {renderMainPanel()}
        </Stack>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
