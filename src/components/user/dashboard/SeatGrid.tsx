import { Box, Chip, Stack, Typography } from '@mui/material';

type SeatStatus = 'available' | 'booked' | 'reserved' | 'selected' | 'female-only';

type SeatItem = {
  seatNumber: number;
  status: SeatStatus;
  lockExpiresAt?: string | null;
};

type Props = {
  seats: SeatItem[];
  totalSeats: number;
  selectedSeats: number[];
  onToggle: (seatNumber: number) => void;
};

const legend = [
  { label: 'Available', status: 'available' },
  { label: 'Booked', status: 'booked' },
  { label: 'Locked', status: 'reserved' },
  { label: 'Selected', status: 'selected' },
  { label: 'Female only', status: 'female-only' },
] as const;

const getColors = (status: SeatStatus) => {
  switch (status) {
    case 'booked':
      return { bgcolor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' };
    case 'reserved':
      return { bgcolor: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' };
    case 'selected':
      return { bgcolor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' };
    case 'female-only':
      return { bgcolor: '#FCE7F3', color: '#9D174D', border: '1px solid #F9A8D4' };
    default:
      return { bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' };
  }
};

function SeatGrid({ seats, totalSeats, selectedSeats, onToggle }: Props) {
  const seatMap = new Map(seats.map((seat) => [seat.seatNumber, seat]));

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {legend.map((item) => (
          <Chip key={item.label} label={item.label} size="small" variant="outlined" />
        ))}
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 1.1,
          p: 2,
          borderRadius: 3,
          bgcolor: 'rgba(15,118,110,0.03)',
          border: '1px solid rgba(23,49,59,0.08)',
        }}
      >
        {Array.from({ length: totalSeats }, (_, index) => index + 1).map((seatNumber) => {
          const seat = seatMap.get(seatNumber);
          const status = selectedSeats.includes(seatNumber) ? 'selected' : (seat?.status || 'available');
          const disabled = status === 'booked' || status === 'reserved' || status === 'female-only';
          const colors = getColors(status as SeatStatus);

          return (
            <Box
              key={seatNumber}
              onClick={() => !disabled && onToggle(seatNumber)}
              sx={{
                minHeight: 56,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                userSelect: 'none',
                bgcolor: colors.bgcolor,
                color: colors.color,
                border: colors.border,
                fontWeight: 700,
                opacity: disabled ? 0.72 : 1,
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': disabled ? undefined : { transform: 'translateY(-1px)', boxShadow: '0 8px 16px rgba(23,49,59,0.08)' },
              }}
            >
              {seatNumber}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}

export default SeatGrid;