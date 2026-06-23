import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import { apiRequest } from '../../utils/api';

type LiveTrip = {
  _id: string;
  busId?: { busName?: string; busNumber?: string; busType?: string };
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  rating?: string;
  reviewCount?: number;
};

function UserHomePage() {
  const [trips, setTrips] = useState<LiveTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ trips: LiveTrip[] }>('/trips/public/search')
      .then((response) => setTrips(response.trips || []))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to load live routes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Live Routes
        </Typography>
        <Typography color="text.secondary">This page shows real-time routes from current trips only.</Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Typography color="text.secondary">Loading live routes...</Typography>
      ) : trips.length === 0 ? (
        <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>No live routes available</Typography>
            <Typography color="text.secondary">Vendors can add trips and they will appear here.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {trips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip._id}>
              <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{trip.busId?.busName || 'Bus'}</Typography>
                        <Typography color="text.secondary">{trip.busId?.busNumber || trip.busId?.busType || 'Live inventory'}</Typography>
                      </Box>
                      <Chip label={`${trip.availableSeats} seats`} color="primary" />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{trip.fromLocation}</Typography>
                      <TrendingFlatRoundedIcon color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{trip.toLocation}</Typography>
                    </Stack>

                    <Typography color="text.secondary">{trip.departureTime} - {trip.arrivalTime}</Typography>
                    <Typography color="text.secondary">Journey date: {new Date(trip.travelDate).toLocaleDateString()}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 800 }}>₹{trip.price}</Typography>
                      <Button component={RouterLink} to={`/seat-selection/${trip._id}`} variant="contained">View Seats</Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

export default UserHomePage;
