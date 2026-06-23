import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Typography, Avatar, Stack, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}

function VendorTripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
      apiRequest<{ trips: any[] }>('/vendor/trips')
      .then((data) => {
        if (mounted && data?.trips) setTrips(data.trips);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Trips</Typography>
      <Grid container spacing={2}>
        {trips.map((t) => (
          <Grid item xs={12} md={6} lg={4} key={t.id}>
            <Card variant="outlined" sx={{ ':hover': { boxShadow: 4 } }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={t.busImage || undefined} variant="rounded" sx={{ width: 80, height: 56 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{t.busName || t.route}</Typography>
                    <Typography color="text.secondary">{t.route}</Typography>
                    <Typography variant="body2" color="text.secondary">{t.date} • {t.departureTime}</Typography>
                  </Box>
                  <Chip label={t.status} color={t.status === 'active' ? 'success' : 'default'} />
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <StatChip label="Total Seats" value={t.totalSeats} />
                  <StatChip label="Booked Seats" value={t.bookedSeats} />
                  <StatChip label="Revenue" value={t.revenue} />
                  <StatChip label="Bookings" value={t.bookingCount} />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={() => navigate(`/vendor/trips/${t.id}/bookings`)}>View Bookings</Button>
                  <Button variant="outlined" onClick={() => navigate(`/vendor/trips/${t.id}/analytics`)}>View Analytics</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default VendorTripsPage;
