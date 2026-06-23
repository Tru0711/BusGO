import React, { useState } from 'react';

type Props = {
  onSearch: (from: string, to: string, date: string) => void;
};

export const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const swapCities = () => {
    const currentFrom = from;
    setFrom(to);
    setTo(currentFrom);
  };

  return (
    <form
      className="glass mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 rounded-xl p-4 shadow-lg md:flex-row md:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(from.trim(), to.trim(), date);
      }}
    >
      <div className="grid w-full flex-1 grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)]">
        <input
          aria-label="From city"
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border bg-white/60 px-4 py-3"
        />
        <button
          type="button"
          onClick={swapCities}
          className="flex h-12 w-full items-center justify-center rounded-lg border bg-white px-3 shadow-sm md:w-12"
          aria-label="Swap cities"
        >
          Swap
        </button>
        <input
          aria-label="To city"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full rounded-lg border bg-white/60 px-4 py-3"
        />
        <input
          aria-label="Travel date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border bg-white/60 px-4 py-3"
        />
      </div>

      <div className="flex items-center gap-2 md:shrink-0">
        <button className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 md:w-auto">
          Search Buses
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
