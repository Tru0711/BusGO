import { useEffect, useMemo, useState } from 'react';

function ReservationTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire?: () => void }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
  const label = useMemo(() => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [remaining]);

  useEffect(() => {
    if (remaining === 0) onExpire?.();
  }, [onExpire, remaining]);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
      <p className="text-xs font-bold uppercase tracking-[0.18em]">Seat Reservation Expires In</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{label}</p>
    </div>
  );
}

export default ReservationTimer;
