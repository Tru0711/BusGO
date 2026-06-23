import { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';
import { setStoredAuth } from '../../utils/auth';

type AdminLoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin';
  };
  message: string;
};

type AdminLoginProps = {
  onLoginSuccess: () => void;
};

function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setErrorMessage('Email is required.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Enter a valid email address.');
      return false;
    }

    if (!password.trim()) {
      setErrorMessage('Password is required.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await apiRequest<AdminLoginResponse>('/admin/login', {
        method: 'POST',
        body: { email, password },
      });

      setStoredAuth(response.token, response.user);
      onLoginSuccess();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, backgroundColor: '#f7f4ee' }}>
      <Card elevation={0} sx={{ width: '100%', maxWidth: 420, border: '1px solid rgba(23,49,59,0.10)' }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Admin Login
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Sign in to access the admin dashboard.
              </Typography>
            </Box>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth />
                <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth />
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminLogin;