import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

function RefundStatusPage() {
  const { status = 'pending', refundId = '' } = useParams();

  const normalizedStatus = useMemo(() => String(status).toLowerCase(), [status]);

  const color = normalizedStatus === 'success' || normalizedStatus === 'completed' ? 'success' : normalizedStatus === 'failed' ? 'error' : 'warning';
  const title = normalizedStatus === 'success' || normalizedStatus === 'completed' ? 'Refund successful' : normalizedStatus === 'failed' ? 'Refund failed' : 'Refund pending';
  const message =
    normalizedStatus === 'success' || normalizedStatus === 'completed'
      ? 'The refund has been processed successfully. The amount will reflect in your payment method according to your bank timeline.'
      : normalizedStatus === 'failed'
        ? 'The refund could not be completed. Please contact support or try again if the refund is still eligible.'
        : 'Your refund request is being processed. This page will remain valid until the provider completes the transaction.';

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '70vh', py: 6 }}>
      <Card sx={{ width: '100%', maxWidth: 720, borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5}>
            <Chip label={normalizedStatus.toUpperCase()} color={color} sx={{ width: 'fit-content' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            <Alert severity={color}>{message}</Alert>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Refund reference
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {refundId || 'N/A'}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default RefundStatusPage;
