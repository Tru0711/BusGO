import { useState } from 'react';
import { BellRing, Lock, Palette, ShieldCheck } from 'lucide-react';
import { Panel, SectionHeader, PillButton } from '../../components/user/dashboard/TravelUI';

function AdminSettings() {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      <Panel className="border-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.96),rgba(15,118,110,0.82),rgba(37,99,235,0.78))] p-0 text-white shadow-[0_30px_120px_-40px_rgba(14,116,144,0.5)]">
        <div className="px-6 py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/65">Settings</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Admin control preferences</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80">Fine-tune notifications, maintenance behavior, and interface preferences from one premium settings page.</p>
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="System settings" subtitle="These controls are placeholder-safe and ready to be wired to backend settings endpoints." />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => setAlertsEnabled((value) => !value)} className="flex items-center justify-between rounded-3xl bg-slate-950/5 p-4 text-left dark:bg-white/5">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Operational alerts</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">Get notified for critical events.</p>
            </div>
            <BellRing className={alertsEnabled ? 'h-5 w-5 text-emerald-500' : 'h-5 w-5 text-slate-400'} />
          </button>
          <button type="button" onClick={() => setMaintenanceMode((value) => !value)} className="flex items-center justify-between rounded-3xl bg-slate-950/5 p-4 text-left dark:bg-white/5">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Maintenance mode</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">Temporarily pause live operations.</p>
            </div>
            <Lock className={maintenanceMode ? 'h-5 w-5 text-amber-500' : 'h-5 w-5 text-slate-400'} />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <PillButton active={alertsEnabled}>Alerts {alertsEnabled ? 'on' : 'off'}</PillButton>
          <PillButton active={maintenanceMode}>Maintenance {maintenanceMode ? 'enabled' : 'disabled'}</PillButton>
          <PillButton><Palette className="mr-2 h-4 w-4" />Appearance</PillButton>
          <PillButton><ShieldCheck className="mr-2 h-4 w-4" />Security</PillButton>
        </div>
      </Panel>
    </div>
  );
}

export default AdminSettings;
