import { Box, Container } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import OffersSection from '../components/sections/OffersSection';

function OffersPage() {
  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <OffersSection />
      </Container>
      <Footer />
    </Box>
  );
}

export default OffersPage;