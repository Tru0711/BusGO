import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Apple, PlayCircle, Star, ArrowRight, Bus, Shield, Zap } from 'lucide-react';

function AppDownloadSection() {
  return (
    <section className="relative py-[100px] overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950" />
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-[15%] w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Shield className="h-6 w-6 text-emerald-300/60" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-[20%] w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <Zap className="h-5 w-5 text-amber-300/60" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-[10%] w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center"
          animate={{ y: [-15, 5, -15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        >
          <Smartphone className="h-5 w-5 text-emerald-300/60" />
        </motion.div>
      </div>

<div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-6">
              <Smartphone className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Mobile App</span>
            </div>

            {/* Heading */}
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold tracking-tight text-white mb-4 leading-[1.1]">
              Book Tickets Anytime,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-200">
                Anywhere
              </span>
            </h2>

            <p className="text-lg text-white/70 leading-relaxed max-w-lg mb-8">
              Download the BusGo app for a faster, smoother booking experience. Get real-time updates, exclusive mobile offers, and seamless travel management on the go.
            </p>

            {/* Feature list */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Zap, text: 'Faster booking in under 30 seconds' },
                { icon: Bus, text: 'Live bus tracking & real-time updates' },
                { icon: Shield, text: 'Secure payments with mobile-only offers' },
                { icon: Star, text: '4.8★ rated on App Store & Play Store' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                >
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <item.icon className="h-4 w-4 text-emerald-300" />
                  </div>
                  <span className="text-white/80">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Download buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold shadow-xl shadow-black/20 transition-all duration-300 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Apple className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-[10px] font-medium text-slate-500 leading-tight">Download on the</p>
                  <p className="text-base font-bold leading-tight">App Store</p>
                </div>
              </motion.a>
              <motion.a
                href="#"
                className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-bold shadow-xl shadow-black/20 transition-all duration-300 hover:bg-gray-50 hover:-translate-y-1 hover:shadow-2xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlayCircle className="h-6 w-6" />
                <div className="text-left">
                  <p className="text-[10px] font-medium text-slate-500 leading-tight">Get it on</p>
                  <p className="text-base font-bold leading-tight">Google Play</p>
                </div>
              </motion.a>
            </div>

            {/* App rating */}
            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">4.8 ★ Average Rating</p>
                <p className="text-xs text-white/50">From 10,000+ reviews</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Phone mockup */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Phone frame */}
              <motion.div
                className="relative w-[280px] h-[560px] rounded-[40px] bg-slate-900 border-[3px] border-slate-700 shadow-2xl shadow-black/40 overflow-hidden"
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <span className="text-xs font-semibold text-white">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2 rounded-sm border border-white/60" />
                    <div className="w-3.5 h-2 rounded-sm bg-emerald-400" />
                  </div>
                </div>

                {/* App content */}
                <div className="px-4">
                  {/* App header */}
                  <div className="flex items-center gap-2 mb-4 mt-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Bus className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-base font-bold text-white">BusGo</span>
                  </div>

                  {/* Search card */}
                  <div className="bg-white/10 rounded-2xl p-3 mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-white/70">Mumbai</span>
                      </div>
                      <div className="w-4 h-0.5 bg-white/20 ml-1" />
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-xs text-white/70">Pune</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Today, 08:00 AM</span>
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20">
                          <span className="text-xs font-bold text-emerald-300">₹ 450</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="bg-white/10 rounded-2xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">Your Booking</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Bus className="h-4 w-4 text-emerald-300" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Volvo AC Sleeper</p>
                        <p className="text-[10px] text-white/50">Mumbai → Pune</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[10px] text-white/50">Seat No: 12B</span>
                      <span className="text-xs font-bold text-emerald-300">Confirmed</span>
                    </div>
                  </div>

                  {/* Bottom nav */}
                  <div className="flex items-center justify-between px-2 py-3 mt-2 border-t border-white/10">
                    {['Home', 'Search', 'Bookings', 'Profile'].map((tab) => (
                      <span key={tab} className="text-[10px] text-white/40 font-medium">{tab}</span>
                    ))}
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-xl flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>
              </motion.div>

              {/* Glow behind phone */}
              <div className="absolute -inset-10 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-[60px] blur-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default AppDownloadSection;
