import { useState } from 'react';
import { BellRing, Palette, ShieldCheck } from 'lucide-react';
import { Panel, SectionHeader, PillButton } from '../../components/user/dashboard/TravelUI';

function VendorSettingsPage() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <Panel className="border-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.96),rgba(15,118,110,0.82),rgba(37,99,235,0.78))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/65">Settings</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Vendor workspace settings</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80">Manage alerts, appearance, and operating defaults from one polished panel.</p>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="Workspace preferences" subtitle="Lightweight settings page, lazy-loaded as a separate chunk for better scalability." />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => setAlertsEnabled((value) => !value)} className="flex items-center justify-between rounded-3xl bg-slate-950/5 p-4 text-left dark:bg-white/5">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Booking alerts</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">Receive notifications for new reservations.</p>
            </div>
            <BellRing className={alertsEnabled ? 'h-5 w-5 text-emerald-500' : 'h-5 w-5 text-slate-400'} />
          </button>
          <div className="rounded-3xl bg-slate-950/5 p-4 dark:bg-white/5">
            <p className="font-semibold text-slate-900 dark:text-white">Appearance</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Shares the same BusGo glassmorphism and gradient system.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <PillButton active><Palette className="mr-2 h-4 w-4" />Premium UI</PillButton>
              <PillButton><ShieldCheck className="mr-2 h-4 w-4" />Security</PillButton>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default VendorSettingsPage;
