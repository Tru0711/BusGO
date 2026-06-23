import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { apiRequest } from '../../utils/api';

function VendorVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await apiRequest<{ message: string }>('/auth/verify-otp', {
        method: 'POST',
        body: { email, otp },
      });

      setFeedback({ type: 'success', message: response.message || 'Email Verified' });
      window.setTimeout(() => navigate('/vendor/login'), 900);
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Stack spacing={1} alignItems="center" textAlign="center">
                <VerifiedRoundedIcon color="primary" sx={{ fontSize: 46 }} />
                <Typography variant="h4">Verify Vendor Email</Typography>
                <Typography color="text.secondary">
                  Enter the email and OTP sent to your inbox.
                </Typography>
              </Stack>

              {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField fullWidth label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <TextField fullWidth label="OTP" value={otp} onChange={(event) => setOtp(event.target.value)} />
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                  <Button component={RouterLink} to="/vendor/login" color="inherit">
                    Back to Login
                  </Button>
                </Stack>
              </form>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default VendorVerifyPage;