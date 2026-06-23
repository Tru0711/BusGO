import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';

type Bus = {
  id: string;
  tripId?: string;
  busName: string;
  busNumber?: string;
  busType?: string;
  amenities?: string[];
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
};

function BusListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const source = queryParams.get('source') || '';
  const destination = queryParams.get('destination') || '';
  const date = queryParams.get('date') || '';

  useEffect(() => {
    if (!source || !destination || !date) {
      setError('Missing source, destination, or date. Please search again.');
      setLoading(false);
      return;
    }

    apiRequest<{ buses: Bus[] }>(`/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`)
      .then((response) => setBuses(response.buses))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to search buses.'))
      .finally(() => setLoading(false));
  }, [source, destination, date]);

  if (loading) return <Typography>Loading buses...</Typography>;

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Available Buses</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {!error && buses.length === 0 && <Typography color="text.secondary">No buses found for this route/date.</Typography>}
      <Grid container spacing={2.5}>
        {buses.map((bus) => (
          <Grid item xs={12} md={6} key={bus.id}>
            <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
              <CardContent>
                <Stack spacing={1.2}>
                  <Typography variant="h6">{bus.busName}</Typography>
                  <Typography>{bus.source} to {bus.destination}</Typography>
                  <Typography variant="body2" color="text.secondary">Departure: {bus.departureTime} | Arrival: {bus.arrivalTime}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bus.busNumber ? `${bus.busNumber} • ` : ''}{bus.busType || 'Standard Coach'}
                  </Typography>
                  {!!bus.amenities?.length && (
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {bus.amenities.slice(0, 4).map((amenity) => (
                        <Chip key={`${bus.id}-${amenity}`} label={amenity} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  )}
                  <Typography variant="body2">Price: ₹{bus.price}</Typography>
                  <Typography variant="body2">Available Seats: {bus.availableSeats}</Typography>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      disabled={bus.availableSeats === 0}
                      onClick={() => navigate(`/seat-selection/${bus.tripId || bus.id}?date=${encodeURIComponent(date)}`)}
                    >
                      {bus.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default BusListPage;