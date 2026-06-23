import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';

export type RouteCardData = {
  from: string;
  to: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  reviewCount?: number;
  rating?: string | number;
};

type Props = {
  route: RouteCardData;
  onSelect?: (route: RouteCardData) => void;
  highlighted?: boolean;
};

function RouteCard({ route, onSelect, highlighted = false }: Props) {
  return (
    <Card
      elevation={0}
      onClick={() => onSelect?.(route)}
      sx={{
        cursor: onSelect ? 'pointer' : 'default',
        height: '100%',
        border: '1px solid rgba(23,49,59,0.10)',
        background: highlighted ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(15,118,110,0.06))' : 'rgba(255,255,255,0.86)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': onSelect ? { transform: 'translateY(-2px)', boxShadow: '0 14px 30px rgba(23,49,59,0.08)' } : undefined,
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Chip label={`${route.reviewCount || 0} reviews`} size="small" color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {route.from}
            </Typography>
            <TrendingFlatRoundedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {route.to}
            </Typography>
          </Stack>
          {(route.departureTime || route.arrivalTime) && (
            <Typography variant="body2" color="text.secondary">
              {route.departureTime} - {route.arrivalTime}
            </Typography>
          )}
          {route.price !== undefined && (
            <Typography sx={{ fontWeight: 800, color: 'secondary.main' }}>₹{route.price}</Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Rating: {route.rating || '0.0'} / 5
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default RouteCard;