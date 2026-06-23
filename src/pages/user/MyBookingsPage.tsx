import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  Search,
  Ticket,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../utils/api';
import {
  EmptyState,
  Panel,
  PillButton,
  SectionHeader,
  SkeletonBlock,
  StatusBadge,
  formatCurrency,
} from '../../components/user/dashboard/TravelUI';
import { syncSocketAuth } from '../../utils/socket';

type Booking = {
  id: string;
  busName: string;
  from: string;
  to: string;
  journeyDate: string;
  departureTime?: string;
  seatNumber: number[];
  passengerName?: string;
  price?: number;
  status?: string;
  totalPrice?: number;
  transactionStatus?: string;
};

function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState<string | undefined>(undefined);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'confirmed' | 'cancelled' | 'completed' | 'all'>('confirmed');

  const fetch = async () => {
    try {
      setLoading(true);
      const resp = await apiRequest<{ bookings: Booking[] }>('/bookings/user');
      setBookings(resp.bookings || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();

    const socket = syncSocketAuth();
    socket.connect();
    const handler = () => fetch();
    socket.on('booking:update', handler);

    return () => {
      socket.off('booking:update', handler);
      socket.disconnect();
    };
  }, []);

  const handleDownload = (id: string) => {
    const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/bookings/${id}/ticket`;
    window.open(url, '_blank');
  };

  const handleCancel = async (id: string) => {
    try {
      const loadingToast = toast.loading('Cancelling booking...');
      await apiRequest(`/bookings/${id}/cancel`, { method: 'PATCH' });
      await fetch();
      toast.success('Booking cancelled successfully.', { id: loadingToast });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel booking');
      toast.error('Could not cancel the booking.');
    }
  };

  const bookingStats = useMemo(() => {
    const normalized = bookings.map((booking) => String(booking.status || 'confirmed').toLowerCase());
    return {
      confirmed: normalized.filter((status) => status === 'confirmed' || status === 'upcoming').length,
      cancelled: normalized.filter((status) => status === 'cancelled' || status === 'refunded').length,
      completed: normalized.filter((status) => status === 'completed').length,
      total: bookings.length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(booking.status || 'confirmed').toLowerCase();
      if (filter === 'all') return true;
      if (filter === 'confirmed') return status === 'confirmed' || status === 'upcoming';
      if (filter === 'cancelled') return status === 'cancelled' || status === 'refunded';
      return status === 'completed';
    });
  }, [bookings, filter]);

  if (loading) return <div className="p-4">Loading bookings...</div>;

  const statCards = [
    {
      title: 'Confirmed',
      value: bookingStats.confirmed,
      subtitle: 'Active journeys awaiting travel',
      icon: <CheckCircle2 className="h-5 w-5" />,
      accentClassName: 'from-emerald-500 via-teal-500 to-cyan-600',
      trend: 'Live',
    },
    {
      title: 'Cancelled',
      value: bookingStats.cancelled,
      subtitle: 'Trips cancelled or refunded',
      icon: <XCircle className="h-5 w-5" />,
      accentClassName: 'from-rose-500 via-pink-500 to-red-600',
      trend: 'Watch',
    },
    {
      title: 'Completed',
      value: bookingStats.completed,
      subtitle: 'Trips already wrapped up',
      icon: <Ticket className="h-5 w-5" />,
      accentClassName: 'from-amber-500 via-orange-500 to-rose-500',
      trend: 'Done',
    },
    {
      title: 'Total',
      value: bookingStats.total,
      subtitle: 'All bookings in your account',
      icon: <CalendarDays className="h-5 w-5" />,
      accentClassName: 'from-cyan-500 via-blue-600 to-indigo-700',
      trend: 'All',
    },
  ] as const;

  return (
    <div className="space-y-6 pb-8">
      <Panel className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.22),_transparent_28%),linear-gradient(135deg,rgba(7,89,133,0.96),rgba(6,182,212,0.8),rgba(15,118,110,0.85))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
        <div className="grid gap-5 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Booking management</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Your tickets, cancellations, and ride history in one polished dashboard.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">Track confirmed journeys, view tickets, download PDFs, and cancel trips from a premium control surface built for frequent travelers.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/65">Active bookings</p>
              <p className="mt-3 text-4xl font-semibold text-white">{bookingStats.confirmed}</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/65">Completed</p>
              <p className="mt-3 text-4xl font-semibold text-white">{bookingStats.completed}</p>
            </div>
            <div className="col-span-2 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-white/65">Travel momentum</p>
              <p className="mt-3 text-lg font-medium text-white/90">{bookingStats.total > 0 ? `${Math.round((bookingStats.confirmed / bookingStats.total) * 100)}% of your tickets are live journeys.` : 'No bookings yet. Your first premium trip will appear here.'}</p>
            </div>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Panel key={card.title} className="relative overflow-hidden p-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accentClassName} opacity-90`} />
            <div className="relative flex items-start justify-between gap-3 p-5 text-white">
              <div className="space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/20 backdrop-blur">
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{card.title}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
                  <p className="mt-2 text-sm text-white/75">{card.subtitle}</p>
                </div>
              </div>
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/85">{card.trend}</span>
            </div>
          </Panel>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <div className="space-y-6">
          <Panel>
            <SectionHeader title="Booking filters" subtitle="Switch between confirmed, cancelled, and completed journeys." action={<div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300"><Filter className="h-4 w-4" />Refine</div>} />

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'completed', label: 'Completed' },
                { value: 'all', label: 'All bookings' },
              ].map((item) => (
                <PillButton key={item.value} active={filter === item.value} onClick={() => setFilter(item.value as typeof filter)}>
                  {item.label}
                </PillButton>
              ))}
            </div>
          </Panel>

          {error && <Panel className="border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-200">{error}</Panel>}

          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <EmptyState
                title="No bookings match this filter"
                description="Try another status or make a new booking to populate the management dashboard."
                icon={<Search className="h-7 w-7" />}
              />
            ) : (
              filteredBookings.map((booking) => {
                const status = String(booking.status || 'confirmed').toLowerCase();
                const tone = status === 'cancelled' || status === 'refunded' ? 'danger' : status === 'completed' ? 'neutral' : 'success';
                const seats = Array.isArray(booking.seatNumber) ? booking.seatNumber.join(', ') : String(booking.seatNumber || '—');

                return (
                  <motion.div key={booking.id} whileHover={{ y: -3 }} className="rounded-3xl border border-white/20 bg-white/80 p-5 shadow-[0_20px_70px_-34px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{booking.busName}</h3>
                          <StatusBadge tone={tone}>{status}</StatusBadge>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-300">{booking.from} → {booking.to}</p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-slate-950/5 p-3 dark:bg-white/5">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Journey</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{booking.journeyDate}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-950/5 p-3 dark:bg-white/5">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Seats</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{seats}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-950/5 p-3 dark:bg-white/5">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Fare</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(booking.totalPrice ?? booking.price ?? 0)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                        <button type="button" onClick={() => setTicketId(booking.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                          <Eye className="h-4 w-4" />
                          View ticket
                        </button>
                        <button type="button" onClick={() => handleDownload(booking.id)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        {status !== 'cancelled' && status !== 'refunded' && status !== 'completed' && (
                          <button type="button" onClick={() => setCancelTarget(booking)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-rose-600">
                            <XCircle className="h-4 w-4" />
                            Cancel booking
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <Panel>
            <SectionHeader title="Quick insights" subtitle="A compact snapshot of your travel activity." />
            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-5 text-white shadow-lg shadow-slate-950/20">
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Most recent action</p>
                <p className="mt-3 text-lg font-semibold">{filteredBookings[0]?.busName || 'No recent booking yet'}</p>
                <p className="mt-1 text-sm text-white/75">{filteredBookings[0] ? `Status: ${String(filteredBookings[0].status || 'confirmed').toUpperCase()}` : 'Your next ticket will appear here.'}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Need help?</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use ticket previews for boarding details, and download the PDF before travel.</p>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      <AnimatePresence>
        {ticketId && (
          <BookingTicketModal bookingId={ticketId} onClose={() => setTicketId(undefined)} />
        )}
        {cancelTarget && (
          <CancelBookingModal booking={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={async () => {
            const bookingId = cancelTarget.id;
            setCancelTarget(null);
            await handleCancel(bookingId);
          }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function BookingTicketModal({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const ticketUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/bookings/${bookingId}/ticket`;

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: 0.96, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 18 }} className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/15 bg-white shadow-[0_30px_120px_-40px_rgba(15,23,42,0.4)] dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Ticket preview</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Downloadable boarding ticket</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-950/5 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-white/10 dark:text-white">Close</button>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_0.75fr]">
          <iframe title="ticket preview" src={ticketUrl} className="h-[420px] w-full rounded-3xl border border-slate-200 dark:border-white/10" />
          <div className="space-y-4 rounded-3xl bg-slate-950/5 p-4 dark:bg-white/5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Actions</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Open the live PDF, copy the booking link, or keep this modal open while you manage the trip.</p>
            </div>
            <a href={ticketUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              Open PDF
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(ticketUrl);
                toast.success('Ticket link copied to clipboard.');
              }}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
            >
              Copy link
            </button>
            <div className="rounded-2xl bg-teal-500/10 p-4 text-sm text-teal-700 dark:text-teal-200">
              Your ticket contains the QR-ready booking information and can be shown offline at the boarding gate.
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CancelBookingModal({ booking, onClose, onConfirm }: { booking: Booking; onClose: () => void; onConfirm: () => Promise<void> }) {
  const status = String(booking.status || 'confirmed').toLowerCase();
  const seats = Array.isArray(booking.seatNumber) ? booking.seatNumber.join(', ') : String(booking.seatNumber || '—');

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ scale: 0.96, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 18 }} className="w-full max-w-xl rounded-[28px] border border-white/15 bg-white p-6 shadow-[0_30px_120px_-40px_rgba(15,23,42,0.4)] dark:bg-slate-950">
        <p className="text-xs uppercase tracking-[0.28em] text-rose-500">Confirm cancellation</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Cancel {booking.busName}?</h3>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">This will cancel the booking for {booking.from} → {booking.to} on {booking.journeyDate}. Current status: {status.toUpperCase()}.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-950/5 p-4 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Seats</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{seats}</p>
          </div>
          <div className="rounded-2xl bg-slate-950/5 p-4 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Fare</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(booking.totalPrice ?? booking.price ?? 0)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
            Keep booking
          </button>
          <button type="button" onClick={() => void onConfirm()} className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20">
            Confirm cancellation
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default MyBookingsPage;