import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationTimer from '../../features/checkout/ReservationTimer';
import { isReservationExpired, readCheckoutDraft, writeCheckoutDraft, type PassengerDetails } from '../../features/checkout/checkoutStore';

function PassengerDetailsPage() {
  const navigate = useNavigate();
  const draft = readCheckoutDraft();
  const [form, setForm] = useState<PassengerDetails>(() => draft?.passengerDetails || {
    name: '',
    mobile: '',
    email: '',
    age: '',
    gender: '',
    womenSafetyMode: localStorage.getItem('busgoWomenSafetyMode') === 'true',
  });
  const [error, setError] = useState('');

  if (!draft) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isReservationExpired(draft)) {
      navigate('/search', { replace: true });
      return;
    }
    if (!form.name.trim() || !form.mobile.trim() || !form.email.trim() || !form.age.trim() || !form.gender.trim()) {
      setError('Please complete all passenger details.');
      return;
    }

    localStorage.setItem('busgoWomenSafetyMode', String(form.womenSafetyMode));
    writeCheckoutDraft({ ...draft, passengerDetails: form, step: 'payment' });
    navigate('/payment');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Passenger Details</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Add passenger information</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">These details will appear on the ticket after successful payment.</p>

          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label="Mobile Number" value={form.mobile} onChange={(value) => setForm({ ...form, mobile: value })} />
            <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <Field label="Age" type="number" value={form.age} onChange={(value) => setForm({ ...form, age: value })} />
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Gender</span>
              <select value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 dark:border-white/10 dark:bg-slate-950 dark:text-white">
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-white/10">
              <input type="checkbox" checked={form.womenSafetyMode} onChange={(event) => setForm({ ...form, womenSafetyMode: event.target.checked })} className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600" />
              <span>
                <span className="block text-sm font-bold text-slate-950 dark:text-white">Enable Women's Safety Mode</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-300">This preference is saved with your booking and ticket.</span>
              </span>
            </label>
            {error && <p className="sm:col-span-2 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}
            <button type="submit" className="sm:col-span-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white">Continue to Payment</button>
          </form>
        </section>

        <aside className="space-y-4">
          <ReservationTimer expiresAt={draft.reservationExpiryTime} onExpire={() => navigate('/search', { replace: true })} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">{draft.bus.operatorName}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{draft.bus.boardingLocation} to {draft.bus.droppingLocation}</p>
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Seats: {draft.selectedSeats.join(', ')}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Fare: Rs. {draft.selectedSeats.length * draft.bus.price}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 dark:border-white/10 dark:bg-slate-950 dark:text-white" />
    </label>
  );
}

export default PassengerDetailsPage;
