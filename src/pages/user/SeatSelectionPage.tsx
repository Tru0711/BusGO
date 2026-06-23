import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BusFront,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  Lock,
  ShieldCheck,
  Sparkles,
  Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../utils/api';
import { getSocket } from '../../utils/socket';
import { Panel, SectionHeader, SkeletonBlock, StatusBadge, formatCurrency } from '../../components/user/dashboard/TravelUI';

type BusDetails = {
  id: string;
  tripId?: string;
  busId?: string;
  busName: string;
  busNumber?: string;
  busType?: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  bookedSeats: number[];
  reservedSeats?: number[];
  seatMap?: Array<{ seatNumber: number; status: string; lockExpiresAt?: string | null }>;
  availableSeats: number;
  amenities?: string[];
};

function SeatSelectionPage() {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || '';
  const [bus, setBus] = useState<BusDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [lockedSeats, setLockedSeats] = useState<number[]>([]);
  const [reservationToken, setReservationToken] = useState('');
  const [lockExpiresAt, setLockExpiresAt] = useState('');
  const [now, setNow] = useState(Date.now());
  const [successBookingId, setSuccessBookingId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedSeats, setConfirmedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!busId || !date) {
      setError('Missing bus or date. Please search again.');
      setLoading(false);
      return;
    }

    apiRequest<{ bus: BusDetails }>(`/buses/${busId}?date=${encodeURIComponent(date)}`)
      .then((response) => setBus(response.bus))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to load bus details.'))
      .finally(() => setLoading(false));
  }, [busId, date]);

  useEffect(() => {
    if (!bus?.tripId) {
      return;
    }

    const socket = getSocket();
    socket.connect();
    socket.emit('trip:join', bus.tripId);

    const handleSeatUpdate = (payload: { tripId: string; bookedSeats?: number[]; reservedSeats?: number[]; releasedSeats?: number[]; action?: string }) => {
      if (payload.tripId !== bus.tripId) {
        return;
      }

      setBus((current) => {
        if (!current || !current.seatMap) {
          return current;
        }

        const bookedSet = new Set(payload.bookedSeats || []);
        const reservedSet = new Set(payload.reservedSeats || []);
        const releasedSet = new Set(payload.releasedSeats || []);

        return {
          ...current,
          seatMap: current.seatMap.map((seat) => {
            if (bookedSet.has(seat.seatNumber)) {
              return { ...seat, status: 'booked', lockExpiresAt: null };
            }

            if (reservedSet.has(seat.seatNumber)) {
              return { ...seat, status: 'reserved' };
            }

            if (releasedSet.has(seat.seatNumber)) {
              return { ...seat, status: 'available', lockExpiresAt: null };
            }

            return seat;
          }),
        };
      });
    };

    socket.on('seat:update', handleSeatUpdate);

    return () => {
      socket.off('seat:update', handleSeatUpdate);
      socket.emit('trip:leave', bus.tripId);
    };
  }, [bus?.tripId]);

  useEffect(() => {
    return () => {
      if (reservationToken && bus?.tripId && lockedSeats.length > 0) {
        void apiRequest('/bookings/release', {
          method: 'POST',
          body: {
            tripId: bus.tripId,
            seats: lockedSeats,
          },
        }).catch(() => undefined);
      }
    };
  }, [bus?.tripId, reservationToken, lockedSeats]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const seatMapByNumber = useMemo(() => new Map((bus?.seatMap || []).map((seat) => [seat.seatNumber, seat])), [bus]);
  const bookedSeatSet = useMemo(() => new Set(bus?.bookedSeats || []), [bus]);
  const reservedSeatSet = useMemo(() => new Set(bus?.reservedSeats || []), [bus]);

  const seatItems = useMemo(() => {
    const seatCount = bus?.totalSeats || bus?.seatMap?.length || 0;
    const sourceSeats = seatCount > 0 ? Array.from({ length: seatCount }, (_, index) => index + 1) : (bus?.seatMap || []).map((seat) => seat.seatNumber);

    return sourceSeats.map((seatNumber) => {
      const seatInfo = seatMapByNumber.get(seatNumber);
      const status = seatInfo?.status || (bookedSeatSet.has(seatNumber) ? 'booked' : reservedSeatSet.has(seatNumber) ? 'reserved' : 'available');

      return {
        seatNumber,
        status,
        lockExpiresAt: seatInfo?.lockExpiresAt || null,
      };
    });
  }, [bus, bookedSeatSet, reservedSeatSet, seatMapByNumber]);

  const getSeatStatus = (seatNumber: number) => {
    const seatInfo = seatMapByNumber.get(seatNumber);
    return seatInfo?.status || (bookedSeatSet.has(seatNumber) ? 'booked' : 'available');
  };

  const getSeatLabel = (seatNumber: number) => {
    const seatInfo = seatMapByNumber.get(seatNumber);
    if (seatInfo?.status === 'reserved' && seatInfo.lockExpiresAt) {
      const remaining = Math.max(0, Math.ceil((new Date(seatInfo.lockExpiresAt).getTime() - now) / 1000));
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      return `${seatNumber} (${minutes}:${String(seconds).padStart(2, '0')})`;
    }

    return String(seatNumber);
  };

  const toggleSeat = (seatNumber: number) => {
    const status = getSeatStatus(seatNumber);
    if (status === 'booked' || status === 'reserved' || status === 'female-only') {
      toast.error('That seat is not available.');
      return;
    }

    setSelectedSeats((current) =>
      current.includes(seatNumber) ? current.filter((seat) => seat !== seatNumber) : [...current, seatNumber],
    );
  };

  const confirmBooking = async () => {
    if (!bus || !date || selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      toast.error('Select at least one seat before booking.');
      return;
    }

    setBookingLoading(true);
    setError('');
    let activeReservationToken = '';
    let activeLockedSeats: number[] = [];

    try {
      const lockResponse = await apiRequest<{ reservationToken: string; lockExpiresAt: string }>('/bookings/lock', {
        method: 'POST',
        body: {
          tripId: bus.tripId || bus.id,
          selectedSeats,
        },
      });

      activeReservationToken = lockResponse.reservationToken;
      activeLockedSeats = selectedSeats;
      setReservationToken(lockResponse.reservationToken);
      setLockExpiresAt(lockResponse.lockExpiresAt);
      setLockedSeats(selectedSeats);
      toast.success('Seats locked for checkout.');

      // Create payment order on server (Razorpay)
      const orderResp = await apiRequest<{
        data: { razorpayKeyId: string; razorpayOrderId: string; amount: number; currency: string; paymentRecordId: string };
      }>('/payments/create-order', {
        method: 'POST',
        body: {
          tripId: bus.tripId || bus.id,
          selectedSeats,
          reservationToken: activeReservationToken,
        },
      });

      const { razorpayKeyId, razorpayOrderId, amount, currency, paymentRecordId } = orderResp.data;

      // Load Razorpay script
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        document.body.appendChild(script);
      });

      const options = {
        key: razorpayKeyId,
        amount: amount,
        currency: currency,
        name: bus.busName,
        description: `${selectedSeats.length} seat(s) booking`,
        order_id: razorpayOrderId,
        handler: async (razorpayResponse: any) => {
          try {
            const verifyResp = await apiRequest('/payments/verify', {
              method: 'POST',
              body: {
                paymentRecordId,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              },
            });

            setReservationToken('');
            setLockedSeats([]);
            setConfirmedSeats(selectedSeats);
            const bookingId = (verifyResp as any).booking._id || (verifyResp as any).booking.id;
            setSuccessBookingId(bookingId);
            setShowSuccessModal(true);
            setSelectedSeats([]);
            toast.success('Booking confirmed.');
          } catch (err2) {
            // release seats on failure
            if (activeReservationToken && bus?.tripId && activeLockedSeats.length > 0) {
              void apiRequest('/bookings/release', {
                method: 'POST',
                body: { tripId: bus.tripId, seats: activeLockedSeats },
              }).catch(() => undefined);
            }
            setError(err2 instanceof Error ? err2.message : 'Payment verification failed.');
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: { color: '#1976d2' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (requestError) {
      if (activeReservationToken && bus?.tripId && activeLockedSeats.length > 0) {
        void apiRequest('/bookings/release', {
          method: 'POST',
          body: {
            tripId: bus.tripId,
            seats: activeLockedSeats,
          },
        }).catch(() => undefined);
      }
      setError(requestError instanceof Error ? requestError.message : 'Booking failed.');
      toast.error('Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        <Panel className="space-y-4">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-80" />
        </Panel>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.7fr)]">
          <Panel className="space-y-4">
            <SkeletonBlock className="h-[520px]" />
          </Panel>
          <Panel className="space-y-4">
            <SkeletonBlock className="h-32" />
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
            <SkeletonBlock className="h-12" />
          </Panel>
        </div>
      </div>
    );
  }

  if (error && !bus) return <div className="p-6 text-red-600">{error}</div>;
  if (!bus) return <div className="p-6 text-red-600">Bus not found.</div>;

  const reservedSeats = (bus.seatMap || []).filter((seat) => seat.status === 'reserved' && seat.lockExpiresAt);
  const nearestExpiry = reservedSeats.length > 0 ? Math.min(...reservedSeats.map((seat) => new Date(seat.lockExpiresAt as string).getTime())) : null;
  const activeExpiry = lockExpiresAt ? new Date(lockExpiresAt).getTime() : nearestExpiry;
  const nearestExpiryLabel = activeExpiry ? `${Math.max(0, Math.ceil((activeExpiry - now) / 1000 / 60))} min left on locked seats` : '';
  const selectedTotal = selectedSeats.length * bus.price + Math.round(selectedSeats.length * bus.price * 0.05);

  const seatStateStyles = (status: string, selected: boolean) => {
    if (status === 'booked') return 'border-rose-200 bg-rose-500 text-white shadow-lg shadow-rose-500/20';
    if (status === 'reserved') return 'border-amber-200 bg-amber-500 text-white shadow-lg shadow-amber-500/20';
    if (selected) return 'border-cyan-200 bg-cyan-500 text-white shadow-lg shadow-cyan-500/25';
    return 'border-emerald-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 dark:bg-slate-900 dark:text-white';
  };

  return (
    <div className="space-y-6 pb-8">
      <Panel className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(135deg,rgba(8,47,73,0.96),rgba(15,118,110,0.8),rgba(59,130,246,0.78))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
        <div className="grid gap-5 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">Seat selection</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Choose your seats, lock them instantly, and complete payment with Razorpay.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">Real-time availability, live seat locking, and a polished booking summary keep the experience fast and dependable.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-white/65">Fare per seat</p>
              <p className="mt-3 text-4xl font-semibold text-white">{formatCurrency(bus.price)}</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-white/65">Available seats</p>
              <p className="mt-3 text-4xl font-semibold text-white">{bus.availableSeats}</p>
            </div>
            <div className="col-span-2 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-white/65">Trip status</p>
              <p className="mt-3 text-lg font-medium text-white/90">{bus.source} to {bus.destination} on {date}</p>
            </div>
          </div>
        </div>
      </Panel>

      {bus.amenities && bus.amenities.length > 0 && (
        <Panel>
          <SectionHeader title="Onboard amenities" subtitle="A quick view of the coach features included on this trip." />
          <div className="mt-5 flex flex-wrap gap-2">
            {bus.amenities.map((amenity) => (
              <span key={amenity} className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">{amenity}</span>
            ))}
          </div>
        </Panel>
      )}

      {nearestExpiryLabel && <Panel className="border-cyan-200 bg-cyan-500/10 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/15 dark:text-cyan-100">Some seats are temporarily locked. {nearestExpiryLabel}.</Panel>}

      {error && <Panel className="border-rose-200 bg-rose-500/10 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-200">{error}</Panel>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.72fr)]">
        <Panel>
          <SectionHeader
            title="Interactive seat map"
            subtitle="Available, selected, booked, and locked seats are color-coded for instant clarity."
            action={<div className="inline-flex items-center gap-2 rounded-full bg-teal-500/12 px-3 py-1 text-xs font-semibold text-teal-600 dark:text-teal-300"><Sparkles className="h-3.5 w-3.5" />Live updates</div>}
          />

          <div className="mt-5 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3 sm:grid-cols-[repeat(6,minmax(0,1fr))] lg:grid-cols-[repeat(8,minmax(0,1fr))]">
            {seatItems.map((seat) => {
              const selected = selectedSeats.includes(seat.seatNumber);
              const status = seat.status;

              return (
                <motion.button
                  key={seat.seatNumber}
                  type="button"
                  whileHover={status === 'available' ? { y: -3, scale: 1.02 } : undefined}
                  whileTap={status === 'available' ? { scale: 0.96 } : undefined}
                  animate={selected ? { scale: [1, 1.04, 1] } : undefined}
                  transition={{ duration: 0.2 }}
                  onClick={() => toggleSeat(seat.seatNumber)}
                  disabled={status === 'booked' || status === 'reserved' || status === 'female-only'}
                  className={`group flex min-h-[74px] flex-col items-center justify-center rounded-2xl border px-2 py-2 text-center text-sm font-semibold transition ${seatStateStyles(status, selected)}`}
                >
                  <span className="text-base font-semibold">{seat.seatNumber}</span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.22em] opacity-75">{selected ? 'Selected' : status}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[
              { label: 'Available', tone: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700 dark:text-emerald-300' },
              { label: 'Selected', tone: 'bg-cyan-500', border: 'border-cyan-200', text: 'text-cyan-700 dark:text-cyan-300' },
              { label: 'Booked', tone: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-700 dark:text-rose-300' },
              { label: 'Locked', tone: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-700 dark:text-amber-300' },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-3 rounded-2xl border bg-white/70 p-3 shadow-sm dark:bg-slate-900/60 ${item.border}`}>
                <span className={`h-3.5 w-3.5 rounded-full ${item.tone}`} />
                <span className={`text-sm font-semibold ${item.text}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <aside className="space-y-6">
          <Panel>
            <SectionHeader title="Selected seat summary" subtitle="Review your fare before proceeding to payment." />

            <div className="mt-5 space-y-3">
              <div className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Selected seats</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected yet'}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Base fare</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(bus.price * selectedSeats.length)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Tax estimate</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(Math.round(selectedSeats.length * bus.price * 0.05))}</p>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white shadow-lg shadow-slate-950/20">
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Total</p>
                <p className="mt-2 text-3xl font-semibold">{formatCurrency(selectedTotal)}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-teal-500" />
                Razorpay secure checkout
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Lock className="h-4 w-4 text-cyan-500" />
                Seats are locked for a limited time once payment starts
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Ticket className="h-4 w-4 text-rose-500" />
                Instant confirmation after payment verification
              </div>
            </div>

            <motion.button
              whileHover={{ scale: selectedSeats.length > 0 && !bookingLoading ? 1.02 : 1 }}
              whileTap={{ scale: selectedSeats.length > 0 && !bookingLoading ? 0.98 : 1 }}
              onClick={confirmBooking}
              disabled={selectedSeats.length === 0 || bookingLoading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition hover:from-teal-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {bookingLoading ? 'Preparing checkout...' : `Pay & Book ${selectedSeats.length > 0 ? formatCurrency(selectedTotal) : ''}`}
            </motion.button>
          </Panel>
        </aside>
      </div>

      <AnimatePresence>
        {showSuccessModal && successBookingId && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.96, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 18 }} className="w-full max-w-xl rounded-[28px] border border-white/15 bg-white p-6 shadow-[0_30px_120px_-40px_rgba(15,23,42,0.45)] dark:bg-slate-950">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
                <p className="text-xs font-semibold uppercase tracking-[0.28em]">Booking confirmed</p>
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Your seat reservation is complete.</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Your booking ID is ready and the confirmation page has all trip and ticket details.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950/5 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Booking ID</p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-white">{successBookingId}</p>
                </div>
                <div className="rounded-2xl bg-slate-950/5 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Seats</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{confirmedSeats.join(', ')}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowSuccessModal(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                  Stay here
                </button>
                <button type="button" onClick={() => navigate(`/booking-confirmation/${successBookingId}`)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                  View confirmation
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SeatSelectionPage;
