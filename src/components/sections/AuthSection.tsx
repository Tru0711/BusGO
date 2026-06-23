import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import SectionTitle from '../common/SectionTitle';

type AuthMode = 'login' | 'signup' | 'forgot';

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

function AuthSection() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginRemember, setLoginRemember] = useState(true);
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateSignup = () => {
    const nextErrors: FormErrors = {};

    if (!signupData.name.trim()) {
      nextErrors.name = 'Full name is required.';
    }

    if (!signupData.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (signupData.phone && signupData.phone.replace(/\D/g, '').length < 10) {
      nextErrors.phone = 'Enter a valid phone number.';
    }

    if (signupData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (signupData.confirmPassword !== signupData.password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateLogin = () => {
    const nextErrors: FormErrors = {};

    if (!loginData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!loginData.password.trim()) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateSignup()) {
      setErrors({});
    }
  };

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateLogin()) {
      setErrors({});
    }
  };

  const handleForgotSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!forgotEmail.trim()) {
      setErrors({ email: 'Email is required.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErrors({ email: 'Enter a valid email address.' });
      return;
    }

    setErrors({});
  };

  return (
    <Box
      component="section"
      id="auth"
      sx={{
        scrollMarginTop: 110,
        py: { xs: 2, md: 4 },
      }}
    >
      <SectionTitle
        eyebrow="Authentication"
        title="Login and signup in one centered card"
        subtitle="This section covers user registration, secure login, and forgot-password flow with a clean interface and clear validation cues."
      />

      <Card
        elevation={0}
        sx={{
          overflow: 'hidden',
          border: '1px solid rgba(23, 49, 59, 0.08)',
          background:
            'linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
        }}
      >
        <Grid container>
          <Grid item xs={12} md={5} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#17313B', color: '#FFFFFF' }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="overline" sx={{ letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)' }}>
                  Secure access
                </Typography>
                <Typography variant="h4" component="h2" sx={{ mt: 1, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
                  Your account, protected and easy to use
                </Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.82)' }}>
                Add authentication to show registration, login, and password recovery in a clear viva-friendly UI.
              </Typography>
              <Stack spacing={1.5}>
                {[
                  'Password encryption with bcrypt on the backend',
                  'JWT sessions for login persistence',
                  'Protected routes for booking-only access',
                  'OTP or reset link for forgot password flow',
                ].map((item) => (
                  <Stack key={item} direction="row" spacing={1.25} alignItems="flex-start">
                    <Box sx={{ mt: 0.5, width: 10, height: 10, borderRadius: '50%', bgcolor: 'secondary.main', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.84)' }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#FFFDF9' }}>
            <Tabs
              value={mode}
              onChange={(_, value) => {
                setMode(value);
                setErrors({});
              }}
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab value="login" label="Login" />
              <Tab value="signup" label="Signup" />
              <Tab value="forgot" label="Forgot Password" />
            </Tabs>

            <Stack spacing={2.5}>
              {mode === 'login' && (
                <Card variant="outlined" sx={{ borderColor: 'rgba(23,49,59,0.12)' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack component="form" spacing={2} onSubmit={handleLoginSubmit}>
                      <TextField
                        label="Email"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={(event) => setLoginData((current) => ({ ...current, email: event.target.value }))}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon /></InputAdornment> }}
                      />
                      <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(event) => setLoginData((current) => ({ ...current, password: event.target.value }))}
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><LockRoundedIcon /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword((current) => !current)} edge="end" aria-label="toggle password visibility">
                                {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <FormControlLabel
                          control={<Checkbox checked={loginRemember} onChange={(event) => setLoginRemember(event.target.checked)} />}
                          label="Remember me"
                        />
                        <Button variant="text" onClick={() => setMode('forgot')} sx={{ px: 0 }}>
                          Forgot password?
                        </Button>
                      </Stack>
                      <Button type="submit" variant="contained" size="large" fullWidth>
                        Login
                      </Button>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        New user?{' '}
                        <Link component="button" type="button" onClick={() => setMode('signup')} sx={{ fontWeight: 700 }}>
                          Create an account
                        </Link>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {mode === 'signup' && (
                <Card variant="outlined" sx={{ borderColor: 'rgba(23,49,59,0.12)' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack component="form" spacing={2} onSubmit={handleSignupSubmit}>
                      <TextField
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={signupData.name}
                        onChange={(event) => setSignupData((current) => ({ ...current, name: event.target.value }))}
                        error={Boolean(errors.name)}
                        helperText={errors.name}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonRoundedIcon /></InputAdornment> }}
                      />
                      <TextField
                        label="Email Address"
                        placeholder="Enter your email"
                        value={signupData.email}
                        onChange={(event) => setSignupData((current) => ({ ...current, email: event.target.value }))}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon /></InputAdornment> }}
                      />
                      <TextField
                        label="Phone Number"
                        placeholder="Optional"
                        value={signupData.phone}
                        onChange={(event) => setSignupData((current) => ({ ...current, phone: event.target.value }))}
                        error={Boolean(errors.phone)}
                        helperText={errors.phone || 'Optional, useful for OTP verification.'}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneRoundedIcon /></InputAdornment> }}
                      />
                      <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={(event) => setSignupData((current) => ({ ...current, password: event.target.value }))}
                        error={Boolean(errors.password)}
                        helperText={errors.password || 'Use 6 or more characters.'}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><LockRoundedIcon /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword((current) => !current)} edge="end" aria-label="toggle password visibility">
                                {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={signupData.confirmPassword}
                        onChange={(event) => setSignupData((current) => ({ ...current, confirmPassword: event.target.value }))}
                        error={Boolean(errors.confirmPassword)}
                        helperText={errors.confirmPassword}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><KeyRoundedIcon /></InputAdornment>,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword((current) => !current)} edge="end" aria-label="toggle confirm password visibility">
                                {showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button type="submit" variant="contained" color="secondary" size="large" fullWidth>
                        Sign Up
                      </Button>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Already have an account?{' '}
                        <Link component="button" type="button" onClick={() => setMode('login')} sx={{ fontWeight: 700 }}>
                          Login here
                        </Link>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {mode === 'forgot' && (
                <Card variant="outlined" sx={{ borderColor: 'rgba(23,49,59,0.12)' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack component="form" spacing={2} onSubmit={handleForgotSubmit}>
                      <Alert severity="info" sx={{ alignItems: 'center' }}>
                        Enter your email to receive a reset link or OTP for password recovery.
                      </Alert>
                      <TextField
                        label="Email Address"
                        placeholder="Enter your email"
                        value={forgotEmail}
                        onChange={(event) => setForgotEmail(event.target.value)}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailRoundedIcon /></InputAdornment> }}
                      />
                      <Button type="submit" variant="contained" size="large" startIcon={<KeyRoundedIcon />}>
                        Send Reset Link
                      </Button>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Remembered your password?{' '}
                        <Link component="button" type="button" onClick={() => setMode('login')} sx={{ fontWeight: 700 }}>
                          Return to login
                        </Link>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default AuthSection;
