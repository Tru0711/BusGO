import { lazy } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/sections/HeroSection';
import SearchBusSection from '../components/sections/SearchBusSection';
import PopularRoutesSection from '../components/sections/PopularRoutesSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import StatsSection from '../components/sections/StatsSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import AppDownloadSection from '../components/sections/AppDownloadSection';
import Footer from '../components/layout/Footer';

function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Navbar />
      <HeroSection />
      <SearchBusSection />
      <PopularRoutesSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <AppDownloadSection />
      <Footer />
    </main>
  );
}

export default HomePage;
