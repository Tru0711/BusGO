import type { SortOption } from '../searchData';

type SortDropdownProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

const options: Array<{ label: string; value: SortOption }> = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Lowest Price', value: 'lowest-price' },
  { label: 'Highest Price', value: 'highest-price' },
  { label: 'Highest Rating', value: 'highest-rating' },
  { label: 'Earliest Departure', value: 'earliest-departure' },
  { label: 'Latest Departure', value: 'latest-departure' },
  { label: 'Fastest Journey', value: 'fastest-journey' },
];

function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900/70">
      <span className="text-sm font-bold text-slate-500 dark:text-slate-300">Sort</span>
      <select value={value} onChange={(event) => onChange(event.target.value as SortOption)} className="bg-transparent text-sm font-bold text-slate-950 outline-none dark:text-white">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export default SortDropdown;
