import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingState({ label = 'Loading content...' }: { label?: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-slate-500 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
      <div className="flex items-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-teal-500" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/70 p-8 text-center dark:border-white/10 dark:bg-slate-950/50">
      <div className="max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
