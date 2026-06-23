import { Card, CardContent, Stack, Typography } from '@mui/material';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

function StatsCard({ title, value, subtitle }: Props) {
  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)', borderRadius: 3, boxShadow: '0 14px 40px rgba(23,49,59,0.06)' }}>
      <CardContent>
        <Stack spacing={0.75}>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
