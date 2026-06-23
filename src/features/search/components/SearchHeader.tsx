import { CalendarDays, MapPin, Search, Users } from 'lucide-react';

type SearchHeaderProps = {
  from: string;
  to: string;
  date: string;
  passengers: number;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPassengersChange: (value: number) => void;
  onSubmit: () => void;
};

function SearchHeader({ from, to, date, passengers, onFromChange, onToChange, onDateChange, onPassengersChange, onSubmit }: SearchHeaderProps) {
  return (
    <section className="sticky top-[72px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-600">Modify search</p>
            <h1 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
              {from} <span className="text-teal-600">→</span> {to}
            </h1>
          </div>
          <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {date} • {passengers} passenger{passengers > 1 ? 's' : ''}
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_190px_180px_auto]"
        >
          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-900">
            <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
            <input value={from} onChange={(event) => onFromChange(event.target.value)} aria-label="From City" className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" />
          </label>
          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-900">
            <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
            <input value={to} onChange={(event) => onToChange(event.target.value)} aria-label="To City" className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white" />
          </label>
          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-900">
            <CalendarDays className="h-4 w-4 shrink-0 text-teal-600" />
            <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} aria-label="Journey Date" className="w-full bg-transparent text-sm font-semibold outline-none [color-scheme:light] dark:text-white" />
          </label>
          <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-900">
            <Users className="h-4 w-4 shrink-0 text-teal-600" />
            <select value={passengers} onChange={(event) => onPassengersChange(Number(event.target.value))} aria-label="Number of Passengers" className="w-full bg-transparent text-sm font-semibold outline-none dark:text-white">
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>{count} passenger{count > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20">
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>
      </div>
    </section>
  );
}

export default SearchHeader;
