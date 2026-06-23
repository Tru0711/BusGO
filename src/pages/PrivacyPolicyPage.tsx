import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function PrivacyPolicyPage() {
  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid rgba(17, 50, 74, 0.08)' }}>
          <Stack spacing={2}>
            <Typography variant="h3" component="h1">
              Privacy Policy
            </Typography>
            <Typography color="text.secondary">
              BusGo collects booking, login, and support data only to provide the travel experience, secure your account, and complete trip-related actions.
            </Typography>
            <Typography color="text.secondary">
              We do not sell personal information. Booking activity may be shared with the relevant operator, payment provider, or support team to fulfil your reservation and refund requests.
            </Typography>
            <Typography color="text.secondary">
              For account support or data requests, contact support@busgo.app.
            </Typography>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}

export { PrivacyPolicyPage };
export default PrivacyPolicyPage;