import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import RedeemRoundedIcon from '@mui/icons-material/RedeemRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SectionTitle from '../common/SectionTitle';
import { apiRequest } from '../../utils/api';

type Offer = {
  _id: string;
  label: string;
  title: string;
  description: string;
  discountPercent: number;
};

type OffersResponse = {
  success: boolean;
  offers: Offer[];
};

function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await apiRequest<OffersResponse>('/offers');
        setOffers(response.offers || []);
      } catch {
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <Box component="section" id="offers" sx={{ scrollMarginTop: 110 }}>
        <SectionTitle eyebrow="Offers" title="Available Offers" subtitle="" />
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Loading offers...
        </Typography>
      </Box>
    );
  }

  if (offers.length === 0) {
    return (
      <Box component="section" id="offers" sx={{ scrollMarginTop: 110 }}>
        <SectionTitle eyebrow="Offers" title="Available Offers" subtitle="" />
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No offers available at the moment. Check back later!
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="section" id="offers" sx={{ scrollMarginTop: 110 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          border: '1px solid rgba(17, 50, 74, 0.08)',
          background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.10) 0%, rgba(245, 158, 11, 0.10) 100%)',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={1.25}>
              <Typography variant="overline" sx={{ letterSpacing: '0.18em', fontWeight: 700, color: 'primary.main' }}>
                Offers and rewards
              </Typography>
              <Typography variant="h3" component="h2">
                Save more on every booking with exclusive coupons and cashback deals
              </Typography>
              <Typography color="text.secondary">
                Use offer codes at checkout, claim cashback on partner routes, and refer friends for ride credits.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row', md: 'column' }}>
              <Chip icon={<RedeemRoundedIcon />} label="Up to 10% cashback" color="primary" variant="outlined" />
              <Chip icon={<PeopleAltRoundedIcon />} label="Refer and earn rewards" color="secondary" variant="outlined" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <SectionTitle eyebrow="Coupons" title="Featured coupon codes" subtitle="Apply these codes while checking out for instant savings." />
      <Grid container spacing={2.5}>
        {offers.map((offer, index) => (
          <Grid item xs={12} md={4} key={offer._id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid rgba(17, 50, 74, 0.08)',
                background:
                  index === 0
                    ? 'linear-gradient(135deg, rgba(11, 107, 203, 0.10) 0%, rgba(11, 107, 203, 0.02) 100%)'
                    : index === 1
                      ? 'linear-gradient(135deg, rgba(255, 138, 61, 0.12) 0%, rgba(255, 138, 61, 0.03) 100%)'
                      : 'linear-gradient(135deg, rgba(17, 50, 74, 0.08) 0%, rgba(17, 50, 74, 0.02) 100%)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.72)',
                      color: 'secondary.main',
                    }}
                  >
                    <LocalOfferRoundedIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}
                    >
                      {offer.label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 0.75, mb: 1, fontWeight: 700 }}>
                      {offer.title}
                    </Typography>
                    <Typography color="text.secondary">{offer.description}</Typography>
                    <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 800, color: 'secondary.main' }}>
                      {offer.discountPercent}% Off
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid rgba(17, 50, 74, 0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Cashback offers
                </Typography>
                <Typography color="text.secondary">
                  Earn route-wise cashback after payment confirmation on participating operators.
                </Typography>
                <Button variant="contained" color="primary" sx={{ alignSelf: 'flex-start' }}>
                  View cashback routes
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid rgba(17, 50, 74, 0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Referral rewards
                </Typography>
                <Typography color="text.secondary">
                  Invite friends and get ride credits when they complete their first booking.
                </Typography>
                <Button variant="outlined" color="primary" sx={{ alignSelf: 'flex-start' }}>
                  Share referral code
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ height: '100%', border: '1px solid rgba(17, 50, 74, 0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Expiry reminders
                </Typography>
                <Typography color="text.secondary">
                  Track expiry dates and plan bookings before seasonal discounts end.
                </Typography>
                <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 700 }}>
                  Save between 25 Aug and 31 Dec 2026
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <SectionTitle eyebrow="Cashback" title="Current rewards overview" subtitle="These cards show what a connected offers experience can look like." />
    </Box>
  );
}

export default OffersSection;
