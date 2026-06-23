import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Route, Users, Heart, HeadphonesIcon, Star, Bus } from 'lucide-react';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="counter-number">
      {count}{suffix}
    </span>
  );
}

const stats = [
  { icon: Route, value: 250, suffix: '+', label: 'Routes', sub: 'Across India', color: 'emerald' },
  { icon: Users, value: 10000, suffix: '+', label: 'Bookings', sub: 'And growing daily', color: 'blue' },
  { icon: Heart, value: 98, suffix: '%', label: 'Customer Satisfaction', sub: 'Rated 4.8 / 5', color: 'amber' },
  { icon: HeadphonesIcon, value: 247, suffix: '', label: '24/7 Support', sub: 'Always here to help', color: 'rose' },
];

function StatsSection() {
  return (
    <section className="relative py-[100px] overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" viewBox="0 0 1440 600" preserveAspectRatio="none">
          <path d="M0,300 C360,100 720,500 1080,300 C1260,200 1350,350 1440,300" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M0,350 C360,150 720,550 1080,350 C1260,250 1350,400 1440,350" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

<div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-4">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Our Numbers</span>
          </div>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-white mb-4">
            Trusted By Thousands of Travelers
          </h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Our growth is driven by the trust and satisfaction of travelers who choose BusGo for their journeys.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative text-center p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 card-hover"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Icon */}
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <stat.icon className={`h-7 w-7 text-${stat.color}-400`} strokeWidth={1.5} />
              </div>

              {/* Value */}
              <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>

              {/* Label */}
              <p className="text-lg font-semibold text-white/90 mb-1">{stat.label}</p>
              <p className="text-sm text-white/60">{stat.sub}</p>

              {/* Decorative dot */}
              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full bg-${stat.color}-400/50`} />
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {['Secure Payments', 'Live Tracking', 'Instant Confirmation', 'Easy Refunds', 'Verified Operators'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default StatsSection;
