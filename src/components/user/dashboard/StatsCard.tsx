import { Card, CardContent, Stack, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  accent?: 'teal' | 'amber' | 'blue' | 'rose' | 'violet';
};

const accentMap = {
  teal: 'linear-gradient(135deg, rgba(15,118,110,0.16), rgba(15,118,110,0.05))',
  amber: 'linear-gradient(135deg, rgba(245,158,11,0.20), rgba(245,158,11,0.06))',
  blue: 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(37,99,235,0.05))',
  rose: 'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(244,63,94,0.05))',
  violet: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.05))',
} as const;

function StatsCard({ title, value, subtitle, icon, accent = 'teal' }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid rgba(23,49,59,0.10)',
        background: accentMap[accent],
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 40px rgba(23,49,59,0.10)' },
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255,255,255,0.68)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default StatsCard;