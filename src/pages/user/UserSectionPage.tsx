import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import MetricCard from '../../components/ui/MetricCard';
import { EmptyState } from '../../components/ui/StateViews';
import { userSections } from '../../data/platform';
import SafetyCenterPage from '../../features/safety/SafetyCenterPage';
import { apiRequest } from '../../utils/api';

type PaymentHistoryItem = {
  bookingId?: string;
  transactionId?: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  isDemoPayment?: boolean;
};

function UserSectionPage() {
  const { sectionId = 'trips' } = useParams();
  const section = userSections[sectionId] || userSections.trips;
  const Icon = section.icon;
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);

  useEffect(() => {
    if (!['wallet', 'bookings'].includes(section.id)) return;
    apiRequest<{ payments: PaymentHistoryItem[] }>('/payments/history')
      .then((response) => setPayments(response.payments))
      .catch(() => setPayments([]));
  }, [section.id]);

  if (section.id === 'safety') {
    return <SafetyCenterPage />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <Icon className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">{section.label}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">{section.description}</p>
          </div>
          <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white">
            Book new trip
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {section.metrics && (
        <section className="grid gap-4 md:grid-cols-3">
          {section.metrics.map((metric) => (
            <MetricCard key={metric.label} label={metric.label} value={metric.value} icon={Icon} tone={`${metric.tone} to-slate-800`} />
          ))}
        </section>
      )}

      {(section.id === 'wallet' || section.id === 'bookings') && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Payment History</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Stored payment records from the database.</p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="whitespace-nowrap px-3 py-3">Transaction ID</th>
                  <th className="whitespace-nowrap px-3 py-3">Payment Method</th>
                  <th className="whitespace-nowrap px-3 py-3">Amount</th>
                  <th className="whitespace-nowrap px-3 py-3">Status</th>
                  <th className="whitespace-nowrap px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-slate-500 dark:text-slate-300">No payment history yet.</td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={`${payment.transactionId || 'payment'}-${index}`}>
                      <td className="px-3 py-4 font-semibold text-slate-800 dark:text-slate-100">{payment.transactionId || 'Pending sync'}</td>
                      <td className="px-3 py-4 text-slate-600 dark:text-slate-300">{payment.paymentMethod.replace(/_/g, ' ')}</td>
                      <td className="px-3 py-4 text-slate-600 dark:text-slate-300">Rs. {payment.amount}</td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${payment.paymentStatus === 'paid' ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>{payment.paymentStatus}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-500 dark:text-slate-300">{new Date(payment.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">Workflow</h3>
          <div className="mt-5 grid gap-3">
            {(section.actions || []).map((action) => (
              <div key={action} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{action}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-teal-600" />
              </div>
            ))}
          </div>
        </div>
        <EmptyState title="Ready for live data" description="This section is wired as a clean product surface for API-backed lists, forms, filters, loading states, and empty states." />
      </section>
    </div>
  );
}

export default UserSectionPage;
