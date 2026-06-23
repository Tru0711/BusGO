import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import { clearStoredAuth, getStoredUser } from '../../utils/auth';
import BusGoFooter from '../layout/BusGoFooter';
import { BusGoNavbar } from '../layout/BusGoNavbar';

const sidebarItems = [
  { label: 'Dashboard', to: '/vendor/dashboard', icon: <DashboardRoundedIcon /> },
  { label: 'Add Bus', to: '/vendor/add-bus-static', icon: <AddCircleRoundedIcon /> },
  { label: 'Manage Buses', to: '/vendor/manage-buses', icon: <DirectionsBusRoundedIcon /> },
  { label: 'Add Trip', to: '/vendor/add-trip', icon: <ScheduleRoundedIcon /> },
  { label: 'Manage Trips', to: '/vendor/manage-trips', icon: <ScheduleRoundedIcon /> },
  { label: 'Trips', to: '/vendor/trips', icon: <DirectionsBusRoundedIcon /> },
  { label: 'View Bookings', to: '/vendor/bookings', icon: <ReceiptLongRoundedIcon /> },
  { label: 'Add Offer', to: '/vendor/add-offer', icon: <LocalOfferRoundedIcon /> },
  { label: 'Manage Offers', to: '/vendor/manage-offers', icon: <LocalOfferRoundedIcon /> },
  { label: 'Profile', to: '/vendor/profile', icon: <PersonRoundedIcon /> },
];

function VendorDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    const token = localStorage.getItem('busgoToken');
    const storedUser = getStoredUser();

    if (!token || storedUser?.role !== 'vendor') {
      navigate('/vendor/login', { replace: true, state: { from: location.pathname } });
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/vendor/login');
  };

  const sidebarContent = (
    <Stack sx={{ height: '100%', p: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: '#FFFFFF',
          }}
        >
          <StorefrontRoundedIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            Vendor Hub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bus operator workspace
          </Typography>
        </Box>
      </Stack>

      <List sx={{ display: 'grid', gap: 0.75, flex: 1 }}>
        {sidebarItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={() => setDrawerOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />
      <Button onClick={handleLogout} startIcon={<LogoutRoundedIcon />} color="inherit" variant="outlined">
        Logout
      </Button>
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BusGoNavbar
        variant="app"
        title="Vendor Hub"
        subtitle="Operator workspace"
        onLogout={handleLogout}
        navItems={sidebarItems.map((s) => ({ label: s.label, to: s.to }))}
      />

      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 80px)', minWidth: 0 }}>
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: 300 } }}
        >
          {sidebarContent}
        </Drawer>

        <Paper
          elevation={0}
          sx={{
            display: { xs: 'none', lg: 'block' },
            width: 300,
            flex: '0 0 300px',
            borderRight: '1px solid rgba(23, 49, 59, 0.08)',
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(14px)',
            borderRadius: 0,
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
          }}
        >
          {sidebarContent}
        </Paper>

        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, flex: 1, minWidth: 0, overflowX: 'clip' }}>
          <Outlet />
          <div className="mt-8">
            <BusGoFooter compact />
          </div>
        </Container>
      </Box>
    </Box>
  );
}

export default VendorDashboardLayout;
