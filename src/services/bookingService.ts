import { apiRequest } from '../utils/api';

export type SearchBusesParams = {
  source: string;
  destination: string;
  date: string;
};

export const bookingService = {
  searchBuses: (params: SearchBusesParams) => {
    const query = new URLSearchParams(params);
    return apiRequest(`/buses/search?${query.toString()}`);
  },
  getBooking: (bookingId: string) => apiRequest(`/bookings/${bookingId}`),
  cancelBooking: (bookingId: string) =>
    apiRequest(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    }),
};
