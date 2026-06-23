import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AltRouteRoundedIcon from '@mui/icons-material/AltRouteRounded';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';

export type Journey = {
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
  journey: Journey;
  onOpenTicket: (journey: Journey) => void;
  onDownload: (id: string) => void;
  onTrack: (journey: Journey) => void;
};

function JourneyCard({ journey, onOpenTicket, onDownload, onTrack }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid rgba(23,49,59,0.10)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(15,118,110,0.04))',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 16px 40px rgba(23,49,59,0.10)' },
      }}
    >
      <CardContent>
        <Stack spacing={1.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {journey.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {journey.from} → {journey.to}
              </Typography>
            </Box>
            <Chip label={journey.status} color={journey.status === 'confirmed' ? 'success' : 'warning'} />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="text.secondary">Journey date</Typography>
              <Typography sx={{ fontWeight: 700 }}>{new Date(journey.journeyDate).toLocaleDateString()}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Departure</Typography>
              <Typography sx={{ fontWeight: 700 }}>{journey.departureTime}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Seats</Typography>
              <Typography sx={{ fontWeight: 700 }}>{journey.seatNumber.join(', ')}</Typography>
            </Box>
          </Stack>

          <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(15,118,110,0.06)', border: '1px dashed rgba(15,118,110,0.18)' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DirectionsBusRoundedIcon color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Live journey status and ticket access are ready here.
              </Typography>
            </Stack>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button variant="contained" startIcon={<QrCode2RoundedIcon />} onClick={() => onOpenTicket(journey)}>
              Ticket
            </Button>
            <Button variant="outlined" startIcon={<AltRouteRoundedIcon />} onClick={() => onTrack(journey)}>
              Track Bus
            </Button>
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={() => onDownload(journey.id)}>
              Download
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default JourneyCard;