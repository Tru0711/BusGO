import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Bus, CalendarDays, MapPin, Search, Store, Ticket } from 'lucide-react';
import { apiRequest } from '../../utils/api';

type PublicRoute = { from: string; to: string; fare: number; buses: number };
type Operator = { id: string; name: string; busCount: number };

function PublicHomePage() {
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [routes, setRoutes] = useState<PublicRoute[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (source) params.set('source', source);
    if (destination) params.set('destination', destination);
    if (date) params.set('date', date);
    navigate(`/search?${params.toString()}`);
  };

  useEffect(() => {
    apiRequest<{ routes: PublicRoute[] }>('/buses/routes')
      .then((response) => setRoutes(response.routes.slice(0, 4)))
      .catch(() => setRoutes([]));
    apiRequest<{ operators: Operator[] }>('/buses/operators')
      .then((response) => setOperators(response.operators))
      .catch(() => setOperators([]));
  }, []);

  return (
    <main className="overflow-x-clip">
      <section className="bg-[linear-gradient(135deg,#062f2f_0%,#0f766e_48%,#0f172a_100%)] text-white">
        <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.75fr)] lg:px-8 lg:py-16">
          <div className="flex min-w-0 flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
              <Bus className="h-4 w-4" />
              Database-driven bus booking
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              Book trusted buses with clear routes, seats, fares, and refunds.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              BusGo brings RedBus-style discovery, MakeMyTrip-grade checkout, and operator tools into one clean MERN platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-amber-400/20">
                Search buses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/vendor/register" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white">
                Become vendor
              </Link>
            </div>
          </div>

          <div className="flex min-w-0 items-center">
            <form onSubmit={submitSearch} className="w-full rounded-3xl border border-white/15 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/30 sm:p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Bus className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">Search buses</h2>
                  <p className="text-sm text-slate-500">Find live trips and available seats.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {[
                  { label: 'From', value: source, setter: setSource, icon: MapPin, placeholder: 'Departure city' },
                  { label: 'To', value: destination, setter: setDestination, icon: MapPin, placeholder: 'Destination city' },
                ].map((field) => {
                  const Icon = field.icon;
                  return (
                    <label key={field.label} className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{field.label}</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <Icon className="h-4 w-4 shrink-0 text-teal-600" />
                        <input value={field.value} onChange={(event) => field.setter(event.target.value)} placeholder={field.placeholder} className="w-full bg-transparent text-sm font-semibold outline-none" />
                      </div>
                    </label>
                  );
                })}

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Travel date</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <CalendarDays className="h-4 w-4 shrink-0 text-teal-600" />
                    <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none [color-scheme:light]" />
                  </div>
                </label>
              </div>

              <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20">
                <Search className="h-4 w-4" />
                Search buses
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-600">Routes</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Scheduled routes from database</h2>
          </div>
          <Link to="/routes" className="text-sm font-bold text-teal-700 dark:text-teal-300">View all routes</Link>
        </div>
        {routes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300">No routes available</div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {routes.map((route) => (
              <Link key={`${route.from}-${route.to}`} to={`/search?source=${route.from}&destination=${route.to}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-950 dark:text-white">{route.from} to {route.to}</p>
                    <p className="mt-2 text-sm text-slate-500">{route.buses} scheduled bus{route.buses === 1 ? '' : 'es'}</p>
                  </div>
                  <Ticket className="h-5 w-5 shrink-0 text-teal-600" />
                </div>
                <p className="mt-5 text-sm font-bold text-amber-600">From Rs. {route.fare}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-12 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-teal-600" />
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Featured operators</h2>
          </div>
          {operators.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300">No operators available</div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {operators.map((operator) => (
                <article key={operator.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-slate-950/70">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">{operator.name}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{operator.busCount} active bus{operator.busCount === 1 ? '' : 'es'}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 dark:border-white/10 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} BusGo. Production-ready bus booking platform.</p>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default PublicHomePage;
