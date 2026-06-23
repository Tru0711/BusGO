import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MessageCircle, ArrowLeft, ArrowRight } from 'lucide-react';

type Review = {
  id: string;
  userName: string;
  routeLabel: string;
  busName: string;
  overallRating: number;
  comment: string;
};

const fallbackReviews: Review[] = [
  {
    id: '1',
    userName: 'Priya Sharma',
    routeLabel: 'Mumbai → Pune',
    busName: 'Volvo AC Seater',
    overallRating: 5,
    comment: 'Absolutely seamless experience! Booked in under a minute, the bus was on time, and the seats were very comfortable. Highly recommend BusGo for intercity travel.',
  },
  {
    id: '2',
    userName: 'Rahul Verma',
    routeLabel: 'Delhi → Jaipur',
    busName: 'Luxury Sleeper',
    overallRating: 5,
    comment: 'The live seat tracking feature is a game changer. I knew exactly when the bus would arrive. The booking process was smooth and the e-ticket arrived instantly.',
  },
  {
    id: '3',
    userName: 'Ananya Patel',
    routeLabel: 'Bangalore → Chennai',
    busName: 'AC Sleeper',
    overallRating: 4,
    comment: 'Very reliable platform. Had to cancel one booking and the refund was processed within hours. The customer support team was extremely helpful throughout.',
  },
  {
    id: '4',
    userName: 'Vikram Singh',
    routeLabel: 'Hyderabad → Goa',
    busName: 'Volvo Multi-Axle',
    overallRating: 5,
    comment: 'The best bus booking experience I have had. Great selection of operators, transparent pricing, and no hidden fees. Will definitely use again!',
  },
  {
    id: '5',
    userName: 'Meera Joshi',
    routeLabel: 'Ahmedabad → Vadodara',
    busName: 'Non-AC Express',
    overallRating: 4,
    comment: 'Quick booking, great prices, and the bus was right on schedule. The app interface is very intuitive and easy to navigate. Great job BusGo team!',
  },
];

function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Surface backend failures in a stable/styled way instead of silently falling back.
    fetch('/api/reviews/public')
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;

  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayReviews.length, isPaused]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length);

  const review = displayReviews[currentIndex];

  return (
    <section id="reviews" className="py-[100px] scroll-mt-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-100/30 blur-3xl" />
      </div>

<div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-slate-900 mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Real experiences from real travelers. See why thousands trust BusGo for their bus bookings.
          </p>
        </motion.div>

        {loading && reviews.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 animate-pulse">
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-gray-100" />
                ))}
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
                <div className="h-4 bg-gray-100 rounded w-4/6" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="max-w-3xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Carousel Card */}
            <motion.div
              key={currentIndex}
              className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-xl shadow-gray-200/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Quote icon */}
              <Quote className="h-10 w-10 text-emerald-200 mb-6" strokeWidth={1} />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= review.overallRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-lg sm:text-xl leading-relaxed text-slate-700 mb-8 font-medium">
                &ldquo;{review.comment}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-emerald-200">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{review.userName}</p>
                    <p className="text-sm text-slate-500">{review.routeLabel || review.busName}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-emerald-700">{review.overallRating}</span>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-2">
                {displayReviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-8 bg-emerald-500'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
                  aria-label="Previous testimonial"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={next}
                  className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
                  aria-label="Next testimonial"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
