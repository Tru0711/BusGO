import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';

export type BusSearchResult = {
  id: string;
  tripId?: string;
  busName: string;
  busNumber?: string;
  busType?: string;
  amenities?: string[];
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  rating?: number | string;
  reviewCount?: number;
  offerLabel?: string;
};

type Props = {
  bus: BusSearchResult;
  onViewSeats: (bus: BusSearchResult) => void;
};

const calculateDuration = (departure: string, arrival: string) => {
  const toMinutes = (value: string) => {
    const match = String(value || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const start = toMinutes(departure);
  const end = toMinutes(arrival);
  if (start === null || end === null) return 'Live';
  const diff = (end - start + 24 * 60) % (24 * 60);
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${minutes}m`;
};

function BusCard({ bus, onViewSeats }: Props) {
  const amenities = (bus.amenities || []).slice(0, 4);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid rgba(23,49,59,0.10)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 18px 40px rgba(23,49,59,0.10)' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {bus.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {bus.busNumber ? `${bus.busNumber} • ` : ''}
                {bus.busType || 'Standard Coach'}
              </Typography>
            </Box>
            <Stack spacing={0.5} alignItems="flex-end">
              {bus.offerLabel ? <Chip label={bus.offerLabel} color="secondary" size="small" /> : null}
              <Stack direction="row" spacing={0.5} alignItems="center">
                <StarRoundedIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {bus.rating || '4.4'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({bus.reviewCount || 0})
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.2} flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontWeight: 700 }}>{bus.source}</Typography>
            <ArrowForwardRoundedIcon color="primary" />
            <Typography sx={{ fontWeight: 700 }}>{bus.destination}</Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <AccessTimeRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">
                {bus.departureTime} - {bus.arrivalTime}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <EventSeatRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">{bus.availableSeats} seats</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Duration: {calculateDuration(bus.departureTime, bus.arrivalTime)}
            </Typography>
          </Stack>

          {amenities.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {amenities.map((item) => (
                <Chip key={`${bus.id}-${item}`} label={item} size="small" variant="outlined" />
              ))}
            </Stack>
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Starting from
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                ₹{bus.price}
              </Typography>
            </Box>
            <Button variant="contained" onClick={() => onViewSeats(bus)}>
              View Seats
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default BusCard;