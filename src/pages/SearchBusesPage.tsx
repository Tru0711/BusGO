import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Clock3,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { apiRequest } from '../utils/api';
import {
  EmptyState,
  Panel,
  SectionHeader,
  SkeletonBlock,
  StatusBadge,
  formatCurrency,
} from '../components/user/dashboard/TravelUI';

type BusResult = {
  id: string;
  tripId?: string;
  busName: string;
  busNumber?: string;
  busType?: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  rating: number;
  reviewCount: number;
  travelDate?: string;
  amenities?: string[];
};

type LocationResponse = { success: boolean; locations: string[] };
type SearchResponse = { success: boolean; buses: BusResult[] };

function SearchBusesPage() {
  const [locations, setLocations] = useState<string[]>([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [priceRange, setPriceRange] = useState('500-1000');
  const [buses, setBuses] = useState<BusResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const [busType, setBusType] = useState<'all' | 'ac' | 'non-ac' | 'sleeper' | 'seater'>('all');

  useEffect(() => {
    // If backend is unavailable, keep the page visually stable by surfacing a UI error
    // instead of leaving the component in an empty/unstyled-looking state.
    apiRequest<LocationResponse>('/buses/locations')
      .then((response) => {
        const nextLocations = response.locations || [];
        setLocations(nextLocations);
        if (nextLocations.length >= 2) {
          setSource(nextLocations[0]);
          setDestination(nextLocations[1]);
        }
      })
      .catch((err) => {
        setLocations([]);
        setError(err instanceof Error ? err.message : 'Failed to load locations.');
      });
  }, []);

  useEffect(() => {
    if (!date) {
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
    }
  }, [date]);

  const runSearch = async () => {
    if (!source || !destination || !date) {
      setError('Please select source, destination, and travel date.');
      return;
    }

    setLoading(true);
    setError('');
    setResultsLoaded(false);

    try {
      const [minPrice, maxPrice] = priceRange.split('-');
      const query = new URLSearchParams({
        source,
        destination,
        date,
      });

      if (minPrice) query.set('minPrice', minPrice);
      if (maxPrice && maxPrice !== '2000+') query.set('maxPrice', maxPrice);

      const response = await apiRequest<SearchResponse>(`/buses/search?${query.toString()}`);
      setBuses(response.buses || []);
      setResultsLoaded(true);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to search buses.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    return buses.filter((bus) => {
      const text = `${bus.busType || ''} ${bus.amenities?.join(' ') || ''}`.toLowerCase();
      const isAC = text.includes('ac') && !text.includes('non-ac') && !text.includes('non ac');
      const isNonAC = text.includes('non-ac') || text.includes('non ac') || text.includes('standard');
      const isSleeper = text.includes('sleeper');
      const isSeater = text.includes('seater');

      if (busType === 'ac' && !isAC) return false;
      if (busType === 'non-ac' && !isNonAC) return false;
      if (busType === 'sleeper' && !isSleeper) return false;
      if (busType === 'seater' && !isSeater) return false;

      return true;
    });
  }, [buses, busType]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_26%),linear-gradient(180deg,#050816_0%,#111827_100%)] dark:text-slate-100">
      <Navbar />

      <section className="border-b border-white/30 bg-white/60 px-4 py-10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-teal-600 ring-1 ring-inset ring-teal-500/20 dark:text-teal-300">
              <Search className="h-4 w-4" />
              Search buses
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Compare live buses with a premium route search experience.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300 sm:text-base">
              Filter by comfort, timing, and fare before moving directly to seat selection and checkout.
            </p>
          </div>

          <Panel className="border-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.96),rgba(15,118,110,0.82),rgba(37,99,235,0.78))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Active routes</p>
                <p className="mt-2 text-4xl font-semibold text-white">{locations.length}</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Fast checkout</p>
                <p className="mt-2 text-4xl font-semibold text-white">24/7</p>
              </div>
              <div className="col-span-2 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Search date</p>
                <p className="mt-2 text-lg font-medium text-white/90">{date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pick your travel date'}</p>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Panel className="sticky top-24 h-fit space-y-5">
            <SectionHeader title="Search and filter" subtitle="Lock in your route, price band, and comfort level." />

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">From</span>
                <select value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-900/70">
                  {locations.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">To</span>
                <select value={destination} onChange={(event) => setDestination(event.target.value)} className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-900/70">
                  {locations.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Journey date</span>
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-900/70" />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Price range</span>
                <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-teal-500 dark:border-white/10 dark:bg-slate-900/70">
                  {['0-500', '500-1000', '1000-2000', '2000+'].map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><Filter className="h-4 w-4 text-teal-500" />Bus type</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'ac', label: 'AC' },
                  { value: 'non-ac', label: 'Non-AC' },
                  { value: 'sleeper', label: 'Sleeper' },
                  { value: 'seater', label: 'Seater' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBusType(option.value as typeof busType)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${busType === option.value ? 'bg-slate-900 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-900' : 'bg-white/80 text-slate-600 hover:-translate-y-0.5 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={runSearch} disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:from-teal-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Searching...' : 'Find buses'}
            </button>
          </Panel>

          <div className="space-y-6">
            <Panel>
              <SectionHeader
                title="Live bus results"
                subtitle="Premium intercity options with comfort badges, availability, and one-click seat selection."
                action={<div className="inline-flex items-center gap-2 rounded-full bg-teal-500/12 px-3 py-1 text-xs font-semibold text-teal-600 ring-1 ring-inset ring-teal-500/20 dark:text-teal-300"><Sparkles className="h-3.5 w-3.5" />Real time</div>}
              />

              <div className="mt-5 space-y-4">
                {!resultsLoaded && !loading && (
                  <EmptyState
                    title="Set your route to see buses"
                    description="Use the filter panel to search live inventory and compare departures in a polished list view."
                    icon={<BusFront className="h-7 w-7" />}
                  />
                )}

                {error && <div className="rounded-2xl border border-rose-200 bg-rose-500/10 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-200">{error}</div>}

                {loading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <Panel key={item} className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <SkeletonBlock className="h-5 w-44" />
                            <SkeletonBlock className="h-4 w-56" />
                            <SkeletonBlock className="h-4 w-32" />
                          </div>
                          <SkeletonBlock className="h-12 w-24" />
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <SkeletonBlock className="h-16" />
                          <SkeletonBlock className="h-16" />
                          <SkeletonBlock className="h-16" />
                        </div>
                      </Panel>
                    ))}
                  </div>
                )}

                {!loading && resultsLoaded && filteredResults.length === 0 && !error && (
                  <EmptyState
                    title="No buses found"
                    description="Try another price range or route pair to reveal more live results."
                    icon={<Filter className="h-7 w-7" />}
                  />
                )}

                <AnimatePresence mode="popLayout">
                  {!loading && filteredResults.map((bus, index) => (
                    <motion.div
                      key={bus.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.22 }}
                      className="rounded-3xl border border-white/25 bg-white/78 p-5 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{bus.busName}</h3>
                            <StatusBadge tone={bus.busType?.toLowerCase().includes('sleeper') ? 'info' : 'success'}>{bus.busType || 'Live trip'}</StatusBadge>
                            {!!bus.busNumber && <span className="rounded-full bg-slate-500/12 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/15 dark:text-slate-300">{bus.busNumber}</span>}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-300">{bus.source} → {bus.destination}</p>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-950/5 px-4 py-3 dark:bg-white/5">
                              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Departure</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{bus.departureTime}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-950/5 px-4 py-3 dark:bg-white/5">
                              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Arrival</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{bus.arrivalTime}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-950/5 px-4 py-3 dark:bg-white/5">
                              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Travel date</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{date}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{bus.rating.toFixed(1)}</span>
                            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{bus.availableSeats} seats left</span>
                            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{bus.reviewCount} reviews</span>
                            {!!bus.amenities?.length && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{bus.amenities.slice(0, 3).join(' • ')}</span>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-5 text-white shadow-lg shadow-cyan-500/20 lg:min-w-[220px] lg:flex-col lg:items-stretch">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-white/75">Fare</p>
                            <p className="mt-2 text-3xl font-semibold">{formatCurrency(bus.price)}</p>
                            <p className="text-sm text-white/80">Per seat</p>
                          </div>
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <RouterLink
                              to={`/seat-selection/${bus.tripId || bus.id}?date=${encodeURIComponent(date)}`}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/10 transition hover:bg-slate-100"
                            >
                              View Seats
                              <ArrowRight className="h-4 w-4" />
                            </RouterLink>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Panel>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SearchBusesPage;
