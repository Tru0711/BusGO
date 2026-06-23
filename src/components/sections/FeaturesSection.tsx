import { motion } from 'framer-motion';
import { Zap, Shield, Clock, HeadphonesIcon, Bus, Users, CreditCard, MapPin } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const features = [
  {
    icon: Zap,
    title: 'Fast Booking',
    description: 'Book your bus ticket in under 60 seconds. Smart search, instant results, and a seamless checkout flow.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-600',
  },
  {
    icon: Bus,
    title: 'Premium Operators',
    description: 'We partner with top-rated bus operators across the country to ensure comfort, safety, and reliability.',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: '256-bit encrypted payments with multiple gateways. Pay via UPI, cards, netbanking, or wallets with confidence.',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-600',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Our support team is available round the clock to help with bookings, cancellations, refunds, or any queries.',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-600',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-[100px] scroll-mt-24 bg-white/50">
<div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Why BusGo</span>
          </div>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-slate-900 mb-4">
            Why Choose BusGo?
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            We have built a travel platform that puts your comfort, security, and convenience first — every step of the way.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative bg-white rounded-3xl border border-gray-100 p-7 card-hover"
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon */}
              <div className={`relative mb-5 w-14 h-14 rounded-2xl ${feature.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 ${feature.textLight}`} strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-bold text-slate-900 mb-2.5 group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent */}
              <div className={`relative mt-6 h-1 w-12 rounded-full bg-gradient-to-r ${feature.gradient} opacity-40 group-hover:opacity-100 group-hover:w-full transition-all duration-500`} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <RouterLink
            to="/search-buses"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5"
          >
            Start Your Journey
            <Bus className="h-4 w-4" />
          </RouterLink>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturesSection;
