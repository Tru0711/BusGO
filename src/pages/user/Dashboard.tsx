import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  Clock3,
  Filter,
  Fuel,
  IndianRupee,
  MapPinned,
  MoonStar,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Ticket,
  LoaderCircle,
  UserCheck,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../utils/api';
import {
  AnimatedCounter,
  EmptyState,
  Panel,
  PillButton,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  formatCurrency,
} from '../../components/user/dashboard/TravelUI';

type DashboardData = {
  stats?: {
    totalBookings?: number;
    upcomingTrips?: number;
    cancelledTrips?: number;
    totalSpent?: number;
  };
  upcomingTrips?: UpcomingJourney[];
  offers?: Array<{ id: string; label?: string; title?: string; description?: string; discountPercent?: number }>;
  user?: { id: string; name?: string; email?: string; phone?: string };
};

type DashboardResponse = {
  dashboard?: DashboardData;
  stats?: DashboardData['stats'];
  upcomingTrips?: UpcomingJourney[];
  user?: DashboardData['user'];
};

type BusSearchResponse = {
  buses?: any[];
  data?: any[];
};

type UpcomingJourney = {
  id: string;
  busName?: string;
  from?: string;
  to?: string;
  journeyDate?: string;
  departureTime?: string;
  seatNumber?: number[] | number;
  status?: string;
  price?: number;
};

