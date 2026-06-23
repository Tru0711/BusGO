import React from 'react';
import { useNavigate } from 'react-router-dom';

type Bus = {
  _id: string;
  name: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration?: string;
  price?: number;
  seatsAvailable?: number;
  rating?: number;
};

export const BusCard: React.FC<{ bus: Bus }> = ({ bus }) => {
  const nav = useNavigate();
  return (
    <div className="p-4 rounded-xl glass shadow hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{bus.name}</h3>
          <div className="text-sm text-gray-500">{bus.rating ?? '4.5'} ★</div>
        </div>
        <div className="text-sm text-gray-600">{bus.from} → {bus.to}</div>
        <div className="mt-2 text-sm flex items-center gap-4 text-gray-700">
          <div><strong>{bus.departure}</strong> Departure</div>
          <div>•</div>
          <div>{bus.duration ?? '6h 30m'}</div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-xl font-bold">₹{bus.price ?? 0}</div>
        <div className="text-sm text-gray-500">{bus.seatsAvailable ?? 12} seats</div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => nav(`/seat-selection?busId=${bus._id}`)} className="px-3 py-2 rounded bg-indigo-600 text-white">View Seats</button>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
