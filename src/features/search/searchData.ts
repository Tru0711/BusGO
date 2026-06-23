export type DepartureBucket = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type BusType = 'AC Sleeper' | 'Non AC Sleeper' | 'AC Seater' | 'Non AC Seater';
export type RatingFilter = '4★ & Above' | '3★ & Above';
export type SortOption = 'recommended' | 'lowest-price' | 'highest-price' | 'highest-rating' | 'earliest-departure' | 'latest-departure' | 'fastest-journey';

export type SearchFilters = {
  departureTimes: DepartureBucket[];
  busTypes: BusType[];
  amenities: string[];
  maxPrice: number;
  rating: RatingFilter | '';
  availableOnly: boolean;
};

export type SeatStatus = 'available' | 'selected' | 'booked' | 'female';

export type Seat = {
  id: string;
  status: SeatStatus;
};

export type BusResult = {
  id: string;
  operatorName: string;
  busType: BusType;
  busNumber: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  boardingLocation: string;
  droppingLocation: string;
  availableSeats: number;
  price: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  images: string[];
  boardingPoints: Array<{ name: string; time: string }>;
  droppingPoints: Array<{ name: string; time: string }>;
  cancellationPolicy: string[];
  reviews: Array<{ name: string; rating: number; text: string }>;
  operatorInfo: string;
  seats: Seat[];
};

export const departureOptions: DepartureBucket[] = ['Morning', 'Afternoon', 'Evening', 'Night'];
export const busTypeOptions: BusType[] = ['AC Sleeper', 'Non AC Sleeper', 'AC Seater', 'Non AC Seater'];
export const amenityOptions = ['WiFi', 'Charging Point', 'Water Bottle', 'Live Tracking', 'CCTV', 'Blankets'];

export function getDepartureBucket(time: string): DepartureBucket {
  const hour = Number(time.split(':')[0]);
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 21) return 'Evening';
  return 'Night';
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
