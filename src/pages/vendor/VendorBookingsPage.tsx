import { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Grid, Avatar, Stack, Chip, Button, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';

type Booking = {
  id: string;
  userName: string;
  userEmail?: string;
  busName?: string;
  seats: number;
  date: string;
  bookingStatus: string;
};

function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    apiRequest<{ bookings: Booking[] }>('/vendor/bookings')
      .then((response) => {
        if (mounted) setBookings(response.bookings);
      })
      .catch((error) => {
        if (mounted) setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load bookings.' });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)' }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4">View Bookings</Typography>
          <Typography color="text.secondary">Bookings related to buses created by your account.</Typography>
        </Box>

        {feedback && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

        {loading ? (
          <Typography>Loading bookings...</Typography>
        ) : bookings.length === 0 ? (
          <Typography color="text.secondary">No bookings found for your buses.</Typography>
        ) : (
          <Grid container spacing={2}>
            {bookings.map((booking) => (
              <Grid item xs={12} md={6} key={booking.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{(booking.userName || 'U').charAt(0)}</Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{booking.userName}</Typography>
                        {booking.userEmail && <Typography variant="body2" color="text.secondary">{booking.userEmail}</Typography>}
                        <Typography variant="body2" sx={{ mt: 1 }}>{booking.busName || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(booking.date).toLocaleString()}</Typography>
                      </Box>
                      <Stack spacing={1} alignItems="flex-end">
                        <Chip label={booking.bookingStatus} color={booking.bookingStatus === 'confirmed' ? 'success' : 'default'} size="small" />
                        <Typography variant="caption">Seats: {booking.seats}</Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button size="small" variant="outlined">View Details</Button>
                      <Button size="small" color="error" variant="outlined">Refund</Button>
                      <Button size="small" variant="contained">Contact</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

export default VendorBookingsPage;