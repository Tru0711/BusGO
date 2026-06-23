import { apiRequest } from '../utils/api';
import type { StoredUser } from '../utils/auth';

export type AuthResponse = {
  token: string;
  user: StoredUser;
};

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  register: (payload: Record<string, unknown>) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    }),
  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),
};
