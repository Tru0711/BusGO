import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Download, Ticket } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { EmptyState, Panel, SectionHeader, SkeletonBlock, formatCurrency } from '../../components/user/dashboard/TravelUI';

type Booking = {
  id: string;
  ticketId?: string;
  transactionId?: string;
  passengerName?: string;
  bus?: {
    busName?: string;
    source?: string;
    destination?: string;
    departureTime?: string;
    arrivalTime?: string;
  };
  busName?: string;
  from?: string;
  to?: string;
  journeyDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  seatNumber?: Array<string | number>;
  seats?: Array<string | number>;
  date?: string;
  totalPrice: number;
  status?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  isDemoPayment?: boolean;
};

function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID missing.');
      setLoading(false);
      return;
    }

    apiRequest<{ booking: Booking }>(`/bookings/${bookingId}`)
      .then((response) => setBooking(response.booking))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to load booking confirmation.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <Panel className="space-y-4">
          <SkeletonBlock className="h-10 w-72" />
          <SkeletonBlock className="h-4 w-96" />
        </Panel>
        <Panel className="space-y-4">
          <SkeletonBlock className="h-[380px]" />
        </Panel>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>;
  }

  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        description="We could not load this booking confirmation. Please go back to your bookings or search again."
        icon={<Ticket className="h-7 w-7" />}
        action={<RouterLink to="/app/bookings" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">My bookings</RouterLink>}
      />
    );
  }

  const ticketUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/bookings/${booking.id}/ticket`;
  const busName = booking.bus?.busName || booking.busName || 'BusGo coach';
  const routeFrom = booking.bus?.source || booking.from || '';
  const routeTo = booking.bus?.destination || booking.to || '';
  const departureTime = booking.bus?.departureTime || booking.departureTime || '';
  const arrivalTime = booking.bus?.arrivalTime || booking.arrivalTime || '';
  const travelDate = booking.journeyDate || booking.date || new Date().toISOString();
  const seats = (booking.seatNumber || booking.seats || []).map(String);
  const status = booking.bookingStatus || booking.status || 'confirmed';
  const ticketText = [
    `Ticket ID: ${booking.ticketId || `TKT-${booking.id.slice(-8).toUpperCase()}`}`,
    `Booking ID: ${booking.id}`,
    `Transaction ID: ${booking.transactionId || ''}`,
    `Passenger: ${booking.passengerName || ''}`,
    `Bus: ${busName}`,
    `Route: ${routeFrom} to ${routeTo}`,
    `Seats: ${seats.join(', ')}`,
    `Travel Date: ${travelDate}`,
  ].join('\n');

  return (
    <div className="space-y-6 pb-8">
      <Panel className="border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
              <CheckCircle2 className="h-4 w-4" />
              Booking confirmed
            </span>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Your BusGo trip is paid and ready to board.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
              Ticket is generated only for paid bookings. Keep these details handy on travel day.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Booking ID</p>
            <p className="mt-2 break-all text-sm font-bold text-slate-950 dark:text-white">{booking.id}</p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Status</p>
            <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{status}</p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Panel>
          <SectionHeader title="Journey summary" subtitle="Passenger, route, bus, seat, and travel details." />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Passenger" value={booking.passengerName || 'Passenger'} />
            <Info label="Bus" value={busName} />
            <Info label="Route" value={`${routeFrom} to ${routeTo}`} />
            <Info label="Travel Date" value={new Date(travelDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <Info label="Departure" value={departureTime} />
            <Info label="Arrival" value={arrivalTime} />
            <Info label="Seats" value={seats.join(', ')} />
            <Info label="Transaction ID" value={booking.transactionId || 'Pending sync'} />
          </div>
        </Panel>

        <aside className="space-y-6">
          <Panel>
            <SectionHeader title="Ticket actions" subtitle={booking.isDemoPayment ? 'Demo Payment System. No Real Money Used.' : 'Save your generated ticket.'} />
            <div className="mt-5 space-y-3">
              {booking.isDemoPayment ? (
                <button type="button" onClick={() => void navigator.clipboard.writeText(ticketText)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                  <Download className="h-4 w-4" />
                  Copy demo ticket
                </button>
              ) : (
                <a href={ticketUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                  <Download className="h-4 w-4" />
                  Open ticket
                </a>
              )}
              <div className="rounded-2xl bg-teal-50 p-4 text-sm font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
                {booking.paymentStatus === 'paid' || booking.isDemoPayment ? 'Payment Status: paid' : 'Ticket unavailable until payment is paid.'}
              </div>
            </div>
          </Panel>

          <Panel>
            <Info label="Fare" value={formatCurrency(booking.totalPrice)} />
            <div className="mt-4">
              <Info label="Seats" value={String(seats.length)} />
            </div>
          </Panel>
        </aside>
      </div>

      <Panel>
        <SectionHeader title="Next steps" subtitle="Continue to your bookings dashboard or search another route." />
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => navigate('/app/bookings')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
            My bookings
            <ArrowRight className="h-4 w-4" />
          </button>
          <RouterLink to="/app" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
            Back to dashboard
          </RouterLink>
          <RouterLink to="/search" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
            Search another bus
          </RouterLink>
        </div>
      </Panel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 break-words text-base font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export default BookingConfirmationPage;
