import { ArrowRight, Armchair, IndianRupee } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { writeCheckoutDraft } from '../../checkout/checkoutStore';
import type { BusResult, Seat } from '../searchData';

function SeatLayoutPreview({ bus }: { bus: BusResult }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [womenSafetyMode, setWomenSafetyMode] = useState(() => localStorage.getItem('busgoWomenSafetyMode') === 'true');
  const selectedFare = selectedSeats.length * bus.price;
  const taxes = Math.round(selectedFare * 0.05);

  const seats = useMemo(
    () =>
      bus.seats.map((seat): Seat => ({
        ...seat,
        status: selectedSeats.includes(seat.id) ? 'selected' : seat.status,
      })),
    [bus.seats, selectedSeats],
  );

  const toggleSeat = (seat: Seat) => {
    if (seat.status === 'booked' || seat.status === 'female') return;
    setSelectedSeats((current) => (current.includes(seat.id) ? current.filter((id) => id !== seat.id) : [...current, seat.id]));
  };

  const toggleSafetyMode = () => {
    setWomenSafetyMode((current) => {
      const next = !current;
      localStorage.setItem('busgoWomenSafetyMode', String(next));
      return next;
    });
  };

  const continueBooking = () => {
    if (selectedSeats.length === 0) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    writeCheckoutDraft({
      step: 'passenger-details',
      bus,
      selectedSeats,
      journeyDate: searchParams.get('date') || new Date().toISOString().slice(0, 10),
      reservationToken: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      reservationStartTime: now.toISOString(),
      reservationExpiryTime: expiresAt.toISOString(),
    });
    navigate('/passenger-details');
  };

  return (
    <div className="mt-5 rounded-3xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/20 dark:bg-teal-500/10">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h4 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <Armchair className="h-5 w-5 text-teal-600" />
              Seat selection preview
            </h4>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-300">{bus.availableSeats} seats available</span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {seats.map((seat) => (
              <button
                key={seat.id}
                type="button"
                onClick={() => toggleSeat(seat)}
                disabled={seat.status === 'booked' || seat.status === 'female'}
                className={`min-h-12 rounded-xl border text-xs font-black transition ${seatClassName(seat.status)}`}
                aria-label={`Seat ${seat.id} ${seat.status}`}
              >
                {seat.id}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              ['Available', 'bg-white border-emerald-300'],
              ['Selected', 'bg-teal-600 border-teal-600'],
              ['Booked', 'bg-slate-300 border-slate-300'],
              ['Female Reserved', 'bg-pink-100 border-pink-300'],
            ].map(([label, tone]) => (
              <span key={label} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                <span className={`h-3 w-3 rounded ${tone}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm font-black text-slate-950 dark:text-white">Fare summary</p>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Selected Seats" value={selectedSeats.length ? selectedSeats.join(', ') : 'None'} />
            <Row label="Base Fare" value={`Rs. ${selectedFare}`} />
            <Row label="Taxes" value={`Rs. ${taxes}`} />
            <div className="border-t border-slate-200 pt-3 dark:border-white/10">
              <Row label="Total" value={`Rs. ${selectedFare + taxes}`} strong />
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-3 text-sm dark:border-white/10">
            <input
              type="checkbox"
              checked={womenSafetyMode}
              onChange={toggleSafetyMode}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              <span className="block font-bold text-slate-950 dark:text-white">Enable Women's Safety Mode</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-300">This preference will be saved with the booking and shown on the ticket.</span>
            </span>
          </label>
          <button type="button" onClick={continueBooking} disabled={selectedSeats.length === 0} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
            Continue Booking
            <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-300">{label}</span>
      <span className={`${strong ? 'text-lg' : 'text-sm'} flex items-center gap-1 font-black text-slate-950 dark:text-white`}>
        {label === 'Total' && <IndianRupee className="h-4 w-4" />}
        {value}
      </span>
    </div>
  );
}

function seatClassName(status: Seat['status']) {
  if (status === 'selected') return 'border-teal-600 bg-teal-600 text-white shadow-lg shadow-teal-600/20';
  if (status === 'booked') return 'cursor-not-allowed border-slate-300 bg-slate-300 text-slate-500';
  if (status === 'female') return 'cursor-not-allowed border-pink-300 bg-pink-100 text-pink-700';
  return 'border-emerald-300 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md dark:bg-slate-950 dark:text-white';
}

export default SeatLayoutPreview;
