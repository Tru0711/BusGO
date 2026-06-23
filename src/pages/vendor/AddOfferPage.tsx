import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { apiRequest } from '../../utils/api';

type OfferFormData = {
  label: string;
  title: string;
  description: string;
  discountPercent: number;
};

function AddOfferPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OfferFormData>({
    label: '',
    title: '',
    description: '',
    discountPercent: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'discountPercent' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.label || !formData.title || !formData.description || formData.discountPercent <= 0) {
      setError('Please fill in all fields with valid data');
      setLoading(false);
      return;
    }

    try {
      await apiRequest('/vendor/offers', {
        method: 'POST',
        body: formData,
      });
      setSuccess('Offer created successfully!');
      setFormData({ label: '', title: '', description: '', discountPercent: 0 });
      setTimeout(() => {
        navigate('/vendor/manage-offers');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create offer');
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
                  Create New Offer
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Add promotional offers for your buses
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
                label="Offer Label"
                placeholder="e.g., Weekend Special"
                name="label"
                value={formData.label}
                onChange={handleChange}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Offer Title"
                placeholder="e.g., Get 20% off on weekend travel"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={loading}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Offer Description"
                placeholder="Describe the offer details and terms..."
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Discount Percentage"
                type="number"
                inputProps={{ min: 1, max: 100 }}
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleChange}
                disabled={loading}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/vendor/manage-offers')} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleRoundedIcon />}
                >
                  {loading ? 'Creating...' : 'Create Offer'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default AddOfferPage;
