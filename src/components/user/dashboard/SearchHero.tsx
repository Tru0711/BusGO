import { Box, Button, Card, Chip, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

export type SearchFormState = {
  from: string;
  to: string;
  date: string;
};

type RouteShortcut = {
  from: string;
  to: string;
  price?: number;
};

type Props = {
  form: SearchFormState;
  loading?: boolean;
  recentSearches: SearchFormState[];
  popularRoutes: RouteShortcut[];
  onChange: (next: Partial<SearchFormState>) => void;
  onSwap: () => void;
  onSearch: () => void;
  onUseRoute: (route: RouteShortcut) => void;
};

function SearchHero({ form, loading, recentSearches, popularRoutes, onChange, onSwap, onSearch, onUseRoute }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(23,49,59,0.10)',
        background: 'linear-gradient(135deg, rgba(15,118,110,0.96), rgba(13,36,57,0.98))',
        color: '#FFFFFF',
        boxShadow: '0 24px 70px rgba(13,36,57,0.18)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(245,158,11,0.32), transparent 28%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 32%)',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative', p: { xs: 2.5, md: 4 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} lg={5}>
            <Stack spacing={1.5}>
              <Chip
                icon={<LocationOnRoundedIcon sx={{ color: 'inherit !important' }} />}
                label="Live search • instant booking"
                sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.05, fontSize: { xs: '2rem', md: '3.25rem' } }}>
                Book your next bus with one smart dashboard.
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.82)', maxWidth: 640 }}>
                Search routes, review bookings, follow live journey updates, and manage tickets without leaving the dashboard.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {recentSearches.slice(0, 3).map((item) => (
                  <Chip
                    key={`${item.from}-${item.to}-${item.date}`}
                    icon={<HistoryRoundedIcon sx={{ color: 'inherit !important' }} />}
                    label={`${item.from} → ${item.to}`}
                    onClick={() => onUseRoute(item)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff' }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Box sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(16px)' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="From"
                    value={form.from}
                    onChange={(event) => onChange({ from: event.target.value })}
                    placeholder="Enter source city"
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.85)' } }}
                    InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' } }}
                  />
                </Grid>
                <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <IconButton
                    onClick={onSwap}
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: 'rgba(255,255,255,0.16)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.16)',
                    }}
                  >
                    <SwapHorizRoundedIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="To"
                    value={form.to}
                    onChange={(event) => onChange({ to: event.target.value })}
                    placeholder="Enter destination city"
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.85)' } }}
                    InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' } }}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Travel Date"
                    type="date"
                    value={form.date}
                    onChange={(event) => onChange({ date: event.target.value })}
                    InputLabelProps={{ shrink: true, sx: { color: 'rgba(255,255,255,0.85)' } }}
                    InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' } }}
                  />
                </Grid>
                <Grid item xs={12} md={7}>
                  <Button
                    onClick={onSearch}
                    disabled={loading}
                    variant="contained"
                    size="large"
                    startIcon={<SearchRoundedIcon />}
                    fullWidth
                    sx={{ height: 56, bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }}
                  >
                    {loading ? 'Searching...' : 'Search Buses'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        <Stack spacing={1.25} sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', fontWeight: 700 }}>
            Popular routes
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {popularRoutes.map((route) => (
              <Chip
                key={`${route.from}-${route.to}`}
                label={`${route.from} → ${route.to}${route.price ? ` • ₹${route.price}` : ''}`}
                onClick={() => onUseRoute(route)}
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' } }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}

export default SearchHero;