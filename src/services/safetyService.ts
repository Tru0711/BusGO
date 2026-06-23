import { apiRequest } from '../utils/api';

export type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  mobileNumber: string;
  createdAt?: string;
};

export type SOSAlert = {
  id: string;
  user?: { name?: string; email?: string; phone?: string };
  booking?: {
    busName?: string;
    from?: string;
    to?: string;
    journeyDate?: string;
    departureTime?: string;
    seatNumber?: number[];
    status?: string;
    bookingStatus?: string;
  };
  bookingId?: string;
  timestamp: string;
  status: 'active' | 'resolved';
  createdAt?: string;
};

type ContactsResponse = { success: boolean; contacts: EmergencyContact[] };
type ContactResponse = { success: boolean; contact: EmergencyContact };
type AlertsResponse = { success: boolean; alerts: SOSAlert[] };
type AlertResponse = { success: boolean; alert: SOSAlert };
type SafetyReportResponse = {
  success: boolean;
  report: {
    activeAlerts: number;
    resolvedAlerts: number;
    emergencyContacts: number;
  };
};

export const safetyService = {
  getContacts: () => apiRequest<ContactsResponse>('/safety/contacts'),
  createContact: (payload: Omit<EmergencyContact, 'id'>) =>
    apiRequest<ContactResponse>('/safety/contacts', { method: 'POST', body: payload }),
  updateContact: (id: string, payload: Omit<EmergencyContact, 'id'>) =>
    apiRequest<ContactResponse>(`/safety/contacts/${id}`, { method: 'PUT', body: payload }),
  deleteContact: (id: string) => apiRequest<{ success: boolean }>(`/safety/contacts/${id}`, { method: 'DELETE' }),
  createSOS: (bookingId: string) => apiRequest<AlertResponse>('/safety/sos', { method: 'POST', body: { bookingId } }),
  getSOSHistory: () => apiRequest<AlertsResponse>('/safety/sos/history'),
  getAdminSOSAlerts: () => apiRequest<AlertsResponse>('/safety/admin/sos-alerts'),
  updateSOSStatus: (id: string, status: SOSAlert['status']) =>
    apiRequest<AlertResponse>(`/safety/admin/sos-alerts/${id}`, { method: 'PATCH', body: { status } }),
  getSafetyReport: () => apiRequest<SafetyReportResponse>('/safety/admin/reports'),
};
