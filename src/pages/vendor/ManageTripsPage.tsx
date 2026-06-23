import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import { apiRequest } from '../../utils/api';

type Trip = {
  _id: string;
  busId: { busName: string; busNumber: string };
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: string;
};

function ManageTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await apiRequest<{ trips: Trip[] }>('/trips');
      setTrips(response.trips || []);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tripId: string) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;

    try {
      await apiRequest(`/trips/${tripId}`, { method: 'DELETE' });
      setTrips((prev) => prev.filter((t) => t._id !== tripId));
    } catch (err) {
      console.error('Failed to cancel trip:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'ongoing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)', background: 'linear-gradient(135deg, rgba(255,138,61,0.08), rgba(255,138,61,0.02))' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'secondary.main',
                    color: '#fff',
                  }}
                >
                  <DirectionsBusRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Manage Trips
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    View and manage all your bus trips
                  </Typography>
                </Box>
              </Box>
            </Stack>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleRoundedIcon />}
              onClick={() => navigate('/vendor/add-trip')}
            >
              Add New Trip
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Loading trips...
        </Typography>
      ) : trips.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(23,49,59,0.08)', textAlign: 'center' }}>
          <DirectionsBusRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No trips created yet
          </Typography>
          <Button variant="contained" startIcon={<AddCircleRoundedIcon />} onClick={() => navigate('/vendor/add-trip')}>
            Create First Trip
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {trips.map((trip) => (
            <Grid item xs={12} md={6} lg={4} key={trip._id}>
              <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flex: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {trip.fromLocation} → {trip.toLocation}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trip.busId.busName} ({trip.busId.busNumber})
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(trip._id)}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={trip.status} color={getStatusColor(trip.status)} size="small" />
                    </Stack>

                    <Stack spacing={1} sx={{ borderTop: '1px solid rgba(23,49,59,0.08)', pt: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(trip.travelDate).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {trip.departureTime} → {trip.arrivalTime}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Available Seats
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {trip.availableSeats}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Price per Seat
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          ₹{trip.price}
                        </Typography>
                      </Box>
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

export default ManageTripsPage;
