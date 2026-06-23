import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Chip, Grid, IconButton, Paper, Stack, Typography } from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import { apiRequest } from '../../utils/api';

type Offer = {
  _id: string;
  label: string;
  title: string;
  description: string;
  discountPercent: number;
};

type VendorOffersResponse = {
  success: boolean;
  offers: Offer[];
};

function ManageOffersPage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await apiRequest<VendorOffersResponse>('/vendor/offers');
      setOffers(response.offers || []);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await apiRequest(`/vendor/offers/${offerId}`, { method: 'DELETE' });
      setOffers((prev) => prev.filter((o) => o._id !== offerId));
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  return (
    <Stack spacing={3}>
      <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)', background: 'linear-gradient(135deg, rgba(255,138,61,0.08), rgba(255,138,61,0.02))' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'secondary.main',
                    color: '#fff',
                  }}
                >
                  <LocalOfferRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Manage Offers
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Create and manage promotional offers
                  </Typography>
                </Box>
              </Box>
            </Stack>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddCircleRoundedIcon />}
              onClick={() => navigate('/vendor/add-offer')}
            >
              Add New Offer
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Loading offers...
        </Typography>
      ) : offers.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(23,49,59,0.08)', textAlign: 'center' }}>
          <LocalOfferRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No offers created yet
          </Typography>
          <Button variant="contained" startIcon={<AddCircleRoundedIcon />} onClick={() => navigate('/vendor/add-offer')}>
            Create First Offer
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {offers.map((offer) => (
            <Grid item xs={12} md={6} lg={4} key={offer._id}>
              <Card elevation={0} sx={{ border: '1px solid rgba(23,49,59,0.08)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, flex: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Chip label={offer.label} size="small" color="secondary" variant="outlined" />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(offer._id)}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {offer.title}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {offer.description}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                        {offer.discountPercent}%
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        Discount
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

export default ManageOffersPage;
