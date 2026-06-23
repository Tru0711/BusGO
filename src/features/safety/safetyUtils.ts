import type { SOSAlert } from '../../services/safetyService';

export type TripShareDetails = {
  bookingId: string;
  passengerName: string;
  busName: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
};

export const demoTrip: TripShareDetails = {
  bookingId: '64f7a1c2b8d91f001234abcd',
  passengerName: 'Riya Sharma',
  busName: 'BusGo Express AC Sleeper',
  route: 'Kolhapur to Pune',
  departureTime: '25 Jun 2026, 09:30 PM',
  arrivalTime: '26 Jun 2026, 04:45 AM',
  seatNumber: 'L12',
};

export function buildTripShareText(trip: TripShareDetails) {
  return [
    `Passenger Name: ${trip.passengerName}`,
    `Bus Name: ${trip.busName}`,
    `Route: ${trip.route}`,
    `Departure Time: ${trip.departureTime}`,
    `Arrival Time: ${trip.arrivalTime}`,
    `Seat Number: ${trip.seatNumber}`,
  ].join('\n');
}

export function readLocalSOSHistory(): SOSAlert[] {
  try {
    return JSON.parse(localStorage.getItem('busgoSOSHistory') || '[]') as SOSAlert[];
  } catch {
    return [];
  }
}

export function writeLocalSOSHistory(alerts: SOSAlert[]) {
  localStorage.setItem('busgoSOSHistory', JSON.stringify(alerts));
}
