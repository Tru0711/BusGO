import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function TermsPage() {
  return (
    <Box>
      <Navbar />
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid rgba(17, 50, 74, 0.08)' }}>
          <Stack spacing={2}>
            <Typography variant="h3" component="h1">
              Terms & Conditions
            </Typography>
            <Typography color="text.secondary">
              BusGo is a booking platform that connects passengers with bus operators. Ticket availability, boarding details, and refund timelines depend on operator policies and live inventory.
            </Typography>
            <Typography color="text.secondary">
              Users are responsible for entering accurate passenger details, checking boarding points, and reviewing cancellation rules before payment.
            </Typography>
            <Typography color="text.secondary">
              Continued use of the platform implies acceptance of future policy updates posted on this page.
            </Typography>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}

export { TermsPage };
export default TermsPage;