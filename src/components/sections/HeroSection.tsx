import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, RefreshCw, HeadphonesIcon, Star, Bus, Route, Users, ArrowRight, MapPin, Clock, CreditCard } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12 },
  }),
};



const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const trustItems = [
  { icon: Shield, label: 'Secure Payments', desc: '256-bit encrypted checkout' },
  { icon: MapPin, label: 'Live Seat Availability', desc: 'Real-time bus tracking' },
  { icon: RefreshCw, label: 'Instant Refunds', desc: 'Cancel & get refunded fast' },
  { icon: HeadphonesIcon, label: '24/7 Support', desc: 'We are here to help' },
];

const statsItems = [
  { icon: Star, value: '4.8', suffix: '', label: 'Rating', sub: 'Customer satisfaction' },
  { icon: Route, value: '250+', suffix: '', label: 'Routes', sub: 'Across the country' },
  { icon: Users, value: '10K+', suffix: '', label: 'Travelers', sub: 'Trust BusGo daily' },
];

const floatingCards = [
  { icon: MapPin, label: 'Live Seat', sub: 'Availability', color: 'emerald' },
  { icon: RefreshCw, label: 'Easy', sub: 'Refunds', color: 'amber' },
  { icon: HeadphonesIcon, label: '24/7', sub: 'Support', color: 'blue' },
];

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900" />
      <div className="absolute inset-0 mesh-gradient opacity-30" />

      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-teal-400/8 blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-1/4 w-[300px] h-[300px] rounded-full bg-amber-400/6 blur-3xl animate-float" />
        <div className="absolute top-1/2 right-1/3 w-[200px] h-[200px] rounded-full bg-emerald-400/10 blur-2xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

        {/* Travel-themed abstract lines */}
        <svg className="absolute bottom-0 left-0 w-full h-auto opacity-[0.04]" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1350,70 1440,60 L1440,120 L0,120 Z" fill="white" />
        </svg>
        <svg className="absolute top-0 right-0 w-1/2 h-auto opacity-[0.03] -scale-x-100" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="280" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="200" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="300" cy="300" r="120" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M300 20 L300 580" stroke="white" strokeWidth="0.3" opacity="0.3" />
          <path d="M20 300 L580 300" stroke="white" strokeWidth="0.3" opacity="0.3" />
        </svg>
      </div>

      {/* Content */}
<div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            className="lg:col-span-7"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90">Fast Booking &bull; Smooth Travel</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] font-extrabold tracking-tight text-white mb-6"
            >
              Book Bus Tickets{' '}
              <span className="relative inline-block">
                Across The Country
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400/40" viewBox="0 0 300 12" fill="currentColor">
                  <path d="M0,8 Q75,0 150,6 Q225,12 300,4 L300,12 L0,12 Z" />
                </svg>
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">
                In Minutes
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg leading-relaxed text-white/75 max-w-xl mb-8"
            >
              Search routes, compare fares, reserve your seat, and manage every trip — all from one polished platform designed for modern travelers.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3 sm:gap-4 mb-10">
              <RouterLink
                to="/search-buses"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-400 text-slate-900 font-bold text-base shadow-xl shadow-amber-400/25 transition-all duration-300 hover:bg-amber-300 hover:shadow-2xl hover:shadow-amber-400/35 hover:-translate-y-1"
              >
                <Search className="h-5 w-5" />
                Search Routes
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </RouterLink>
              <RouterLink
                to="/vendor/signup"
                className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-white font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/30 hover:-translate-y-1"
              >
                Become a Vendor
              </RouterLink>
              <RouterLink
                to="/offers"
                className="group inline-flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-white/60 hover:text-white transition-all duration-200"
              >
                View Offers
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </RouterLink>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={fadeUp} custom={4} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trustItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm"
                >
                  <item.icon className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white/90">{item.label}</p>
                    <p className="text-[10px] text-white/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Stats Card */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative">
              {/* Floating mini-cards */}
              <div className="hidden lg:block">
                {floatingCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    className="absolute flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/30 shadow-xl"
                    style={{
                      top: `${30 + i * 35}%`,
                      left: i === 0 ? '-20%' : i === 1 ? '-15%' : '-18%',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                  >
                    <div
                      className={
                        card.color === 'emerald'
                          ? 'p-1.5 rounded-lg bg-emerald-100'
                          : card.color === 'amber'
                            ? 'p-1.5 rounded-lg bg-amber-100'
                            : 'p-1.5 rounded-lg bg-blue-100'
                      }
                    >
                      <card.icon
                        className={
                          card.color === 'emerald'
                            ? 'h-4 w-4 text-emerald-600'
                            : card.color === 'amber'
                              ? 'h-4 w-4 text-amber-600'
                              : 'h-4 w-4 text-blue-600'
                        }
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{card.label}</p>
                      <p className="text-[10px] text-slate-500">{card.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Main Stats Card */}
              <motion.div
                className="relative rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/15 overflow-hidden shadow-2xl shadow-black/20"
                whileHover={{ y: -6, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.4)' }}
                transition={{ duration: 0.4 }}
              >
                {/* Card inner glow */}
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl" />

                <div className="relative p-6 sm:p-8">
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Booking Snapshot</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                        <span className="text-2xl font-extrabold text-white">4.8</span>
                        <span className="text-sm text-white/60">/ 5</span>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-emerald-800 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                        >
                          {['A', 'M', 'K', 'R'][i - 1]}
                        </div>
                      ))}
                      <div className="w-10 h-10 rounded-full border-2 border-emerald-800 bg-emerald-800/50 flex items-center justify-center text-xs font-bold text-emerald-300">
                        +2K
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {statsItems.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        className="text-center p-3 rounded-2xl bg-white/5 border border-white/5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      >
                        <stat.icon className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                        <p className="text-xl font-extrabold text-white">{stat.value}</p>
                        <p className="text-xs text-white/60">{stat.sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Features list */}
                  <div className="space-y-3">
                    {[
                      { icon: MapPin, text: 'Live seat availability across 250+ routes' },
                      { icon: Clock, text: 'Instant confirmation & e-ticket delivery' },
                      { icon: CreditCard, text: 'Easy refunds with no hidden charges' },
                    ].map((feature, i) => (
                      <motion.div
                        key={feature.text}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                      >
                        <div className="p-1.5 rounded-lg bg-emerald-500/20">
                          <feature.icon className="h-3.5 w-3.5 text-emerald-300" />
                        </div>
                        <span className="text-sm text-white/80">{feature.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
