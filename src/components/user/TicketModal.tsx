import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';

type Props = {
  open: boolean;
  bookingId?: string;
  onClose: () => void;
};

export default function TicketModal({ open, bookingId, onClose }: Props) {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || !bookingId) return;
    setLoading(true);
    apiRequest<{ booking: any }>(`/bookings/${bookingId}`)
      .then((resp) => {
        const b = resp.booking;
        const lines = [
          `Booking ID: ${b.id}`,
          `Passenger: ${b.passengerName || b.user?.name || ''}`,
          `Bus: ${b.busName || b.bus?.busName || ''}`,
          `Route: ${b.from} -> ${b.to}`,
          `Journey Date: ${new Date(b.journeyDate || b.date).toLocaleDateString()}`,
          `Departure: ${b.departureTime || ''}`,
          `Seats: ${(b.seatNumber || b.seats || []).join(', ')}`,
          `Price: ₹${b.price || b.totalPrice || 0}`,
          `Status: ${b.status || b.bookingStatus}`,
        ];
        setContent(lines.join('\n'));
      })
      .catch(() => setContent('Failed to load ticket.'))
      .finally(() => setLoading(false));
  }, [open, bookingId]);

  const handleDownload = async () => {
    if (!bookingId) return;
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/bookings/${bookingId}/ticket`;
      // open in new tab to download
      window.open(url, '_blank');
    } catch (e) {
      // ignore
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ticket</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {loading ? <Typography>Loading ticket...</Typography> : <Typography>{content}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownload} variant="contained">Download</Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
