import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { apiRequest } from '../../utils/api';

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  businessType: 'Individual' | 'Company';
  address: string;
  gstNumber: string;
  serviceAreas: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function VendorSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessType: 'Individual',
    address: '',
    gstNumber: '',
    serviceAreas: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
    if (!form.companyName.trim()) nextErrors.companyName = 'Company name is required.';
    if (!form.address.trim()) nextErrors.address = 'Address is required.';
    if (!form.serviceAreas.trim()) nextErrors.serviceAreas = 'Add at least one service area.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const response = await apiRequest<{ message: string; autoVerified?: boolean }>('/auth/vendor-register', {
        method: 'POST',
        body: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          companyName: form.companyName,
          businessType: form.businessType,
          address: form.address,
          gstNumber: form.gstNumber,
          serviceAreas: form.serviceAreas,
        },
      });

      setFeedback({ type: 'success', message: response.message || 'Vendor registration successful. Check your email for the OTP.' });
      if (response.autoVerified) {
        navigate('/vendor/login', { state: { email: form.email } });
      } else {
        navigate('/vendor/verify', { state: { email: form.email } });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Vendor registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 8 }, background: 'linear-gradient(180deg, #F7F4EE 0%, #EEF4F3 100%)' }}>
      <Container maxWidth="md">
        <Stack spacing={3} sx={{ mb: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'grid', placeItems: 'center' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: 3, bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 18px 30px rgba(15,118,110,0.24)' }}>
              <StorefrontRoundedIcon fontSize="large" />
            </Box>
          </Box>
          <Box>
            <Typography variant="h3" component="h1">Become a Vendor</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Register your operator profile and verify your email to start listing buses.
            </Typography>
          </Box>
        </Stack>

        <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.10)' }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Personal Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Full Name" value={form.name} onChange={updateField('name')} error={Boolean(errors.name)} helperText={errors.name} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Email" type="email" value={form.email} onChange={updateField('email')} error={Boolean(errors.email)} helperText={errors.email} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Phone Number" value={form.phone} onChange={updateField('phone')} error={Boolean(errors.phone)} helperText={errors.phone} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Password" type="password" value={form.password} onChange={updateField('password')} error={Boolean(errors.password)} helperText={errors.password} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Confirm Password" type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} error={Boolean(errors.confirmPassword)} helperText={errors.confirmPassword} /></Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Business Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}><TextField fullWidth label="Company Name" value={form.companyName} onChange={updateField('companyName')} error={Boolean(errors.companyName)} helperText={errors.companyName} /></Grid>
                    <Grid item xs={12} md={6}><TextField fullWidth select label="Business Type" value={form.businessType} onChange={updateField('businessType')}>
                      <MenuItem value="Individual">Individual</MenuItem>
                      <MenuItem value="Company">Company</MenuItem>
                    </TextField></Grid>
                    <Grid item xs={12}><TextField fullWidth label="Address" value={form.address} onChange={updateField('address')} error={Boolean(errors.address)} helperText={errors.address} /></Grid>
                    <Grid item xs={12}><TextField fullWidth label="GST Number (optional)" value={form.gstNumber} onChange={updateField('gstNumber')} /></Grid>
                  </Grid>
                </Box>

                <TextField
                  fullWidth
                  label="Service Areas"
                  helperText={errors.serviceAreas || 'Enter routes or cities separated by commas.'}
                  value={form.serviceAreas}
                  onChange={updateField('serviceAreas')}
                  error={Boolean(errors.serviceAreas)}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                  <Button component={RouterLink} to="/vendor/login" color="inherit">
                    Already verified? Login
                  </Button>
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit and Send OTP'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default VendorSignupPage;