import type { BusResult } from '../search/searchData';

export type PassengerDetails = {
  name: string;
  mobile: string;
  email: string;
  age: string;
  gender: string;
  womenSafetyMode: boolean;
};

export type CheckoutDraft = {
  step: 'seats' | 'passenger-details' | 'payment' | 'confirmation';
  bus: BusResult;
  selectedSeats: string[];
  journeyDate: string;
  reservationToken: string;
  reservationStartTime: string;
  reservationExpiryTime: string;
  passengerDetails?: PassengerDetails;
  bookingId?: string;
};

const checkoutKey = 'busgoCheckoutDraft';

export function readCheckoutDraft(): CheckoutDraft | null {
  try {
    return JSON.parse(localStorage.getItem(checkoutKey) || 'null') as CheckoutDraft | null;
  } catch {
    return null;
  }
}

export function writeCheckoutDraft(draft: CheckoutDraft) {
  localStorage.setItem(checkoutKey, JSON.stringify(draft));
}

export function clearCheckoutDraft() {
  localStorage.removeItem(checkoutKey);
}

export function isReservationExpired(draft: CheckoutDraft | null) {
  return !draft?.reservationExpiryTime || new Date(draft.reservationExpiryTime).getTime() <= Date.now();
}
