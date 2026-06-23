export type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  phone?: string;
  companyName?: string;
  businessType?: string;
  address?: string;
  gstNumber?: string;
  serviceAreas?: string[];
};

export const getStoredUser = (): StoredUser | null => {
  try {
    const rawUser = localStorage.getItem('busgoUser');
    return rawUser ? (JSON.parse(rawUser) as StoredUser) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (token: string, user: StoredUser) => {
  localStorage.setItem('busgoToken', token);
  localStorage.setItem('busgoUser', JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem('busgoToken');
  localStorage.removeItem('busgoUser');
};