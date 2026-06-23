import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../../features/search/components/FilterSidebar';
import ResultsList from '../../features/search/components/ResultsList';
import SearchHeader from '../../features/search/components/SearchHeader';
import SearchSummary from '../../features/search/components/SearchSummary';
import SortDropdown from '../../features/search/components/SortDropdown';
import {
  getDepartureBucket,
  type BusResult,
  type SearchFilters,
  type SortOption,
} from '../../features/search/searchData';
import { apiRequest } from '../../utils/api';

const today = new Date().toISOString().split('T')[0];

const defaultFilters: SearchFilters = {
  departureTimes: [],
  busTypes: [],
  amenities: [],
  maxPrice: 1500,
  rating: '',
  availableOnly: false,
};

function SearchFlowPage() {
  const [params, setParams] = useSearchParams();
  const [from, setFrom] = useState(params.get('source') || params.get('from') || 'Kolhapur');
  const [to, setTo] = useState(params.get('destination') || params.get('to') || 'Pune');
  const [date, setDate] = useState(params.get('date') || today);
  const [passengers, setPassengers] = useState(Number(params.get('passengers') || 1));
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);
  const [seatPreviewBusId, setSeatPreviewBusId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buses, setBuses] = useState<BusResult[]>([]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ source: from, destination: to, date });

    apiRequest<{ buses: BackendBus[] }>(`/buses/search?${query.toString()}`)
      .then((response) => setBuses(response.buses.map(mapBackendBus)))
      .catch((fetchError) => {
        setBuses([]);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch buses.');
      })
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const filteredBuses = useMemo(() => {
    try {
      setError('');
      const nextResults = buses.filter((bus) => {
        if (filters.departureTimes.length > 0 && !filters.departureTimes.includes(getDepartureBucket(bus.departureTime))) {
          return false;
        }

        if (filters.busTypes.length > 0 && !filters.busTypes.includes(bus.busType)) {
          return false;
        }

        if (filters.amenities.length > 0 && !filters.amenities.every((amenity) => bus.amenities.includes(amenity))) {
          return false;
        }

        if (bus.price > filters.maxPrice) {
          return false;
        }

        if (filters.rating === '4★ & Above' && bus.rating < 4) {
          return false;
        }

        if (filters.rating === '3★ & Above' && bus.rating < 3) {
          return false;
        }

        if (filters.availableOnly && bus.availableSeats <= 0) {
          return false;
        }

        return true;
      });

      return sortBuses(nextResults, sortBy);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not filter buses.');
      return [];
    }
  }, [buses, filters, sortBy]);

  const appliedFiltersCount =
    filters.departureTimes.length +
    filters.busTypes.length +
    filters.amenities.length +
    (filters.maxPrice < 1500 ? 1 : 0) +
    (filters.rating ? 1 : 0) +
    (filters.availableOnly ? 1 : 0);

  const submitSearch = () => {
    setParams({
      source: from,
      destination: to,
      date,
      passengers: String(passengers),
    });
    setExpandedBusId(null);
    setSeatPreviewBusId(null);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSortBy('recommended');
    setExpandedBusId(null);
    setSeatPreviewBusId(null);
  };

  const changeDate = () => {
    const next = new Date(date || today);
    next.setDate(next.getDate() + 1);
    setDate(next.toISOString().split('T')[0]);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SearchHeader
        from={from}
        to={to}
        date={date}
        passengers={passengers}
        onFromChange={setFrom}
        onToChange={setTo}
        onDateChange={setDate}
        onPassengersChange={setPassengers}
        onSubmit={submitSearch}
      />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <div className="space-y-4">
          <FilterSidebar
            filters={filters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen((value) => !value)}
            onChange={setFilters}
            onClear={resetFilters}
          />
        </div>

        <section className="min-w-0 space-y-5">
          <SearchSummary count={filteredBuses.length} from={from} to={to} date={date} filtersCount={appliedFiltersCount} />

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
              Showing only buses returned from the database.
            </p>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          <ResultsList
            buses={filteredBuses}
            expandedBusId={expandedBusId}
            seatPreviewBusId={seatPreviewBusId}
            onToggleDetails={(busId) => {
              setExpandedBusId((current) => (current === busId ? null : busId));
              setSeatPreviewBusId(null);
            }}
            onToggleSeats={(busId) => {
              setSeatPreviewBusId((current) => (current === busId ? null : busId));
              setExpandedBusId(null);
            }}
            onReset={resetFilters}
            onChangeDate={changeDate}
            loading={loading}
            error={error}
          />
        </section>
      </div>
    </main>
  );
}

type BackendBus = {
  id: string;
  tripId?: string;
  busName?: string;
  busNumber?: string;
  busType?: string;
  source?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  totalSeats?: number;
  availableSeats?: number;
  bookedSeats?: number[];
  reservedSeats?: number[];
  rating?: string | number;
  reviewCount?: number;
  amenities?: string[];
};

function mapBackendBus(bus: BackendBus): BusResult {
  const totalSeats = Number(bus.totalSeats || bus.availableSeats || 0);
  const unavailable = new Set([...(bus.bookedSeats || []), ...(bus.reservedSeats || [])].map(String));
  const seats = Array.from({ length: totalSeats }, (_, index) => {
    const id = String(index + 1);
    return { id, status: unavailable.has(id) ? 'booked' as const : 'available' as const };
  });

  return {
    id: bus.tripId || bus.id,
    operatorName: bus.busName || 'Bus',
    busType: (bus.busType || 'AC Seater') as BusResult['busType'],
    busNumber: bus.busNumber || '',
    departureTime: bus.departureTime || '',
    arrivalTime: bus.arrivalTime || '',
    durationMinutes: calculateDuration(bus.departureTime || '', bus.arrivalTime || ''),
    boardingLocation: bus.source || '',
    droppingLocation: bus.destination || '',
    availableSeats: Number(bus.availableSeats || 0),
    price: Number(bus.price || 0),
    rating: Number(bus.rating || 0),
    reviewCount: Number(bus.reviewCount || 0),
    amenities: bus.amenities || [],
    images: [],
    boardingPoints: bus.source ? [{ name: bus.source, time: bus.departureTime || '' }] : [],
    droppingPoints: bus.destination ? [{ name: bus.destination, time: bus.arrivalTime || '' }] : [],
    cancellationPolicy: [],
    reviews: [],
    operatorInfo: '',
    seats,
  };
}

function calculateDuration(departure: string, arrival: string) {
  if (!departure || !arrival) return 0;
  const [dh, dm] = departure.split(':').map(Number);
  const [ah, am] = arrival.split(':').map(Number);
  if ([dh, dm, ah, am].some((value) => Number.isNaN(value))) return 0;
  const start = dh * 60 + dm;
  let end = ah * 60 + am;
  if (end < start) end += 24 * 60;
  return end - start;
}

function sortBuses(buses: BusResult[], sortBy: SortOption) {
  const sorted = [...buses];

  if (sortBy === 'lowest-price') return sorted.sort((a, b) => a.price - b.price);
  if (sortBy === 'highest-price') return sorted.sort((a, b) => b.price - a.price);
  if (sortBy === 'highest-rating') return sorted.sort((a, b) => b.rating - a.rating);
  if (sortBy === 'earliest-departure') return sorted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  if (sortBy === 'latest-departure') return sorted.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
  if (sortBy === 'fastest-journey') return sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);

  return sorted.sort((a, b) => b.rating - a.rating || a.price - b.price);
}

export default SearchFlowPage;
