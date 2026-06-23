import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent } from 'lucide-react';
import { apiRequest } from '../../utils/api';

type Offer = {
  _id: string;
  label: string;
  title: string;
  description: string;
  discountPercent: number;
};

function OffersListingPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ offers: Offer[] }>('/offers')
      .then((response) => setOffers(response.offers))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch offers.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-amber-600">Offers</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Live BusGo offers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">Only active offers stored in the database are shown here.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && <StateCard text="Loading offers..." />}
        {error && <StateCard text={error} tone="error" />}
        {!loading && !error && offers.length === 0 && <StateCard text="No offers available" />}
        {!loading && !error && offers.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <article key={offer._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">{offer.label}</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{offer.title}</h2>
                  </div>
                  <BadgePercent className="h-6 w-6 shrink-0 text-amber-600" />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-300">{offer.description}</p>
                <p className="mt-4 text-lg font-black text-slate-950 dark:text-white">{offer.discountPercent}% off</p>
                <Link to="/search" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white">
                  Search buses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StateCard({ text, tone = 'default' }: { text: string; tone?: 'default' | 'error' }) {
  return <div className={`rounded-2xl border p-8 text-center text-sm font-semibold ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200' : 'border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300'}`}>{text}</div>;
}

export default OffersListingPage;
