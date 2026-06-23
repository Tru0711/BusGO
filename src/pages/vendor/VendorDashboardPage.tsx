import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { apiRequest } from '../../utils/api';
import { getStoredUser } from '../../utils/auth';

type DashboardResponse = {
  stats: { totalBuses: number; totalBookings: number };
  buses: Array<{ _id: string; busName: string; source: string; destination: string }>; 
  bookings: Array<{ id: string; userName: string; seats: number; date: string }>;
};

function VendorDashboardPage() {
  const user = getStoredUser();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    apiRequest<DashboardResponse>('/vendor/dashboard')
      .then((response) => {
        if (mounted) setData(response);
      })
      .catch(() => {
        if (mounted) setData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: 'Total Buses', value: data?.stats.totalBuses ?? 0, icon: <DirectionsBusRoundedIcon /> },
    { label: 'Total Bookings', value: data?.stats.totalBookings ?? 0, icon: <ReceiptLongRoundedIcon /> },
  ];

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid rgba(23,49,59,0.08)', background: 'linear-gradient(135deg, rgba(15,118,110,0.08), rgba(245,158,11,0.08))' }}>
        <Stack spacing={1}>
          <Chip icon={<DashboardRoundedIcon />} label="Vendor Overview" sx={{ alignSelf: 'flex-start' }} />
          <Typography variant="h4">Welcome back, {user?.name || 'Vendor'}</Typography>
          <Typography color="text.secondary">
            Track your buses, monitor bookings, and manage your company profile from one place.
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2.5}>
        {stats.map((item) => (
          <Grid item xs={12} md={6} key={item.label}>
            <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h3">{loading ? '...' : item.value}</Typography>
                  </Box>
                  <Box sx={{ width: 52, height: 52, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff' }}>
                    {item.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(23,49,59,0.08)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Buses</Typography>
            <Stack spacing={1.5}>
              {(data?.buses || []).slice(0, 3).map((bus) => (
                <Paper key={bus._id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{bus.busName}</Typography>
                  <Typography variant="body2" color="text.secondary">{bus.source} to {bus.destination}</Typography>
                </Paper>
              ))}
              {!loading && (data?.buses.length || 0) === 0 && (
                <Typography color="text.secondary">No buses added yet.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(23,49,59,0.08)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Bookings</Typography>
            <Stack spacing={1.5}>
              {(data?.bookings || []).slice(0, 3).map((booking) => (
                <Paper key={booking.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{booking.userName}</Typography>
                  <Typography variant="body2" color="text.secondary">{booking.seats} seat(s) on {new Date(booking.date).toLocaleDateString()}</Typography>
                </Paper>
              ))}
              {!loading && (data?.bookings.length || 0) === 0 && (
                <Typography color="text.secondary">No bookings yet.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default VendorDashboardPage;