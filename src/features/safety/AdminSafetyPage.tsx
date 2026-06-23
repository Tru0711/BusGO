import { useEffect, useMemo, useState } from 'react';
import { safetyService, type SOSAlert } from '../../services/safetyService';

type SafetyReport = {
  activeAlerts: number;
  resolvedAlerts: number;
  emergencyContacts: number;
};

function AdminSafetyPage() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [report, setReport] = useState<SafetyReport>({ activeAlerts: 0, resolvedAlerts: 0, emergencyContacts: 0 });

  useEffect(() => {
    const loadSafetyAdmin = async () => {
      try {
        const [alertResponse, reportResponse] = await Promise.all([
          safetyService.getAdminSOSAlerts(),
          safetyService.getSafetyReport(),
        ]);
        setAlerts(alertResponse.alerts);
        setReport(reportResponse.report);
      } catch {
        setAlerts([]);
        setReport({ activeAlerts: 0, resolvedAlerts: 0, emergencyContacts: 0 });
      }
    };

    void loadSafetyAdmin();
  }, []);

  const totals = useMemo(
    () => [
      { label: 'Active SOS Alerts', value: report.activeAlerts },
      { label: 'Resolved Alerts', value: report.resolvedAlerts },
      { label: 'Emergency Contacts', value: report.emergencyContacts },
    ],
    [report],
  );

  const resolveAlert = async (id: string) => {
    try {
      const response = await safetyService.updateSOSStatus(id, 'resolved');
      setAlerts((current) => current.map((alert) => (alert.id === id ? response.alert : alert)));
      setReport((current) => ({
        ...current,
        activeAlerts: Math.max(0, current.activeAlerts - 1),
        resolvedAlerts: current.resolvedAlerts + 1,
      }));
    } catch {
      setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, status: 'resolved' } : alert)));
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Women's Safety</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Monitor SOS alerts and safety reports from active user journeys.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {totals.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">SOS Alerts</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">User, booking, date, and alert status.</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                <th className="whitespace-nowrap px-3 py-3">User</th>
                <th className="whitespace-nowrap px-3 py-3">Booking</th>
                <th className="whitespace-nowrap px-3 py-3">Date</th>
                <th className="whitespace-nowrap px-3 py-3">Status</th>
                <th className="whitespace-nowrap px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500 dark:text-slate-300">No SOS alerts available.</td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="align-top">
                    <td className="px-3 py-4 text-slate-700 dark:text-slate-200">{alert.user?.name || 'User'}</td>
                    <td className="px-3 py-4 text-slate-700 dark:text-slate-200">
                      <p className="font-semibold">{alert.booking?.busName || String(alert.bookingId || 'Booking')}</p>
                      <p className="mt-1 text-xs text-slate-500">{alert.booking?.from || ''} {alert.booking?.to ? `to ${alert.booking.to}` : ''}</p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-700 dark:text-slate-200">{new Date(alert.timestamp).toLocaleString('en-IN')}</td>
                    <td className="px-3 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${alert.status === 'active' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>{alert.status}</span>
                    </td>
                    <td className="px-3 py-4">
                      <button type="button" disabled={alert.status === 'resolved'} onClick={() => void resolveAlert(alert.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200">
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminSafetyPage;
