import { useState } from 'react';
import { safetyService } from '../../services/safetyService';
import { buildTripShareText, demoTrip, readLocalSOSHistory, writeLocalSOSHistory, type TripShareDetails } from './safetyUtils';

type TripSafetyActionsProps = {
  trip?: TripShareDetails;
  compact?: boolean;
};

function TripSafetyActions({ trip = demoTrip, compact = false }: TripSafetyActionsProps) {
  const [message, setMessage] = useState('');
  const tripText = buildTripShareText(trip);
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(tripText)}`;

  const copyTrip = async () => {
    await navigator.clipboard?.writeText(tripText);
    setMessage('Trip details copied.');
  };

  const sendSOS = async () => {
    try {
      const response = await safetyService.createSOS(trip.bookingId);
      const localAlerts = readLocalSOSHistory();
      writeLocalSOSHistory([response.alert, ...localAlerts]);
    } catch {
      const localAlerts = readLocalSOSHistory();
      writeLocalSOSHistory([
        {
          id: `local-${Date.now()}`,
          bookingId: trip.bookingId,
          timestamp: new Date().toISOString(),
          status: 'active',
          booking: {
            busName: trip.busName,
            from: trip.route.split(' to ')[0],
            to: trip.route.split(' to ')[1],
            departureTime: trip.departureTime,
            seatNumber: [Number.parseInt(trip.seatNumber.replace(/\D/g, ''), 10) || 0],
          },
        },
        ...localAlerts,
      ]);
    }
    setMessage('SOS alert marked active.');
  };

  return (
    <div className={compact ? 'space-y-3' : 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950'}>
      {!compact && (
        <div>
          <h3 className="text-base font-bold text-slate-950 dark:text-white">Active trip safety</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{trip.route} - {trip.seatNumber}</p>
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={copyTrip} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
          Share Trip
        </button>
        <a href={whatsAppUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
          WhatsApp
        </a>
        <button type="button" onClick={sendSOS} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
          Emergency SOS
        </button>
      </div>
      {message && <p className="text-sm font-medium text-teal-700 dark:text-teal-300">{message}</p>}
    </div>
  );
}

export default TripSafetyActions;
