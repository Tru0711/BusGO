import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, CircularProgress, MenuItem } from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { apiRequest } from '../../utils/api';

type BusFormData = {
  busName: string;
  busNumber: string;
  busType: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper';
  totalSeats: number;
  amenities: string[];
};

function AddBusPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BusFormData>({
    busName: '',
    busNumber: '',
    busType: 'AC',
    totalSeats: 40,
    amenities: [],
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalSeats' ? parseInt(value as string) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.busName || !formData.busNumber || !formData.totalSeats) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.totalSeats < 10 || formData.totalSeats > 60) {
      setError('Total seats must be between 10 and 60');
      setLoading(false);
      return;
    }

    try {
      await apiRequest('/buses-static', {
        method: 'POST',
        body: formData,
      });
      setSuccess('Bus added successfully!');
      setFormData({
        busName: '',
        busNumber: '',
        busType: 'AC',
        totalSeats: 40,
        amenities: [],
      });
      setTimeout(() => {
        navigate('/vendor/manage-buses');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add bus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)', background: 'linear-gradient(135deg, rgba(11,107,203,0.08), rgba(11,107,203,0.02))' }}>
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
                  bgcolor: 'primary.main',
                  color: '#fff',
                }}
              >
                <AddCircleRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Add New Bus
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Add bus details once, then create multiple trips for it
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

              <TextField
                fullWidth
                label="Bus Name"
                placeholder="e.g., Express Bus 1"
                name="busName"
                value={formData.busName}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <TextField
                fullWidth
                label="Bus Number"
                placeholder="e.g., DL-01-AB-1234"
                name="busNumber"
                value={formData.busNumber}
                onChange={handleChange}
                disabled={loading}
                required
                helperText="Must be unique"
              />

              <TextField
                select
                fullWidth
                label="Bus Type"
                name="busType"
                value={formData.busType}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="AC">AC</MenuItem>
                <MenuItem value="Non-AC">Non-AC</MenuItem>
                <MenuItem value="Sleeper">Sleeper</MenuItem>
                <MenuItem value="Semi-Sleeper">Semi-Sleeper</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Total Seats"
                type="number"
                inputProps={{ min: 10, max: 60 }}
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                disabled={loading}
                required
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/vendor/manage-buses')} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleRoundedIcon />}
                >
                  {loading ? 'Adding...' : 'Add Bus'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AddBusPage;
