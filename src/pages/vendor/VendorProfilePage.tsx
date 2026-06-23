import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  address: string;
  gstNumber: string;
  serviceAreas: string[];
};

function VendorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [serviceAreas, setServiceAreas] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    apiRequest<{ profile: Profile }>('/vendor/profile')
      .then((response) => {
        if (!mounted) return;
        setProfile(response.profile);
        setServiceAreas(response.profile.serviceAreas.join(', '));
      })
      .catch((error) => {
        if (mounted) setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load profile.' });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setSaving(true);
    setFeedback(null);

    try {
      const response = await apiRequest<{ profile: Profile; message: string }>('/vendor/profile', {
        method: 'PUT',
        body: {
          name: profile.name,
          phone: profile.phone,
          companyName: profile.companyName,
          businessType: profile.businessType,
          address: profile.address,
          gstNumber: profile.gstNumber,
          serviceAreas,
        },
      });

      setProfile(response.profile);
      setServiceAreas(response.profile.serviceAreas.join(', '));
      setFeedback({ type: 'success', message: response.message || 'Profile updated.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>Loading profile...</Typography>;
  }

  if (!profile) {
    return <Alert severity="error">Profile could not be loaded.</Alert>;
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)' }}>
      <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Profile</Typography>
            <Typography color="text.secondary">Keep your vendor details up to date.</Typography>
          </Box>

          {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

          <form onSubmit={updateProfile}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><TextField fullWidth label="Full Name" value={profile.name} onChange={(event) => setProfile((current) => current ? { ...current, name: event.target.value } : current)} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={profile.email} disabled /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Phone" value={profile.phone} onChange={(event) => setProfile((current) => current ? { ...current, phone: event.target.value } : current)} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Company Name" value={profile.companyName} onChange={(event) => setProfile((current) => current ? { ...current, companyName: event.target.value } : current)} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="Business Type" value={profile.businessType} onChange={(event) => setProfile((current) => current ? { ...current, businessType: event.target.value } : current)} /></Grid>
              <Grid item xs={12} md={6}><TextField fullWidth label="GST Number" value={profile.gstNumber} onChange={(event) => setProfile((current) => current ? { ...current, gstNumber: event.target.value } : current)} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Address" value={profile.address} onChange={(event) => setProfile((current) => current ? { ...current, address: event.target.value } : current)} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Service Areas" helperText="Comma-separated routes or cities." value={serviceAreas} onChange={(event) => setServiceAreas(event.target.value)} /></Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</Button>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default VendorProfilePage;