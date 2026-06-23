import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { apiRequest } from '../../utils/api';

type AdminBooking = {
  id: string;
  userName: string;
  userEmail?: string;
  busName: string;
  route?: string;
  seats: number;
  date: string;
  bookingStatus?: string;
  transactionStatus?: string;
  refundStatus?: string;
  totalPrice?: number;
  refundedAmount?: number;
  remainingRefundableAmount?: number;
  paymentId?: string | null;
  paymentRecordId?: string | null;
  isRefundEligible?: boolean;
  refundHistory?: Array<{
    id: string;
    amount: number;
    reason: string;
    refundType: 'full' | 'partial';
    status: 'requested' | 'processing' | 'completed' | 'failed' | 'rejected';
    providerRefundId?: string | null;
    refundedAt?: string | null;
    processedAt?: string | null;
    failureReason?: string | null;
  }>;
};

function Bookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('partial');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundMessage, setRefundMessage] = useState('');

  const refundableAmount = useMemo(() => selectedBooking?.remainingRefundableAmount || 0, [selectedBooking]);

  useEffect(() => {
    apiRequest<{ bookings: AdminBooking[] }>('/admin/bookings')
      .then((response) => setBookings(response.bookings))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Typography>Loading bookings...</Typography>;

  const openRefundDialog = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setRefundType('partial');
    setRefundAmount(String(booking.remainingRefundableAmount || 0));
    setRefundReason('');
    setRefundMessage('');
    setRefundDialogOpen(true);
  };

  const closeRefundDialog = () => {
    if (refundLoading) return;
    setRefundDialogOpen(false);
    setSelectedBooking(null);
    setRefundMessage('');
  };

  const submitRefund = async () => {
    if (!selectedBooking) return;

    const amountValue = Number(refundType === 'full' ? selectedBooking.remainingRefundableAmount || 0 : refundAmount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setRefundMessage('Enter a valid refund amount.');
      return;
    }

    if (!refundReason.trim()) {
      setRefundMessage('Refund reason is required.');
      return;
    }

    setRefundLoading(true);
    setRefundMessage('');

    try {
      const response = await apiRequest<{ refund: { id: string; status: string } }>(`/payments/refund/${selectedBooking.id}`, {
        method: 'POST',
        body: {
          amount: amountValue,
          reason: refundReason,
          refundType,
        },
      });

      setRefundMessage(response.refund.status === 'completed' ? 'Refund completed successfully.' : 'Refund initiated and is processing.');
      setBookings((current) =>
        current.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                refundStatus: response.refund.status,
              }
            : booking,
        ),
      );
      const refreshed = await apiRequest<{ bookings: AdminBooking[] }>('/admin/bookings');
      setBookings(refreshed.bookings);
      setTimeout(() => closeRefundDialog(), 1200);
    } catch (refundError) {
      setRefundMessage(refundError instanceof Error ? refundError.message : 'Refund failed.');
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        Bookings
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {bookings.length === 0 ? (
        <Typography color="text.secondary">No bookings found.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Bus Name</TableCell>
              <TableCell>Seats</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Refund</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.userName}</TableCell>
                <TableCell>{booking.route || 'N/A'}</TableCell>
                <TableCell>{booking.busName}</TableCell>
                <TableCell>{booking.seats}</TableCell>
                <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip size="small" label={booking.bookingStatus || 'confirmed'} />
                    <Chip size="small" color="secondary" variant="outlined" label={booking.refundStatus || 'none'} />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => openRefundDialog(booking)} disabled={!booking.isRefundEligible}>
                    Refund
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={refundDialogOpen} onClose={closeRefundDialog} fullWidth maxWidth="sm">
        <DialogTitle>Refund booking</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {selectedBooking && (
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Booking: {selectedBooking.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Refunded: ₹{selectedBooking.refundedAmount || 0} / ₹{selectedBooking.totalPrice || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Remaining refundable: ₹{refundableAmount}
                </Typography>
              </Stack>
            )}

            <TextField select label="Refund Type" value={refundType} onChange={(event) => setRefundType(event.target.value as 'full' | 'partial')}>
              <MenuItem value="partial">Partial refund</MenuItem>
              <MenuItem value="full">Full refund</MenuItem>
            </TextField>

            <TextField
              label="Refund amount"
              type="number"
              value={refundType === 'full' ? refundableAmount : refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
              disabled={refundType === 'full'}
              inputProps={{ min: 1, max: refundableAmount, step: 1 }}
            />

            <TextField
              label="Reason"
              value={refundReason}
              onChange={(event) => setRefundReason(event.target.value)}
              multiline
              minRows={3}
              placeholder="Enter the refund reason"
            />

            {refundMessage && <Alert severity={refundMessage.toLowerCase().includes('fail') ? 'error' : 'info'}>{refundMessage}</Alert>}

            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Refund history
              </Typography>
              {selectedBooking?.refundHistory?.length ? (
                selectedBooking.refundHistory.map((refund) => (
                  <Stack key={refund.id} spacing={0.5} sx={{ p: 1.5, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{refund.amount} • {refund.refundType}
                      </Typography>
                      <Chip size="small" label={refund.status} color={refund.status === 'completed' ? 'success' : refund.status === 'failed' ? 'error' : 'warning'} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {refund.reason}
                    </Typography>
                    {refund.providerRefundId && (
                      <Typography variant="caption" color="text.secondary">
                        Provider refund ID: {refund.providerRefundId}
                      </Typography>
                    )}
                  </Stack>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No refund history yet.
                </Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRefundDialog} disabled={refundLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submitRefund} disabled={refundLoading || !selectedBooking?.isRefundEligible}>
            {refundLoading ? 'Processing...' : 'Process refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default Bookings;