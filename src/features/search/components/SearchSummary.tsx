import { Filter, Route } from 'lucide-react';

type SearchSummaryProps = {
  count: number;
  from: string;
  to: string;
  date: string;
  filtersCount: number;
};

function SearchSummary({ count, from, to, date, filtersCount }: SearchSummaryProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-3xl font-black text-slate-950 dark:text-white">{count} Buses Found</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-300">
            <span className="inline-flex items-center gap-2"><Route className="h-4 w-4 text-teal-600" />{from} → {to}</span>
            <span>{date}</span>
          </div>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
          <Filter className="h-4 w-4" />
          {filtersCount} applied filter{filtersCount === 1 ? '' : 's'}
        </div>
      </div>
    </section>
  );
}

export default SearchSummary;
