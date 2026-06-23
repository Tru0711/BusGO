import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';

type BusForm = {
  busName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
  totalSeats: string;
};

function AddBusPage() {
  const [form, setForm] = useState<BusForm>({
    busName: '',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    totalSeats: '',
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof BusForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await apiRequest('/vendor/add-bus', {
        method: 'POST',
          body: form,
      });

      setFeedback({ type: 'success', message: 'Bus added successfully.' });
      setForm({ busName: '', source: '', destination: '', departureTime: '', arrivalTime: '', price: '', totalSeats: '' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to add bus.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Add Bus</Typography>
            <Typography color="text.secondary">Create a new schedule for your operator account.</Typography>
          </Box>

          {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField fullWidth label="Bus Name" value={form.busName} onChange={updateField('busName')} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Source" value={form.source} onChange={updateField('source')} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Destination" value={form.destination} onChange={updateField('destination')} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Departure Time" value={form.departureTime} onChange={updateField('departureTime')} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Arrival Time" value={form.arrivalTime} onChange={updateField('arrivalTime')} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Price" type="number" value={form.price} onChange={updateField('price')} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Total Seats" type="number" value={form.totalSeats} onChange={updateField('totalSeats')} /></Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : 'Save Bus'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AddBusPage;