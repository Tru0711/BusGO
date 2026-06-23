import { BusFront, CalendarDays, Search } from 'lucide-react';

type NoResultsProps = {
  onReset: () => void;
  onChangeDate: () => void;
};

function NoResults({ onReset, onChangeDate }: NoResultsProps) {
  return (
    <section className="grid min-h-[520px] place-items-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-900/70">
      <div className="max-w-lg">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
          <BusFront className="h-11 w-11" />
        </div>
        <h2 className="mt-6 text-2xl font-black text-slate-950 dark:text-white">No buses available for this route.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">Try changing your journey date, clearing filters, or modifying the route to see more available buses.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onChangeDate} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">
            <CalendarDays className="h-4 w-4" />
            Change Date
          </button>
          <button type="button" onClick={onReset} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white">
            <Search className="h-4 w-4" />
            Modify Search
          </button>
        </div>
      </div>
    </section>
  );
}

export default NoResults;
