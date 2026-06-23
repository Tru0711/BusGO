import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, CircularProgress, MenuItem } from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { apiRequest } from '../../utils/api';

type Bus = {
  _id: string;
  busName: string;
  busNumber: string;
  totalSeats: number;
};

type TripFormData = {
  busId: string;
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
};

function AddTripPage() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [formData, setFormData] = useState<TripFormData>({
    busId: '',
    fromLocation: '',
    toLocation: '',
    travelDate: '',
    departureTime: '',
    arrivalTime: '',
    price: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [busesLoading, setBusesLoading] = useState(true);
  const [duration, setDuration] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    if (formData.departureTime && formData.arrivalTime) {
      calculateDuration();
    }
  }, [formData.departureTime, formData.arrivalTime]);

  const fetchBuses = async () => {
    try {
      const response = await apiRequest<{ buses: Bus[] }>('/buses-static');
      setBuses(response.buses || []);
    } catch (err) {
      setError('Failed to fetch buses');
      console.error(err);
    } finally {
      setBusesLoading(false);
    }
  };

  const calculateDuration = () => {
    const [depHour, depMin] = formData.departureTime.split(':').map(Number);
    const [arrHour, arrMin] = formData.arrivalTime.split(':').map(Number);

    let depTotalMin = depHour * 60 + depMin;
    let arrTotalMin = arrHour * 60 + arrMin;

    // If arrival is before departure, assume next day
    if (arrTotalMin <= depTotalMin) {
      arrTotalMin += 24 * 60;
    }

    const durationMin = arrTotalMin - depTotalMin;
    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;

    setDuration(`${hours}h ${mins}m`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.busId || !formData.fromLocation || !formData.toLocation || !formData.travelDate || !formData.departureTime || !formData.arrivalTime || !formData.price) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.departureTime === formData.arrivalTime) {
      setError('Departure and arrival times cannot be the same');
      setLoading(false);
      return;
    }

    try {
      await apiRequest('/trips', {
        method: 'POST',
        body: formData,
      });
      setSuccess('Trip added successfully!');
      setFormData({
        busId: '',
        fromLocation: '',
        toLocation: '',
        travelDate: '',
        departureTime: '',
        arrivalTime: '',
        price: 0,
      });
      setDuration('');
      setTimeout(() => {
        navigate('/vendor/manage-trips');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)', background: 'linear-gradient(135deg, rgba(255,138,61,0.08), rgba(255,138,61,0.02))' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2}>
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
                <AddCircleRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Add New Trip
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Create a trip schedule for your bus
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}

              {busesLoading ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : buses.length === 0 ? (
                <Alert severity="warning">
                  No buses found. Please <Button href="/vendor/add-bus-static">add a bus first</Button>
                </Alert>
              ) : (
                <>
                  <TextField
                    select
                    fullWidth
                    label="Select Bus"
                    name="busId"
                    value={formData.busId}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    {buses.map((bus) => (
                      <MenuItem key={bus._id} value={bus._id}>
                        {bus.busName} ({bus.busNumber}) - {bus.totalSeats} seats
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    label="From Location"
                    placeholder="e.g., Delhi"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />

                  <TextField
                    fullWidth
                    label="To Location"
                    placeholder="e.g., Mumbai"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Travel Date"
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleChange}
                    disabled={loading}
                    InputLabelProps={{ shrink: true }}
                    required
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Departure Time"
                      type="time"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleChange}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      required
                    />

                    <TextField
                      fullWidth
                      label="Arrival Time"
                      type="time"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Stack>

                  {duration && (
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                      Trip Duration: {duration}
                    </Typography>
                  )}

                  <TextField
                    fullWidth
                    label="Price per Seat"
                    type="number"
                    inputProps={{ min: 0, step: 0.01 }}
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => navigate('/vendor/manage-trips')} disabled={loading}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleRoundedIcon />}
                    >
                      {loading ? 'Adding...' : 'Add Trip'}
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AddTripPage;
