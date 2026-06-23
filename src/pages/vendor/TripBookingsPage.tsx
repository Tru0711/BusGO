import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TextField, Stack, Typography, IconButton, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import { apiRequest } from '../../utils/api';

function exportCsv(rows: any[]) {
  const headers = ['Passenger Name', 'Seat Numbers', 'Booking ID', 'Payment Status', 'Booking Status', 'Amount Paid', 'Created At'];
  const csv = [headers.join(',')].concat(rows.map((r) => [r.passengerName, `"${r.seatNumbers.join(';')}"`, r.bookingId, r.paymentStatus, r.bookingStatus, r.amountPaid, new Date(r.createdAt).toLocaleString()].join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trip-bookings.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function TripBookingsPage() {
  const { tripId } = useParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const navigate = useNavigate();

  const fetchBookings = () => {
    setLoading(true);
    apiRequest<{ bookings: any[] }>(`/vendor/trips/${tripId}/bookings?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
      .then((data) => setBookings(data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [tripId, page]);

  const rows = useMemo(() => bookings, [bookings]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Trip Bookings</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" placeholder="Search passengers or booking id" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="outlined" onClick={() => { setPage(1); fetchBookings(); }}>Search</Button>
          <IconButton color="primary" onClick={() => exportCsv(rows)}><DownloadIcon /></IconButton>
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          {loading ? <CircularProgress /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Passenger</TableCell>
                  <TableCell>Seat</TableCell>
                  <TableCell>Booking ID</TableCell>
                  <TableCell>Payment Status</TableCell>
                  <TableCell>Booking Status</TableCell>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.passengerName}</TableCell>
                    <TableCell>{r.seatNumbers.join(', ')}</TableCell>
                    <TableCell>{r.bookingId}</TableCell>
                    <TableCell>{r.paymentStatus}</TableCell>
                    <TableCell>{r.bookingStatus}</TableCell>
                    <TableCell>{r.amountPaid}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => navigate(`/vendor/bookings`)}>View Details</Button>
                      <Button size="small">Refund</Button>
                      <Button size="small">Contact</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TripBookingsPage;
