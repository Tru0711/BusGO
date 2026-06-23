import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { apiRequest } from '../../utils/api';
import { setStoredAuth } from '../../utils/auth';

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'vendor' | 'admin';
    phone?: string;
    companyName?: string;
    businessType?: string;
    address?: string;
    gstNumber?: string;
    serviceAreas?: string[];
  };
  message: string;
};

function VendorLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      setStoredAuth(response.token, response.user);
      setFeedback({ type: 'success', message: response.message || 'Login successful.' });

      if (response.user.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Login failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', py: 4, background: 'linear-gradient(180deg, #F7F4EE 0%, #EEF4F3 100%)' }}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Stack spacing={1} alignItems="center" textAlign="center">
                <LockRoundedIcon color="primary" sx={{ fontSize: 46 }} />
                <Typography variant="h4">Vendor Login</Typography>
                <Typography color="text.secondary">Access your operator dashboard with your verified account.</Typography>
              </Stack>

              {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField fullWidth label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                  <TextField fullWidth label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  <Button component={RouterLink} to="/vendor/signup" color="inherit">
                    Need a vendor account? Sign up
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

export default VendorLoginPage;