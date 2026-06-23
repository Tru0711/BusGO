import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  AppBar,
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
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import DirectionsBusRoundedIcon from '@mui/icons-material/DirectionsBusRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

type AuthMode = 'login' | 'signup' | 'forgot';

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
};

type ForgotStep = 'request' | 'reset';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/auth';

function getMode(pathname: string): AuthMode {
  if (pathname.includes('signup')) {
    return 'signup';
  }

  if (pathname.includes('forgot')) {
    return 'forgot';
  }

  return 'login';
}

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = getMode(location.pathname);

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
  const [forgotStep, setForgotStep] = useState<ForgotStep>('request');
  const [forgotResetData, setForgotResetData] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [signupOtp, setSignupOtp] = useState('');
  const [showOtpCard, setShowOtpCard] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [forgotResendTimer, setForgotResendTimer] = useState(0);
  const [apiFeedback, setApiFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const clearFeedback = () => {
    setApiFeedback(null);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setOtpResendTimer((current) => (current > 0 ? current - 1 : 0));
      setForgotResendTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mode === 'forgot') {
      return;
    }

    setForgotStep('request');
    setForgotEmail('');
    setForgotResetData({ otp: '', password: '', confirmPassword: '' });
    setForgotResendTimer(0);
    setErrors({});
  }, [mode]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getApiErrorMessage = (data: { message?: string; error?: string }, fallback: string) => {
    if (data.message && data.error && data.error !== data.message) {
      return `${data.message} (${data.error})`;
    }

    return data.message || data.error || fallback;
  };

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
    if (!validateSignup()) {
      return;
    }

    setErrors({});
    clearFeedback();
    setIsSubmitting(true);

    fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(getApiErrorMessage(data, 'Signup failed.'));
        }

        setShowOtpCard(true);
        setOtpResendTimer(data.resendAvailableIn || 60);
        setApiFeedback({
          type: 'success',
          message: data.message || 'Signup successful. Please verify OTP sent to your email.',
        });
      })
      .catch((error: Error) => {
        if (error.message.toLowerCase().includes('already verified')) {
          setApiFeedback({ type: 'success', message: 'Account already verified. Please login.' });
          setShowOtpCard(false);
          setSignupOtp('');
          navigate('/login');
          return;
        }

        setApiFeedback({ type: 'error', message: error.message });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateLogin()) {
      return;
    }

    setErrors({});
    clearFeedback();
    setIsSubmitting(true);

    fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(getApiErrorMessage(data, 'Login failed.'));
        }

        localStorage.setItem('busgoToken', data.token);

        if (data.user?.role === 'user') {
          const userProfileUrl = API_BASE_URL.replace('/auth', '/user/profile');
          const profileResponse = await fetch(userProfileUrl, {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          });

          const profileData = await profileResponse.json();
          if (!profileResponse.ok || !profileData.success) {
            throw new Error(profileData.message || 'Failed to load user profile.');
          }

          localStorage.setItem('busgoUser', JSON.stringify(profileData.user));
        } else if (data.user) {
          localStorage.setItem('busgoUser', JSON.stringify(data.user));
        }

        setApiFeedback({ type: 'success', message: data.message || 'Login successful.' });

        if (data.user?.role === 'vendor') {
          navigate('/vendor/dashboard');
          return;
        }

        if (data.user?.role === 'admin') {
          navigate('/admin-dashboard');
          return;
        }

        navigate('/dashboard');
      })
      .catch((error: Error) => {
        setApiFeedback({ type: 'error', message: error.message });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
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

    if (forgotStep === 'reset') {
      const nextErrors: FormErrors = {};

      if (!forgotResetData.otp.trim()) {
        nextErrors.otp = 'Reset code is required.';
      }

      if (!forgotResetData.password.trim()) {
        nextErrors.password = 'New password is required.';
      } else if (forgotResetData.password.length < 6) {
        nextErrors.password = 'Password must be at least 6 characters.';
      }

      if (forgotResetData.confirmPassword !== forgotResetData.password) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      setErrors({});
      clearFeedback();
      setIsSubmitting(true);

      fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotResetData.otp,
          password: forgotResetData.password,
        }),
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(getApiErrorMessage(data, 'Failed to reset password.'));
          }

          setApiFeedback({ type: 'success', message: data.message || 'Password reset successfully.' });
          setForgotEmail('');
          setForgotStep('request');
          setForgotResetData({ otp: '', password: '', confirmPassword: '' });
          setForgotResendTimer(0);
          navigate('/login');
        })
        .catch((error: Error) => {
          setApiFeedback({ type: 'error', message: error.message });
        })
        .finally(() => {
          setIsSubmitting(false);
        });

      return;
    }

    setErrors({});
    clearFeedback();
    setIsSubmitting(true);

    fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(getApiErrorMessage(data, 'Failed to send reset code.'));
        }

        setForgotStep('reset');
        setForgotResendTimer(data.resendAvailableIn || 60);
        setApiFeedback({ type: 'success', message: data.message || 'Reset code sent successfully.' });
      })
      .catch((error: Error) => {
        setApiFeedback({ type: 'error', message: error.message });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleForgotResend = () => {
    if (!forgotEmail.trim()) {
      return;
    }

    setErrors({});
    clearFeedback();
    setIsSubmitting(true);

    fetch(`${API_BASE_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(getApiErrorMessage(data, 'Failed to send reset code.'));
        }

        setForgotStep('reset');
        setForgotResendTimer(data.resendAvailableIn || 60);
        setApiFeedback({ type: 'success', message: data.message || 'Reset code sent successfully.' });
      })
      .catch((error: Error) => {
        setApiFeedback({ type: 'error', message: error.message });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleVerifyOtp = () => {

    if (!signupOtp.trim()) {
      setErrors((current) => ({ ...current, otp: 'OTP is required.' }));
      return;
    }

    setErrors((current) => ({ ...current, otp: undefined }));
    clearFeedback();
    setIsSubmitting(true);

    fetch(`${API_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupData.email,
        otp: signupOtp,
      }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'OTP verification failed.');
        }

        setApiFeedback({ type: 'success', message: data.message || 'OTP verified. You can login now.' });
        setShowOtpCard(false);
        setSignupOtp('');
        navigate('/login');
      })
      .catch((error: Error) => {
        setApiFeedback({ type: 'error', message: error.message });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleResendOtp = () => {
    if (!signupData.email.trim()) {
      setApiFeedback({ type: 'error', message: 'Please enter email first and submit signup form.' });
      return;
    }

    if (otpResendTimer > 0) {
      setApiFeedback({
        type: 'info',
        message: `Please wait ${formatCountdown(otpResendTimer)} before requesting a new OTP.`,
      });
      return;
    }

    clearFeedback();
    setIsSubmitting(true);

    fetch(`${API_BASE_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupData.email }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(getApiErrorMessage(data, 'Failed to resend OTP.'));
        }

        setOtpResendTimer(data.resendAvailableIn || 60);
        setApiFeedback({ type: 'success', message: data.message || 'New OTP sent successfully.' });
      })
      .catch((error: Error) => {
        setApiFeedback({ type: 'error', message: error.message });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(247, 244, 238, 0.9)',
          color: 'text.primary',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(23, 49, 59, 0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 76, gap: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'primary.main',
                  color: '#FFFFFF',
                  boxShadow: '0 14px 30px rgba(15, 118, 110, 0.28)',
                }}
              >
                <DirectionsBusRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h6" component="p" sx={{ lineHeight: 1.1, fontWeight: 800 }}>
                  BusGo
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Secure login and signup
                </Typography>
              </Box>
            </Stack>

            <Button component={RouterLink} to="/" variant="text" color="inherit">
              Back to Home
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
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
                  <Typography variant="h4" component="h1" sx={{ mt: 1, fontSize: { xs: '1.9rem', md: '2.4rem' } }}>
                    {mode === 'signup'
                      ? 'Create your account and start booking'
                      : mode === 'forgot'
                        ? 'Recover your account safely'
                        : 'Login to continue your booking'}
                  </Typography>
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.82)' }}>
                  {mode === 'signup'
                    ? 'Signup collects your name, email, password, and optional phone number.'
                    : mode === 'forgot'
                      ? 'Enter your email to receive a reset code, then set a new password and confirm it.'
                      : 'Login with email and password to access your booking dashboard.'}
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
              {apiFeedback && <Alert severity={apiFeedback.type} sx={{ mb: 2.5 }}>{apiFeedback.message}</Alert>}

              {mode === 'login' && (
                <Card variant="outlined" sx={{ borderColor: 'rgba(23,49,59,0.12)' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack component="form" spacing={2} onSubmit={handleLoginSubmit}>
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                        Login
                      </Typography>
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
                        <Button component={RouterLink} to="/forgot-password" variant="text" sx={{ px: 0 }}>
                          Forgot password?
                        </Button>
                      </Stack>
                      <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? 'Please wait...' : 'Login'}
                      </Button>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        New user?{' '}
                        <Link component={RouterLink} to="/signup" sx={{ fontWeight: 700 }}>
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
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                        Sign Up
                      </Typography>
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
                      <Button type="submit" variant="contained" color="secondary" size="large" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? 'Please wait...' : 'Sign Up'}
                      </Button>

                      {showOtpCard && (
                        <Card variant="outlined" sx={{ borderColor: 'rgba(23,49,59,0.12)', mt: 1 }}>
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Verify OTP
                              </Typography>
                              <TextField
                                label="Enter OTP"
                                value={signupOtp}
                                onChange={(event) => setSignupOtp(event.target.value)}
                                error={Boolean(errors.otp)}
                                helperText={errors.otp || 'Enter the OTP sent to your email.'}
                                inputProps={{ maxLength: 6 }}
                              />
                              <Stack direction="row" spacing={1.2}>
                                <Button type="button" variant="contained" size="small" disabled={isSubmitting} onClick={handleVerifyOtp}>
                                  Verify OTP
                                </Button>
                                <Button
                                  type="button"
                                  variant="outlined"
                                  size="small"
                                  onClick={handleResendOtp}
                                  disabled={isSubmitting || otpResendTimer > 0}
                                >
                                  {otpResendTimer > 0 ? `Resend in ${formatCountdown(otpResendTimer)}` : 'Resend OTP'}
                                </Button>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      )}
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login" sx={{ fontWeight: 700 }}>
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
                      <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
                        Forgot Password
                      </Typography>
                      <Alert severity="info" sx={{ alignItems: 'center' }}>
                        Enter your email to receive a reset code, then confirm it with your new password.
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
                      {forgotStep === 'reset' && (
                        <>
                          <TextField
                            label="Reset Code"
                            placeholder="Enter the code from your email"
                            value={forgotResetData.otp}
                            onChange={(event) =>
                              setForgotResetData((current) => ({ ...current, otp: event.target.value }))
                            }
                            error={Boolean(errors.otp)}
                            helperText={errors.otp}
                            InputProps={{ startAdornment: <InputAdornment position="start"><KeyRoundedIcon /></InputAdornment> }}
                          />
                          <TextField
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            value={forgotResetData.password}
                            onChange={(event) =>
                              setForgotResetData((current) => ({ ...current, password: event.target.value }))
                            }
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
                          <TextField
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your new password"
                            value={forgotResetData.confirmPassword}
                            onChange={(event) =>
                              setForgotResetData((current) => ({ ...current, confirmPassword: event.target.value }))
                            }
                            error={Boolean(errors.confirmPassword)}
                            helperText={errors.confirmPassword}
                            InputProps={{
                              startAdornment: <InputAdornment position="start"><LockRoundedIcon /></InputAdornment>,
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowConfirmPassword((current) => !current)} edge="end" aria-label="toggle confirm password visibility">
                                    {showConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </>
                      )}
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<KeyRoundedIcon />}
                        disabled={isSubmitting || (forgotStep === 'request' && forgotResendTimer > 0)}
                      >
                        {isSubmitting
                          ? 'Please wait...'
                          : forgotStep === 'reset'
                            ? 'Reset Password'
                            : forgotResendTimer > 0
                              ? `Try again in ${formatCountdown(forgotResendTimer)}`
                              : 'Send Reset Code'}
                      </Button>
                      {forgotStep === 'reset' && (
                        <Button
                          type="button"
                          variant="text"
                          onClick={handleForgotResend}
                          disabled={isSubmitting || forgotResendTimer > 0}
                          sx={{ alignSelf: 'center' }}
                        >
                          {forgotResendTimer > 0 ? `Resend available in ${formatCountdown(forgotResendTimer)}` : 'Resend code'}
                        </Button>
                      )}
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        Remembered your password?{' '}
                        <Link
                          component={RouterLink}
                          to="/login"
                          sx={{ fontWeight: 700 }}
                          onClick={() => {
                            setForgotStep('request');
                            setForgotResetData({ otp: '', password: '', confirmPassword: '' });
                          }}
                        >
                          Return to login
                        </Link>
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}

export default AuthPage;