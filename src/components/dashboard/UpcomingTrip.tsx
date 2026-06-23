import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';

type Trip = {
  id: string;
  busName: string;
  from: string;
  to: string;
  journeyDate: string;
  departureTime: string;
  seatNumber: number[];
  status: string;
  price: number;
};

type Props = {
  trip: Trip;
};

const statusColor = (status: string) => {
  const value = String(status || '').toLowerCase();
  if (value === 'confirmed') return 'success';
  if (value === 'pending') return 'warning';
  if (value === 'cancelled') return 'error';
  return 'default';
};

function UpcomingTrip({ trip }: Props) {
  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)', borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{trip.busName}</Typography>
              <Typography variant="body2" color="text.secondary">Journey booking</Typography>
            </Box>
            <Chip label={trip.status} color={statusColor(trip.status)} />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontWeight: 700 }}>{trip.from}</Typography>
            <TrendingFlatRoundedIcon color="primary" />
            <Typography sx={{ fontWeight: 700 }}>{trip.to}</Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Date: {new Date(trip.journeyDate).toLocaleDateString()}</Typography>
            <Typography variant="body2" color="text.secondary">Departure: {trip.departureTime}</Typography>
            <Typography variant="body2" color="text.secondary">Seats: {trip.seatNumber.join(', ')}</Typography>
          </Stack>

          <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>₹{trip.price}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default UpcomingTrip;
