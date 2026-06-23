import type { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  label: string;
  value: string;
  caption?: string;
  icon: LucideIcon;
  tone?: string;
};

function MetricCard({ label, value, caption, icon: Icon }: MetricCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 break-words text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
          {caption && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{caption}</p>}
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-teal-700 dark:bg-white/10 dark:text-teal-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default MetricCard;
