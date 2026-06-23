import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { apiRequest } from '../../utils/api';

type Bus = {
  _id: string;
  busName: string;
  busNumber: string;
  busType: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper';
  totalSeats: number;
  amenities: string[];
  isActive: boolean;
};

type BusForm = Omit<Bus, '_id'>;

const emptyForm: BusForm = {
  busName: '',
  busNumber: '',
  busType: 'AC',
  totalSeats: 40,
  amenities: [],
  isActive: true,
};

function ManageBusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [activeBusId, setActiveBusId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BusForm>(emptyForm);

  const loadBuses = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ buses: Bus[] }>('/buses-static');
      setBuses(response.buses);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load buses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBuses();
  }, []);

  const startEdit = (bus: Bus) => {
    setActiveBusId(bus._id);
    setEditForm({
      busName: bus.busName,
      busNumber: bus.busNumber,
      busType: bus.busType,
      totalSeats: bus.totalSeats,
      amenities: bus.amenities,
      isActive: bus.isActive,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!activeBusId) return;

    try {
      await apiRequest(`/buses-static/${activeBusId}`, {
        method: 'PUT',
        body: editForm,
      });
      setFeedback({ type: 'success', message: 'Bus updated successfully.' });
      setEditOpen(false);
      await loadBuses();
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to update bus.' });
    }
  };

  const handleDelete = async (busId: string) => {
    if (!window.confirm('Delete this bus?')) return;

    try {
      await apiRequest(`/buses-static/${busId}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Bus deleted successfully.' });
      await loadBuses();
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete bus.' });
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Manage Buses</Typography>
        <Typography color="text.secondary">Edit routes or remove buses that are no longer active.</Typography>
      </Box>

      {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

      <Grid container spacing={2.5}>
        {loading && <Grid item xs={12}><Typography>Loading buses...</Typography></Grid>}
        {!loading && buses.length === 0 && <Grid item xs={12}><Typography color="text.secondary">No buses found.</Typography></Grid>}
        {buses.map((bus) => (
          <Grid item xs={12} md={6} key={bus._id}>
            <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h6">{bus.busName}</Typography>
                    <Typography color="text.secondary">Bus #{bus.busNumber}</Typography>
                  </Box>
                  <Typography variant="body2">Type: {bus.busType} | Seats: {bus.totalSeats}</Typography>
                  <Typography variant="body2">Status: {bus.isActive ? '✓ Active' : '✗ Inactive'}</Typography>
                  {bus.amenities.length > 0 && (
                    <Typography variant="body2">Amenities: {bus.amenities.join(', ')}</Typography>
                  )}
                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<EditRoundedIcon />} variant="outlined" onClick={() => startEdit(bus)}>
                      Edit Bus
                    </Button>
                    <Button startIcon={<DeleteRoundedIcon />} color="error" variant="outlined" onClick={() => handleDelete(bus._id)}>
                      Delete Bus
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Bus</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Bus Name" value={editForm.busName} onChange={(event) => setEditForm((current) => ({ ...current, busName: event.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Bus Number" value={editForm.busNumber} onChange={(event) => setEditForm((current) => ({ ...current, busNumber: event.target.value }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth select label="Bus Type" value={editForm.busType} onChange={(event) => setEditForm((current) => ({ ...current, busType: event.target.value as 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper' }))} SelectProps={{ native: true }}>
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Semi-Sleeper">Semi-Sleeper</option>
            </TextField></Grid>
            <Grid item xs={12}><TextField fullWidth label="Total Seats" type="number" value={editForm.totalSeats} onChange={(event) => setEditForm((current) => ({ ...current, totalSeats: Number(event.target.value) }))} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Amenities (comma-separated)" value={editForm.amenities.join(', ')} onChange={(event) => setEditForm((current) => ({ ...current, amenities: event.target.value.split(',').map(a => a.trim()) }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default ManageBusesPage;