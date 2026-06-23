import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bus, Search } from 'lucide-react';
import { apiRequest } from '../../utils/api';

type PublicRoute = {
  from: string;
  to: string;
  fare: number;
  firstBus: string;
  lastBus: string;
  buses: number;
};

function RoutesPage() {
  const [routes, setRoutes] = useState<PublicRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ routes: PublicRoute[] }>('/buses/routes')
      .then((response) => setRoutes(response.routes))
      .catch((fetchError) => setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch routes.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-600">Routes</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Explore BusGo routes</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">Routes shown here come directly from scheduled trips in the database.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && <StateCard text="Loading routes..." />}
        {error && <StateCard text={error} tone="error" />}
        {!loading && !error && routes.length === 0 && <StateCard text="No routes available" />}
        {!loading && !error && routes.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {routes.map((route) => (
              <article key={`${route.from}-${route.to}`} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white">{route.from} to {route.to}</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{route.buses} scheduled bus{route.buses === 1 ? '' : 'es'}</p>
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    <Bus className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Info label="Fare from" value={`Rs. ${route.fare}`} />
                  <Info label="First bus" value={route.firstBus || 'N/A'} />
                  <Info label="Last bus" value={route.lastBus || 'N/A'} />
                </div>
                <Link to={`/search?source=${encodeURIComponent(route.from)}&destination=${encodeURIComponent(route.to)}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white">
                  <Search className="h-4 w-4" />
                  Search
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function StateCard({ text, tone = 'default' }: { text: string; tone?: 'default' | 'error' }) {
  return <div className={`rounded-2xl border p-8 text-center text-sm font-semibold ${tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200' : 'border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300'}`}>{text}</div>;
}

export default RoutesPage;
