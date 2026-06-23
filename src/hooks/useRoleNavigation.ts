import { adminNav, userNav, vendorNav } from '../data/platform';
import type { StoredUser } from '../utils/auth';

export function useRoleNavigation(role?: StoredUser['role'] | null) {
  if (role === 'admin') return adminNav;
  if (role === 'vendor') return vendorNav;
  return userNav;
}
