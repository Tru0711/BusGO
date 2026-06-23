import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, Clock, MapPin, Star, TrendingUp, ArrowRight } from 'lucide-react';

type PublicTrip = {
  _id: string;
  fromLocation: string;
  toLocation: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  rating?: string;
  reviewCount?: number;
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// Fallback data for when API returns empty
const fallbackRoutes: PublicTrip[] = [
  { _id: '1', fromLocation: 'Mumbai', toLocation: 'Pune', departureTime: '06:00 AM', arrivalTime: '10:30 AM', price: 450, rating: '4.8', reviewCount: 234 },
  { _id: '2', fromLocation: 'Delhi', toLocation: 'Jaipur', departureTime: '07:30 AM', arrivalTime: '01:00 PM', price: 550, rating: '4.7', reviewCount: 189 },
  { _id: '3', fromLocation: 'Bangalore', toLocation: 'Chennai', departureTime: '08:00 AM', arrivalTime: '02:30 PM', price: 650, rating: '4.9', reviewCount: 312 },
  { _id: '4', fromLocation: 'Hyderabad', toLocation: 'Goa', departureTime: '09:00 PM', arrivalTime: '06:00 AM', price: 750, rating: '4.6', reviewCount: 156 },
];

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
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
  }, [value]);

  return <>{count}{suffix}</>;
}

function PopularRoutesSection() {
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trips/public/search')
      .then((res) => res.json())
      .then((data) => setTrips(data.trips || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const displayTrips = loading ? fallbackRoutes : trips.length > 0 ? trips.slice(0, 4) : fallbackRoutes;

  return (
    <section id="routes" className="py-[100px] scroll-mt-24">
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
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Popular Routes</span>
          </div>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-slate-900 mb-4">
            Most Booked Bus Routes
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Discover the most popular routes travelers are booking right now. Affordable fares, reliable operators.
          </p>
        </motion.div>

        {/* Routes Grid */}
        {loading && trips.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-gray-100 rounded" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-8 w-full bg-gray-100 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayTrips.map((trip, i) => (
              <motion.div
                key={trip._id}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 card-hover cursor-pointer"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
              >
                {/* Top gradient accent */}
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                      <Bus className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Route</p>
                      <p className="text-sm font-bold text-slate-800">{trip.fromLocation} → {trip.toLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{trip.rating || '4.8'}</span>
                  </div>
                </div>

                {/* Route details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{trip.departureTime} — {trip.arrivalTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>Direct • 4h 30m</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Star className="h-3.5 w-3.5 text-slate-400" />
                    <span>{trip.reviewCount || 0} reviews</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Starting from</p>
                    <p className="text-2xl font-extrabold text-slate-900">₹{trip.price}</p>
                  </div>
                  <RouterLink
                    to={`/search-buses?from=${trip.fromLocation}&to=${trip.toLocation}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold transition-all duration-200 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Book Now
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </RouterLink>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View all CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <RouterLink
            to="/search-buses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-200 bg-white text-slate-700 font-semibold shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            View All Routes
            <ArrowRight className="h-4 w-4" />
          </RouterLink>
        </motion.div>
      </div>
    </section>
  );
}

export default PopularRoutesSection;
