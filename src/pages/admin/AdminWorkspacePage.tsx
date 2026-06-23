import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { EmptyState } from '../../components/ui/StateViews';
import { adminSections } from '../../data/platform';
import AdminSafetyPage from '../../features/safety/AdminSafetyPage';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new';
  createdAt: string;
};

function AdminWorkspacePage() {
  const { sectionId } = useParams();
  const section = sectionId ? adminSections[sectionId] : null;
  const [contactMessages] = useState<ContactMessage[]>([]);

  if (!section) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Administrator</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white sm:text-4xl">Govern users, vendors, buses, bookings, payments, refunds, and reports.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">A command center for approvals, operational visibility, support, settings, and business performance.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.values(adminSections).map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <Icon className="h-6 w-6 text-teal-600" />
                <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{item.description}</p>
              </div>
            );
          })}
        </section>
      </div>
    );
  }

  const Icon = section.icon;

  if (section.id === 'safety') {
    return <AdminSafetyPage />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
        <Icon className="h-8 w-8 text-teal-600" />
        <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">{section.label}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">{section.description}</p>
      </section>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <h3 className="text-xl font-bold text-slate-950 dark:text-white">Admin controls</h3>
          <div className="mt-5 grid gap-3">
            {(section.actions || []).map((action) => (
              <button key={action} className="rounded-2xl bg-slate-50 p-4 text-left text-sm font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200">{action}</button>
            ))}
          </div>

          {section.id === 'support' && (
            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-white/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-950 dark:text-white">Contact form inbox</h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Support tickets will appear here when connected to the database.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {contactMessages.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-300">
                    No support tickets found.
                  </div>
                ) : (
                  contactMessages.map((message) => (
                    <article key={message.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-sm font-bold text-slate-950 dark:text-white">{message.subject}</p>
                          <p className="mt-1 text-xs text-slate-500">{message.name} • {message.email} • {message.phone || 'No phone'}</p>
                        </div>
                        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{message.status}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{message.message}</p>
                      <p className="mt-3 text-xs text-slate-400">{message.id} • {new Date(message.createdAt).toLocaleString('en-IN')}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <EmptyState title="Audit-ready workspace" description="This section supports production tables, moderation queues, API-backed reports, exports, and role-permission checks." />
      </section>
    </div>
  );
}

export default AdminWorkspacePage;
