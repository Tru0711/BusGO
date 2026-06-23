import { Building2, Headphones, Info, Mail, Percent, Route } from 'lucide-react';

const copy = {
  routes: { title: 'Routes', description: 'Explore BusGo route coverage across major intercity corridors.', icon: Route },
  offers: { title: 'Offers', description: 'Seasonal coupons, wallet rewards, and first-booking travel deals.', icon: Percent },
  about: { title: 'About BusGo', description: 'BusGo is a role-based MERN bus booking platform for travelers, vendors, and admins.', icon: Info },
  contact: { title: 'Contact', description: 'Reach support for bookings, cancellations, refunds, and operator onboarding.', icon: Mail },
  'vendor-register': { title: 'Become Vendor', description: 'Register your company, verify documents, add fleet, and publish routes.', icon: Building2 },
  support: { title: 'Support', description: 'Find answers, raise tickets, and track issue resolution.', icon: Headphones },
};

function StaticInfoPage({ type }: { type: keyof typeof copy }) {
  const item = copy[type];
  const Icon = item.icon;

  return (
    <main className="mx-auto min-h-[calc(100vh-72px)] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
          <Icon className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-4xl font-black text-slate-950 dark:text-white">{item.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">{item.description}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {['Clear ownership', 'Responsive layout', 'Production workflow'].map((label) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
              <p className="font-bold text-slate-950 dark:text-white">{label}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Designed as a scalable page section with no overlap, clean hierarchy, and future API integration points.</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default StaticInfoPage;