type BusResult = {
  id?: string;
  tripId?: string;
  busId?: string;
  busName?: string;
  busNumber?: string;
  busType?: string;
  source?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  travelDate?: string;
  price?: number;
  totalSeats?: number;
  availableSeats?: number;
  rating?: string | number;
  reviewCount?: number;
  amenities?: string[];
  bookedSeats?: number[];
  reservedSeats?: number[];
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchSource, setSearchSource] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [busTypeFilter, setBusTypeFilter] = useState<'all' | 'ac' | 'non-ac' | 'sleeper' | 'seater'>('all');
  const [priceBand, setPriceBand] = useState<'all' | 'under1500' | 'under2500' | 'under3500' | 'above3500'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating' | 'departure'>('recommended');

  useEffect(() => {
    let mounted = true;
    apiRequest<DashboardResponse>('/dashboard/user').then(d => {
      if (!mounted) return;
      setData(d.dashboard ?? d);
    }).catch(() => {}).finally(() => mounted && setLoading(false));

    apiRequest<{ unreadCount: number }>('/notifications/unread-count')
      .then((response) => {
        if (mounted) {
          setUnreadNotifications(response.unreadCount || 0);
        }
      })
      .catch(() => undefined);

    return () => { mounted = false; };
  }, []);

  async function handleSearch() {
    if (!searchSource.trim() || !searchDestination.trim() || !searchDate) {
      toast.error('Add source, destination, and travel date to search live buses.');
      return;
    }

    setLoadingResults(true);
    setSearchPerformed(true);
    const loadingToast = toast.loading('Searching live buses...');

    try {
      const q = new URLSearchParams({
        source: searchSource.trim(),
        destination: searchDestination.trim(),
        date: searchDate,
      }).toString();
      const res = await apiRequest<BusSearchResponse>(`/buses/search?${q}`);
      setResults(res.buses || res.data || []);
      toast.success(`Found ${(res.buses || res.data || []).length} live trip${(res.buses || res.data || []).length === 1 ? '' : 's'}.`, {
        id: loadingToast,
      });
    } catch (err) {
      setResults([]);
      toast.error('Could not load live buses right now.', { id: loadingToast });
    } finally {
      setLoadingResults(false);
    }
  }

  const filteredResults = useMemo(() => {
    const normalizedType = (value: unknown) => String(value || '').toLowerCase();
    const parsePrice = (value: unknown) => Number(value || 0);

    return (results as BusResult[])
      .filter((trip) => {
        const typeText = normalizedType(trip.busType);
        const amenitiesText = normalizedType(trip.amenities?.join(' '));
        const sleeper = typeText.includes('sleeper') || amenitiesText.includes('sleeper');
        const seater = typeText.includes('seater') || amenitiesText.includes('seater');
        const ac = typeText.includes('ac') && !typeText.includes('non-ac') && !typeText.includes('non ac');
        const nonAc = typeText.includes('non-ac') || typeText.includes('non ac') || typeText.includes('standard');

        if (busTypeFilter === 'ac' && !ac) return false;
        if (busTypeFilter === 'non-ac' && !nonAc) return false;
        if (busTypeFilter === 'sleeper' && !sleeper) return false;
        if (busTypeFilter === 'seater' && !seater) return false;

        const price = parsePrice(trip.price);
        if (priceBand === 'under1500' && price >= 1500) return false;
        if (priceBand === 'under2500' && price >= 2500) return false;
        if (priceBand === 'under3500' && price >= 3500) return false;
        if (priceBand === 'above3500' && price <= 3500) return false;

        return true;
      })
      .sort((left, right) => {
        if (sortBy === 'price-asc') return Number(left.price || 0) - Number(right.price || 0);
        if (sortBy === 'price-desc') return Number(right.price || 0) - Number(left.price || 0);
        if (sortBy === 'rating') return Number(right.rating || 0) - Number(left.rating || 0);
        if (sortBy === 'departure') return String(left.departureTime || '').localeCompare(String(right.departureTime || ''));
        return Number(right.rating || 0) - Number(left.rating || 0) || Number(left.price || 0) - Number(right.price || 0);
      });
  }, [results, busTypeFilter, priceBand, sortBy]);

  const summaryStats = data.stats || {};
  const currentUser = data.user;
  const recentJourneys = data.upcomingTrips || [];

  const statCards = [
    {
      title: 'Total Bookings',
      value: summaryStats.totalBookings || 0,
      subtitle: 'Trips booked across your account',
      icon: <Ticket className="h-5 w-5" />,
      accentClassName: 'from-cyan-500 via-blue-600 to-indigo-700',
      trend: 'Active',
    },
    {
      title: 'Upcoming Trips',
      value: summaryStats.upcomingTrips || 0,
      subtitle: 'Journeys already on your radar',
      icon: <CalendarDays className="h-5 w-5" />,
      accentClassName: 'from-teal-500 via-emerald-500 to-cyan-600',
      trend: 'Soon',
    },
    {
      title: 'Total Money Spent',
      value: summaryStats.totalSpent || 0,
      valuePrefix: '₹',
      subtitle: 'Cumulative spend on BusGo',
      icon: <IndianRupee className="h-5 w-5" />,
      accentClassName: 'from-amber-500 via-orange-500 to-rose-500',
      trend: 'Value',
    },
    {
      title: 'Cancelled Trips',
      value: summaryStats.cancelledTrips || 0,
      subtitle: 'Bookings that were refunded or cancelled',
      icon: <Sparkles className="h-5 w-5" />,
      accentClassName: 'from-slate-700 via-slate-800 to-slate-900',
      trend: 'Watch',
    },
    {
      title: 'Unread Messages',
      value: unreadNotifications,
      subtitle: 'Notification center items waiting for you',
      icon: <Users className="h-5 w-5" />,
      accentClassName: 'from-fuchsia-600 via-violet-600 to-indigo-700',
      trend: 'Inbox',
    },
  ] as const;

  return (
    <div className="space-y-6 pb-8">
      <Panel className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.24),_transparent_28%),linear-gradient(135deg,rgba(8,47,73,0.96),rgba(15,118,110,0.82),rgba(37,99,235,0.78))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Live travel command center
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-inset ring-emerald-400/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure bookings
              </span>
            </div>

            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Find premium intercity buses with a control-center search experience.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Search live inventory, compare price and comfort, and move from discovery to booking in one polished flow.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSearch();
              }}
              className="grid gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:grid-cols-[1.1fr_1.1fr_0.9fr_auto]"
            >
              <label className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-slate-900 shadow-sm">
                <MapPinned className="h-5 w-5 text-teal-600" />
                <input
                  value={searchSource}
                  onChange={(event) => setSearchSource(event.target.value)}
                  placeholder="Source"
                  aria-label="Source"
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-slate-900 shadow-sm">
                <BusFront className="h-5 w-5 text-blue-600" />
                <input
                  value={searchDestination}
                  onChange={(event) => setSearchDestination(event.target.value)}
                  placeholder="Destination"
                  aria-label="Destination"
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 text-slate-900 shadow-sm">
                <Clock3 className="h-5 w-5 text-rose-600" />
                <input
                  value={searchDate}
                  onChange={(event) => setSearchDate(event.target.value)}
                  type="date"
                  aria-label="Travel date"
                  className="w-full bg-transparent text-sm font-medium outline-none"
                />
              </label>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/30 transition hover:bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {loadingResults ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loadingResults ? 'Searching' : 'Search buses'}
              </motion.button>
            </form>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/65">Profile snapshot</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold text-white">{currentUser?.name || 'Traveler'}</p>
                  <p className="text-sm text-white/75">{currentUser?.email || 'Your registered BusGo account'}</p>
                  <p className="text-sm text-white/75">{currentUser?.phone || 'Phone not added yet'}</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-3 text-white">
                  <UserCheck className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/65">Today&apos;s pulse</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-semibold text-white">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                  <p className="mt-1 text-sm text-white/75">Live inventory refreshes on every search.</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-3 text-white">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <div className="space-y-6">
          <Panel>
            <SectionHeader
              title="Search filters"
              subtitle="Tune the live inventory by bus type, price, and sort order."
              action={<div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300"><SlidersHorizontal className="h-4 w-4" />Refine results</div>}
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'ac', label: 'AC' },
                { value: 'non-ac', label: 'Non-AC' },
                { value: 'sleeper', label: 'Sleeper' },
                { value: 'seater', label: 'Seater' },
              ].map((item) => (
                <PillButton key={item.value} active={busTypeFilter === item.value} onClick={() => setBusTypeFilter(item.value as typeof busTypeFilter)}>
                  {item.label}
                </PillButton>
              ))}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <Filter className="h-4 w-4 text-teal-500" />
                <select value={priceBand} onChange={(event) => setPriceBand(event.target.value as typeof priceBand)} className="w-full bg-transparent outline-none">
                  <option value="all">Any price</option>
                  <option value="under1500">Under ₹1,500</option>
                  <option value="under2500">Under ₹2,500</option>
                  <option value="under3500">Under ₹3,500</option>
                  <option value="above3500">Above ₹3,500</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <MoonStar className="h-4 w-4 text-blue-500" />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="w-full bg-transparent outline-none">
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Top rated</option>
                  <option value="departure">Departure time</option>
                </select>
              </label>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <span className="text-slate-500 dark:text-slate-300">Results</span>
                <span className="font-semibold text-slate-900 dark:text-white">{loadingResults ? 'Live...' : filteredResults.length}</span>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionHeader
              title="Live bus results"
              subtitle="Compare departure, arrival, comfort, and price before you book your next seat."
              action={<div className="inline-flex items-center gap-2 rounded-full bg-teal-500/12 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-300"><Sparkles className="h-3.5 w-3.5" />Real time</div>}
            />

            <div className="mt-6 space-y-4">
              {!searchPerformed && !loadingResults && (
                <EmptyState
                  title="Search to unlock live buses"
                  description="Enter a route and date above to see trips, seat availability, and premium bus options in the live results section."
                  icon={<Search className="h-7 w-7" />}
                />
              )}

              {loadingResults && (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <Panel key={item} className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <SkeletonBlock className="h-5 w-40" />
                          <SkeletonBlock className="h-4 w-56" />
                          <SkeletonBlock className="h-4 w-32" />
                        </div>
                        <SkeletonBlock className="h-10 w-24" />
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

              <AnimatePresence mode="popLayout">
                {!loadingResults && filteredResults.length > 0 && filteredResults.map((trip, index) => {
                  const ratingValue = Number(trip.rating || 0).toFixed(1);
                  const busLabel = trip.busName || 'Premium Coach';
                  const busKind = trip.busType || (trip.amenities?.includes('Sleeper') ? 'Sleeper' : 'AC Coach');

                  return (
                    <motion.div
                      key={trip.tripId || trip.id || `${trip.busName}-${index}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.22 }}
                      className="group rounded-3xl border border-white/25 bg-white/78 p-5 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{busLabel}</h3>
                            <span className="rounded-full bg-teal-500/12 px-3 py-1 text-xs font-semibold text-teal-600 ring-1 ring-inset ring-teal-500/20 dark:text-teal-300">
                              {busKind}
                            </span>
                            {!!trip.busNumber && <span className="rounded-full bg-slate-500/12 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/15 dark:text-slate-300">{trip.busNumber}</span>}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{ratingValue || '0.0'} rating</span>
                            <span className="inline-flex items-center gap-1.5"><BusFront className="h-4 w-4" />{trip.source} → {trip.destination}</span>
                            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" />{trip.availableSeats ?? 0} seats left</span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-950/5 px-4 py-3 dark:bg-white/5">
                              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Departure</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{trip.departureTime || '--:--'}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{trip.travelDate ? new Date(trip.travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Selected date'}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-950/5 px-4 py-3 dark:bg-white/5">
                              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Arrival</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{trip.arrivalTime || '--:--'}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Estimated route completion</p>
                            </div>
                            <div className="rounded-2xl bg-slate-950/5 px-4 py-3 dark:bg-white/5">
                              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Fare</p>
                              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(trip.price || 0)}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Per seat</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-5 text-white shadow-lg shadow-cyan-500/20 lg:min-w-[230px] lg:flex-col lg:items-stretch">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-white/75">Seat availability</p>
                            <p className="mt-2 text-3xl font-semibold">{trip.availableSeats ?? 0}</p>
                            <p className="text-sm text-white/80">of {trip.totalSeats || (trip.bookedSeats?.length || 0) + (trip.reservedSeats?.length || 0) + (trip.availableSeats || 0)} seats open</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => navigate(`/seat-selection/${trip.tripId || trip.id}?date=${encodeURIComponent(searchDate || trip.travelDate || '')}`)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-950/10 transition hover:bg-slate-100"
                          >
                            View Seats
                            <ArrowRight className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>

                      {!!trip.amenities?.length && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {trip.amenities.slice(0, 5).map((amenity) => (
                            <span key={amenity} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {!loadingResults && searchPerformed && filteredResults.length === 0 && (
                <EmptyState
                  title="No buses matched your filters"
                  description="Try a different bus type, price band, or departure date to surface more live options."
                  icon={<Filter className="h-7 w-7" />}
                />
              )}
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel>
            <SectionHeader
              title="Upcoming journeys"
              subtitle="Your next travel plans at a glance with date, seat, and live status."
            />

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <SkeletonBlock key={item} className="h-28" />
                  ))}
                </div>
              ) : recentJourneys.length === 0 ? (
                <EmptyState
                  title="No upcoming journeys yet"
                  description="Once you book, your next rides will appear here with live status and travel details."
                  icon={<Ticket className="h-7 w-7" />}
                />
              ) : (
                recentJourneys.map((journey) => {
                  const status = String(journey.status || 'confirmed').toLowerCase();
                  const tone = status === 'cancelled' ? 'danger' : status === 'completed' ? 'neutral' : 'success';

                  return (
                    <motion.div key={journey.id} whileHover={{ y: -2 }} className="rounded-3xl border border-white/20 bg-white/75 p-4 shadow-[0_20px_60px_-34px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{journey.busName || 'Premium coach'}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{journey.from} → {journey.to}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${tone === 'success' ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300' : tone === 'danger' ? 'bg-rose-500/12 text-rose-600 dark:text-rose-300' : 'bg-slate-500/12 text-slate-600 dark:text-slate-300'}`}>
                          {status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-950/5 p-3 dark:bg-white/5">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Journey date</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{journey.journeyDate ? new Date(journey.journeyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'To be announced'}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-950/5 p-3 dark:bg-white/5">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Seats</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{Array.isArray(journey.seatNumber) ? journey.seatNumber.join(', ') : journey.seatNumber || '—'}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-300">{journey.departureTime || 'Flexible departure'}</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/12 px-3 py-1 text-xs font-semibold text-teal-600 ring-1 ring-inset ring-teal-500/20 dark:text-teal-300">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Live trip
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
