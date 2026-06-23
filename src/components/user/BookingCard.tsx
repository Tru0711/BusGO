import React from 'react';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

type BookingSummary = {
  id: string;
  busName: string;
  from: string;
  to: string;
  journeyDate: string;
  departureTime?: string;
  seatNumber: number[] | number;
  passengerName?: string;
  price?: number;
  status?: string;
  totalPrice?: number;
};

type Props = {
  booking: BookingSummary;
  onView?: (b: BookingSummary) => void;
  onDownload?: (id: string) => void;
  onCancel?: (id: string) => void;
};

const statusColor = (status?: string) => {
  const s = String(status || '').toLowerCase();
  if (s === 'confirmed') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'cancelled' || s === 'refunded') return 'error';
  return 'default';
};

export default function BookingCard({ booking, onView, onDownload, onCancel }: Props) {
  const seats = Array.isArray(booking.seatNumber) ? booking.seatNumber.join(', ') : String(booking.seatNumber || 'N/A');

  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{booking.busName}</Typography>
              <Typography color="text.secondary">{booking.from} → {booking.to}</Typography>
            </Box>
            <Stack spacing={1} alignItems="flex-end">
              <Chip label={booking.status || 'N/A'} color={statusColor(booking.status)} />
              <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>₹{booking.price ?? booking.totalPrice ?? 0}</Typography>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2">Journey: {new Date(booking.journeyDate).toLocaleDateString()}</Typography>
              <Typography variant="body2">Departure: {booking.departureTime || '-'}</Typography>
              <Typography variant="body2">Seats: {seats}</Typography>
              <Typography variant="body2">Passenger: {booking.passengerName || '—'}</Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={() => onView?.(booking)}>View Ticket</Button>
              <Button
                size="small"
                startIcon={<DownloadRoundedIcon />}
                variant="outlined"
                onClick={() => onDownload?.(booking.id)}
              >
                Download
              </Button>
              <Button
                size="small"
                startIcon={<CancelRoundedIcon />}
                color="error"
                variant="outlined"
                onClick={() => onCancel?.(booking.id)}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
