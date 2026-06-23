import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { amenityOptions, busTypeOptions, departureOptions, type RatingFilter, type SearchFilters } from '../searchData';

type FilterSidebarProps = {
  filters: SearchFilters;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (filters: SearchFilters) => void;
  onClear: () => void;
};

function toggleArrayValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function FilterSidebar({ filters, isOpen, onToggle, onChange, onClear }: FilterSidebarProps) {
  const panel = (
    <div className="h-full min-h-0 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/90">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-black text-slate-950 dark:text-white">Filters</h2>
        </div>
        <button type="button" onClick={onClear} className="text-sm font-bold text-teal-700 dark:text-teal-300">Clear</button>
      </div>

      <div className="mt-5 space-y-6">
        <FilterGroup title="Departure Time">
          {departureOptions.map((option) => (
            <Checkbox key={option} label={option} checked={filters.departureTimes.includes(option)} onChange={() => onChange({ ...filters, departureTimes: toggleArrayValue(filters.departureTimes, option) })} />
          ))}
        </FilterGroup>

        <FilterGroup title="Bus Type">
          {busTypeOptions.map((option) => (
            <Checkbox key={option} label={option} checked={filters.busTypes.includes(option)} onChange={() => onChange({ ...filters, busTypes: toggleArrayValue(filters.busTypes, option) })} />
          ))}
        </FilterGroup>

        <FilterGroup title="Amenities">
          {amenityOptions.map((option) => (
            <Checkbox key={option} label={option} checked={filters.amenities.includes(option)} onChange={() => onChange({ ...filters, amenities: toggleArrayValue(filters.amenities, option) })} />
          ))}
        </FilterGroup>

        <FilterGroup title="Price Range">
          <input
            type="range"
            min={400}
            max={1500}
            step={50}
            value={filters.maxPrice}
            onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
            className="w-full accent-teal-600"
            aria-label="Maximum price"
          />
          <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
            <span>Rs. 400</span>
            <span>Up to Rs. {filters.maxPrice}</span>
          </div>
        </FilterGroup>

        <FilterGroup title="Ratings">
          {(['4★ & Above', '3★ & Above'] as RatingFilter[]).map((option) => (
            <Checkbox key={option} label={option} checked={filters.rating === option} onChange={() => onChange({ ...filters, rating: filters.rating === option ? '' : option })} />
          ))}
        </FilterGroup>

        <FilterGroup title="Seat Availability">
          <Checkbox label="Available Seats Only" checked={filters.availableOnly} onChange={() => onChange({ ...filters, availableOnly: !filters.availableOnly })} />
        </FilterGroup>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={onToggle} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 lg:hidden">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        <ChevronDown className="h-4 w-4" />
      </button>
      <aside className="hidden lg:sticky lg:top-48 lg:block lg:h-[calc(100vh-13rem)]">{panel}</aside>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-slate-950/60" onClick={onToggle} />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] rounded-t-3xl bg-white p-4 shadow-2xl dark:bg-slate-950">
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={onToggle} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-black text-slate-950 dark:text-white">{title}</h3>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-teal-600" />
    </label>
  );
}

export default FilterSidebar;
