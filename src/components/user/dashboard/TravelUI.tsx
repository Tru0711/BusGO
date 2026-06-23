import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';

type PanelProps = {
  children: ReactNode;
  className?: string;
};

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

type StatCardProps = {
  title: string;
  value: number | string;
  valuePrefix?: string;
  subtitle?: string;
  icon: ReactNode;
  accentClassName: string;
  trend?: string;
};

type PillButtonProps = {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
};

type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const formatNumber = (value: number | string) => {
  if (typeof value === 'string') {
    return value;
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCurrency = (value: number | string) => {
  const amount = typeof value === 'string' ? Number(value) : value;
  return `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)}`;
};

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`min-w-0 rounded-3xl border border-white/20 bg-white/75 p-5 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.30)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-500 dark:text-teal-300">BusGo control center</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function AnimatedCounter({ value }: { value: number | string }) {
  const target = typeof value === 'string' ? Number(value) : value;
  const safeTarget = Number.isFinite(target) ? target : 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 800;
    const start = performance.now();

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(safeTarget * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [safeTarget]);

  return <span>{formatNumber(displayValue)}</span>;
}

export function StatCard({ title, value, valuePrefix, subtitle, icon, accentClassName, trend }: StatCardProps) {
  return (
    <Panel className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentClassName} opacity-90`} />
      <div className="relative flex min-w-0 items-start justify-between gap-3 text-white">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/16 ring-1 ring-white/20 backdrop-blur">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {valuePrefix && <span className="mr-1">{valuePrefix}</span>}
              <AnimatedCounter value={value} />
            </p>
            {subtitle && <p className="mt-2 text-sm text-white/75">{subtitle}</p>}
          </div>
        </div>
        {trend && <span className="shrink-0 rounded-full bg-white/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/85">{trend}</span>}
      </div>
    </Panel>
  );
}

export function PillButton({ children, active = false, onClick, className = '', type = 'button' }: PillButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-w-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${active
        ? 'border-transparent bg-slate-900 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-900'
        : 'border-white/20 bg-white/70 text-slate-600 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'} ${className}`}
    >
      {children}
    </button>
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`} />;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Panel className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/12 text-teal-600 ring-1 ring-inset ring-teal-500/20 dark:text-teal-300">
        {icon}
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">{description}</p>
      </div>
      {action}
    </Panel>
  );
}

export function StatusBadge({ tone = 'neutral', children }: { tone?: StatusTone; children: ReactNode }) {
  const toneClasses: Record<StatusTone, string> = {
    success: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    warning: 'bg-amber-500/12 text-amber-700 ring-amber-500/20 dark:text-amber-300',
    danger: 'bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:text-rose-300',
    info: 'bg-sky-500/12 text-sky-700 ring-sky-500/20 dark:text-sky-300',
    neutral: 'bg-slate-500/12 text-slate-700 ring-slate-500/20 dark:text-slate-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
