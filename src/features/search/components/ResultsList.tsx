import BusCard from './BusCard';
import NoResults from './NoResults';
import type { BusResult } from '../searchData';

type ResultsListProps = {
  buses: BusResult[];
  expandedBusId: string | null;
  seatPreviewBusId: string | null;
  onToggleDetails: (busId: string) => void;
  onToggleSeats: (busId: string) => void;
  onReset: () => void;
  onChangeDate: () => void;
  loading?: boolean;
  error?: string;
};

function ResultsList({ buses, expandedBusId, seatPreviewBusId, onToggleDetails, onToggleSeats, onReset, onChangeDate, loading = false, error }: ResultsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900/70">
            <div className="h-6 w-64 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>;
  }

  if (buses.length === 0) {
    return <NoResults onReset={onReset} onChangeDate={onChangeDate} />;
  }

  return (
    <div className="space-y-4">
      {buses.map((bus) => (
        <BusCard
          key={bus.id}
          bus={bus}
          expanded={expandedBusId === bus.id}
          seatOpen={seatPreviewBusId === bus.id}
          onToggleDetails={() => onToggleDetails(bus.id)}
          onToggleSeats={() => onToggleSeats(bus.id)}
        />
      ))}
    </div>
  );
}

export default ResultsList;
