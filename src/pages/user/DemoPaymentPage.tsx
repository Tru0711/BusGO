import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationTimer from '../../features/checkout/ReservationTimer';
import {
  isReservationExpired,
  readCheckoutDraft,
  writeCheckoutDraft,
} from '../../features/checkout/checkoutStore';
import { apiRequest } from '../../utils/api';

const methods = [
  { value: 'upi', label: 'UPI' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'wallet', label: 'Wallet' },
];

function DemoPaymentPage() {
  const navigate = useNavigate();
  const draft = readCheckoutDraft();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!draft || !draft.passengerDetails) return null;

  const passengerDetails = draft.passengerDetails;
  const amount = draft.selectedSeats.length * draft.bus.price;

  const simulatePayment = async (outcome: 'success' | 'failure') => {
    if (submitting) return;
    if (isReservationExpired(draft)) {
      navigate('/search', { replace: true });
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await apiRequest<{
        booking: { id?: string; _id?: string; transactionId?: string };
        payment: { transactionId?: string };
      }>('/payments/demo/simulate', {
        method: 'POST',
        body: {
          tripId: draft.bus.id,
          selectedSeats: draft.selectedSeats,
          reservationToken: draft.reservationToken,
          date: draft.journeyDate,
          passengerDetails,
          paymentMethod,
          outcome,
          womenSafetyMode: passengerDetails.womenSafetyMode,
        },
      });

      const bookingId = response.booking.id || response.booking._id || `local-${Date.now()}`;
      writeCheckoutDraft({ ...draft, bookingId, step: 'confirmation' });
      navigate(`/booking-confirmation/${bookingId}`);
    } catch (requestError) {
      if (outcome === 'failure') {
        setError('Demo payment failed. Your reservation remains active until the timer expires.');
      } else {
        setError(requestError instanceof Error ? requestError.message : 'Payment could not be stored. Please retry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Demo Payment</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Complete payment simulation</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Demo Payment System. No Real Money Used.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {methods.map((method) => (
              <label key={method.value} className={`rounded-xl border p-4 text-sm font-bold ${paymentMethod === method.value ? 'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-200' : 'border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200'}`}>
                <input type="radio" name="paymentMethod" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} className="sr-only" />
                {method.label}
              </label>
            ))}
          </div>

          {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={submitting} onClick={() => void simulatePayment('success')} className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Processing...' : 'Simulate Payment Success'}
            </button>
            <button type="button" disabled={submitting} onClick={() => void simulatePayment('failure')} className="rounded-xl border border-rose-200 px-5 py-3 text-sm font-bold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:text-rose-300">
              Simulate Payment Failure
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <ReservationTimer expiresAt={draft.reservationExpiryTime} onExpire={() => navigate('/search', { replace: true })} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Fare Summary</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{draft.bus.operatorName}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Seats: {draft.selectedSeats.join(', ')}</p>
            <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">Rs. {amount}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default DemoPaymentPage;
