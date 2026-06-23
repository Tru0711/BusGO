import { BadgeCheck, Bus, ChevronDown, Clock, Eye, MapPin, Star, Ticket, Wifi, Zap } from 'lucide-react';
import BusDetails from './BusDetails';
import SeatLayoutPreview from './SeatLayoutPreview';
import { formatDuration, type BusResult } from '../searchData';

type BusCardProps = {
  bus: BusResult;
  expanded: boolean;
  seatOpen: boolean;
  onToggleDetails: () => void;
  onToggleSeats: () => void;
};

const amenityIcons: Record<string, typeof Wifi> = {
  WiFi: Wifi,
  'Charging Point': Zap,
  'Water Bottle': BadgeCheck,
  'Live Tracking': MapPin,
  CCTV: Eye,
  Blankets: Ticket,
};

function BusCard({ bus, expanded, seatOpen, onToggleDetails, onToggleSeats }: BusCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_230px] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-slate-950 dark:text-white">{bus.operatorName}</h3>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">{bus.busType}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">{bus.busNumber}</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <TimeBlock label="Departure" time={bus.departureTime} location={bus.boardingLocation} />
            <div className="hidden min-w-32 text-center md:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Duration</p>
              <div className="my-2 h-px bg-slate-200 dark:bg-white/10" />
              <p className="text-sm font-black text-slate-700 dark:text-slate-200">{formatDuration(bus.durationMinutes)}</p>
            </div>
            <TimeBlock label="Arrival" time={bus.arrivalTime} location={bus.droppingLocation} alignRight />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{bus.rating} ({bus.reviewCount})</span>
            <span className="inline-flex items-center gap-1.5"><Bus className="h-4 w-4 text-teal-600" />{bus.availableSeats} seats left</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-teal-600" />{formatDuration(bus.durationMinutes)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {bus.amenities.slice(0, 5).map((amenity) => {
              const Icon = amenityIcons[amenity] || BadgeCheck;
              return (
                <span key={amenity} title={amenity} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  <Icon className="h-3.5 w-3.5 text-teal-600" />
                  {amenity}
                </span>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
          <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Starting price</p>
          <p className="mt-2 text-3xl font-black">Rs. {bus.price}</p>
          <p className="mt-1 text-sm opacity-70">Per seat</p>
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={onToggleSeats} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold text-white">
              <Ticket className="h-4 w-4" />
              View Seats
            </button>
            <button type="button" onClick={onToggleDetails} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold dark:bg-slate-950/10">
              View Details
              <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </aside>
      </div>

      {expanded && <BusDetails bus={bus} />}
      {seatOpen && <SeatLayoutPreview bus={bus} />}
    </article>
  );
}

function TimeBlock({ label, time, location, alignRight = false }: { label: string; time: string; location: string; alignRight?: boolean }) {
  return (
    <div className={alignRight ? 'md:text-right' : ''}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{time}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-300">{location}</p>
    </div>
  );
}

export default BusCard;
