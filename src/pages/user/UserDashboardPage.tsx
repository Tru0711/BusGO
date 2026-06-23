import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../utils/api';

type Booking = {
  id: string;
  busName: string;
  from: string;
  to: string;
  journeyDate: string;
  departureTime: string;
  status: string;
  paymentStatus?: string;
};

type Payment = {
  transactionId?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
};

function UserDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest<{ bookings: Booking[] }>('/bookings/user').catch(() => ({ bookings: [] })),
      apiRequest<{ payments: Payment[] }>('/payments/history').catch(() => ({ payments: [] })),
    ])
      .then(([bookingResponse, paymentResponse]) => {
        setBookings(bookingResponse.bookings);
        setPayments(paymentResponse.payments);
      })
      .finally(() => setLoading(false));
  }, []);

  const upcomingBookings = useMemo(() => bookings.filter((booking) => ['confirmed', 'pending'].includes(booking.status)), [bookings]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Registered user</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">Your BusGo dashboard</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">Only bookings and payments stored in the database are shown here.</p>
          </div>
          <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white">
            <Search className="h-4 w-4" />
            Search buses
          </Link>
        </div>
      </section>

      {loading ? (
        <StateCard text="Loading dashboard..." />
      ) : (
        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Upcoming Trips</h3>
              <Link to="/app/bookings" className="text-sm font-bold text-teal-700 dark:text-teal-300">View all</Link>
            </div>
            <div className="mt-5 grid gap-3">
              {upcomingBookings.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">No bookings found</p>
              ) : (
                upcomingBookings.slice(0, 3).map((booking) => (
                  <article key={booking.id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="font-bold text-slate-950 dark:text-white">{booking.busName}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{booking.from} to {booking.to} - {booking.departureTime}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">Payment History</h3>
            <div className="mt-5 grid gap-3">
              {payments.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">No transactions found</p>
              ) : (
                payments.slice(0, 4).map((payment, index) => (
                  <article key={`${payment.transactionId || 'payment'}-${index}`} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="font-bold text-slate-950 dark:text-white">{payment.transactionId || 'Transaction'}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{payment.paymentMethod.replace(/_/g, ' ')} - Rs. {payment.amount} - {payment.paymentStatus}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function StateCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">{text}</div>;
}

export default UserDashboardPage;
