import React, { useState } from 'react';

type Seat = {
  id: string;
  label: string;
  type?: 'sleeper' | 'seater';
  occupied?: boolean;
  female?: boolean;
};

export const SeatGrid: React.FC<{ seats: Seat[]; onChange?: (selected: Seat[]) => void }> = ({ seats, onChange }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggle(id: string) {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      onChange?.(seats.filter(s => next.includes(s.id)));
      return next;
    });
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {seats.map(s => (
        <button
          key={s.id}
          onClick={() => !s.occupied && toggle(s.id)}
          className={`p-3 rounded-lg text-sm border flex flex-col items-center justify-center ${s.occupied ? 'bg-gray-300 cursor-not-allowed' : selectedIds.includes(s.id) ? 'bg-indigo-600 text-white' : 'bg-white'}`}
        >
          <div className="font-semibold">{s.label}</div>
          <div className="text-xs text-gray-500">{s.type}</div>
        </button>
      ))}
    </div>
  );
};

export default SeatGrid;
