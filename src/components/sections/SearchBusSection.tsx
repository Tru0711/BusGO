import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeftRight, CalendarDays, Users, Bus } from 'lucide-react';

function SearchBusSection() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    if (passengers) params.set('passengers', passengers);
    navigate(`/search-buses?${params.toString()}`);
  };

  const swapLocations = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <section className="relative z-20 px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="relative rounded-3xl bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300" />

          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-50">
                <Bus className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Book Your Ride
                </p>
                <p className="text-lg font-bold text-slate-900">Search buses to find available seats</p>
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                {/* From */}
                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">From</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <Bus className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Departure city"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Swap button */}
                <div className="hidden lg:flex items-end justify-center pb-2">
                  <button
                    type="button"
                    onClick={swapLocations}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
                    title="Swap locations"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>

                {/* To */}
                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">To</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <Bus className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Destination city"
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Travel Date</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all [color-scheme:light]"
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Passengers</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                      <Users className="h-4 w-4" />
                    </div>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Passenger' : 'Passengers'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="mt-5 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>No booking fees • Free cancellation available</span>
                </div>
                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 hover:-translate-y-0.5"
                >
                  <Search className="h-5 w-5" />
                  Search Buses
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default SearchBusSection;
