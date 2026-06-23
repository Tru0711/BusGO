import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarClock } from 'lucide-react';
import { EmptyState } from '../../components/ui/StateViews';
import { vendorSections } from '../../data/platform';

function VendorWorkspacePage() {
  const { sectionId } = useParams();
  const section = sectionId ? vendorSections[sectionId] : null;

  if (!section) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Vendor dashboard</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">Operate fleet, routes, bookings, and revenue with confidence.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">Built for bus operators: add buses, create routes, manage seats, manage timings, view bookings, and review settlements.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.values(vendorSections).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={`/vendor/${item.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 dark:border-white/10 dark:bg-slate-900/70">
                <Icon className="h-6 w-6 text-teal-600" />
                <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{item.description}</p>
              </Link>
            );
          })}
        </section>
      </div>
    );
  }

  const Icon = section.icon;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
        <Icon className="h-8 w-8 text-teal-600" />
        <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">{section.label}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">{section.description}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">Vendor operations</h3>
          <div className="mt-5 grid gap-3">
            {(section.actions || []).map((action) => (
              <button key={action} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-950">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{action}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-teal-600" />
              </button>
            ))}
          </div>
        </div>
        <EmptyState title="Schedule-ready surface" description="Add API-backed tables, filters, dialogs, and forms here without changing the route or layout architecture." action={<span className="inline-flex items-center gap-2 text-sm font-bold text-teal-700"><CalendarClock className="h-4 w-4" />Ready for live schedules</span>} />
      </section>
    </div>
  );
}

export default VendorWorkspacePage;
