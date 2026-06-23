import {
  BadgeIndianRupee,
  Bus,
  CalendarClock,
  CircleHelp,
  CreditCard,
  Gauge,
  Headphones,
  Home,
  LayoutDashboard,
  Map,
  Percent,
  ReceiptText,
  Route,
  Settings,
  ShieldCheck,
  Star,
  Ticket,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StoredUser } from '../utils/auth';

export type NavItem = {
  label: string;
  to: string;
  icon?: LucideIcon;
};

export type DashboardSection = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  metrics?: Array<{ label: string; value: string; tone: string }>;
  actions?: string[];
};

export const publicNav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Routes', to: '/routes' },
  { label: 'Offers', to: '/offers' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Become Vendor', to: '/vendor/register' },
];

export const userNav: NavItem[] = [
  { label: 'Dashboard', to: '/app', icon: LayoutDashboard },
  { label: 'My Trips', to: '/app/trips', icon: Ticket },
  { label: 'Bookings', to: '/app/bookings', icon: ReceiptText },
  { label: 'Wallet', to: '/app/wallet', icon: Wallet },
  { label: 'Passengers', to: '/app/passengers', icon: Users },
  { label: 'Safety Center', to: '/app/safety', icon: ShieldCheck },
  { label: 'Profile', to: '/app/profile', icon: UserRound },
  { label: 'Support', to: '/app/support', icon: CircleHelp },
];

export const vendorNav: NavItem[] = [
  { label: 'Dashboard', to: '/vendor', icon: LayoutDashboard },
  { label: 'Fleet Management', to: '/vendor/fleet', icon: Bus },
  { label: 'Routes & Schedules', to: '/vendor/routes', icon: Route },
  { label: 'Bookings', to: '/vendor/bookings', icon: Ticket },
  { label: 'Revenue', to: '/vendor/revenue', icon: BadgeIndianRupee },
  { label: 'Customers', to: '/vendor/customers', icon: Users },
  { label: 'Profile', to: '/vendor/profile', icon: ShieldCheck },
];

export const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Vendors', to: '/admin/vendors', icon: ShieldCheck },
  { label: 'Buses', to: '/admin/buses', icon: Bus },
  { label: 'Routes', to: '/admin/routes', icon: Route },
  { label: 'Bookings', to: '/admin/bookings', icon: Ticket },
  { label: 'Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Refunds', to: '/admin/refunds', icon: ReceiptText },
  { label: 'Coupons', to: '/admin/coupons', icon: Percent },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Support', to: '/admin/support', icon: Headphones },
  { label: "Women's Safety", to: '/admin/safety', icon: ShieldCheck },
  { label: 'Reports', to: '/admin/reports', icon: Gauge },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export const userSections: Record<string, DashboardSection> = {
  trips: {
    id: 'trips',
    label: 'My Trips',
    description: 'Upcoming, completed, and cancelled trips in one organized travel timeline.',
    icon: Ticket,
    actions: ['Download ticket', 'Cancel booking', 'Track bus', 'Contact operator'],
  },
  bookings: {
    id: 'bookings',
    label: 'Bookings',
    description: 'Booking history and active tickets with ticket status, payment status, and invoice access.',
    icon: ReceiptText,
    actions: ['View booking history', 'Open active ticket', 'Download invoice'],
  },
  wallet: {
    id: 'wallet',
    label: 'Wallet',
    description: 'Wallet balance, reward points, refunds, and all BusGo transaction activity.',
    icon: Wallet,
    actions: ['Add money', 'Track refund', 'View transactions'],
  },
  passengers: {
    id: 'passengers',
    label: 'Passengers',
    description: 'Saved passengers for faster checkout and repeat bookings.',
    icon: Users,
    actions: ['Add passenger', 'Edit passenger', 'Set primary passenger'],
  },
  safety: {
    id: 'safety',
    label: 'Safety Center',
    description: "Women's Safety Mode, emergency contacts, trip sharing, and SOS history.",
    icon: ShieldCheck,
    actions: ['Manage emergency contacts', 'Share active trip', 'Review SOS history'],
  },
  profile: {
    id: 'profile',
    label: 'Profile',
    description: 'Personal information, contact details, preferences, and security settings.',
    icon: UserRound,
    actions: ['Edit profile', 'Manage preferences', 'Change password'],
  },
  support: {
    id: 'support',
    label: 'Support',
    description: 'Support tickets, help center articles, booking issues, and refund assistance.',
    icon: CircleHelp,
    actions: ['Raise support ticket', 'Browse help center', 'Chat with support'],
  },
};

export const vendorSections: Record<string, DashboardSection> = {
  fleet: {
    id: 'fleet',
    label: 'Fleet Management',
    description: 'Manage buses, seat maps, amenities, route assignments, and active status.',
    icon: Bus,
    actions: ['Add bus', 'Edit bus', 'Delete bus', 'Manage seats'],
  },
  routes: {
    id: 'routes',
    label: 'Routes & Schedules',
    description: 'Create routes, manage timings, assign buses, and publish daily schedules.',
    icon: Route,
    actions: ['Create route', 'Manage timings', 'Publish schedule'],
  },
  bookings: {
    id: 'bookings',
    label: 'Bookings',
    description: 'Active bookings, completed trips, cancellations, and passenger manifests.',
    icon: Ticket,
    actions: ['View bookings', 'Export passenger list', 'Resolve cancellation'],
  },
  revenue: {
    id: 'revenue',
    label: 'Revenue',
    description: 'Earnings, monthly reports, settlement reports, and route-level performance.',
    icon: BadgeIndianRupee,
    actions: ['View earnings', 'Monthly reports', 'Settlement reports'],
  },
  customers: {
    id: 'customers',
    label: 'Customers',
    description: 'Passenger lists, reviews, ratings, and customer service history.',
    icon: Users,
    actions: ['View passengers', 'Reply to reviews', 'Export customer list'],
  },
  profile: {
    id: 'profile',
    label: 'Company Profile',
    description: 'Company information, verification documents, bank details, and service areas.',
    icon: ShieldCheck,
    actions: ['Update profile', 'Upload documents', 'Manage bank details'],
  },
};

export const adminSections: Record<string, DashboardSection> = {
  users: { id: 'users', label: 'Users', description: 'Manage registered users, profiles, access, and account status.', icon: Users, actions: ['Search users', 'Disable account', 'View bookings'] },
  vendors: { id: 'vendors', label: 'Vendors', description: 'Approve operators, review documents, and manage vendor status.', icon: ShieldCheck, actions: ['Approve vendor', 'Reject vendor', 'Review documents'] },
  buses: { id: 'buses', label: 'Buses', description: 'Audit fleet listings, seat maps, amenities, and operator assignments.', icon: Bus, actions: ['Review buses', 'Disable bus', 'Assign route'] },
  routes: { id: 'routes', label: 'Routes', description: 'Manage city pairs, route pricing, timings, and availability.', icon: Map, actions: ['Create route', 'Edit route', 'Archive route'] },
  bookings: { id: 'bookings', label: 'Bookings', description: 'Monitor all bookings, cancellations, failed payments, and confirmations.', icon: Ticket, actions: ['View booking', 'Force cancel', 'Download report'] },
  payments: { id: 'payments', label: 'Payments', description: 'Payment reconciliation, failed transactions, and settlement checks.', icon: CreditCard, actions: ['View payments', 'Reconcile', 'Export ledger'] },
  refunds: { id: 'refunds', label: 'Refunds', description: 'Refund requests, refund status, SLA tracking, and exception handling.', icon: ReceiptText, actions: ['Approve refund', 'Reject refund', 'Escalate'] },
  coupons: { id: 'coupons', label: 'Coupons', description: 'Create, publish, pause, and audit promotional offers.', icon: Percent, actions: ['Create coupon', 'Pause coupon', 'Audit usage'] },
  reviews: { id: 'reviews', label: 'Reviews', description: 'Moderate customer reviews and operator ratings.', icon: Star, actions: ['Moderate review', 'Flag operator', 'Publish response'] },
  support: { id: 'support', label: 'Support', description: 'Support tickets, escalations, dispute handling, and SLA views.', icon: Headphones, actions: ['Assign ticket', 'Resolve ticket', 'Escalate issue'] },
  safety: { id: 'safety', label: "Women's Safety", description: 'View SOS alerts, safety reports, users, bookings, dates, and alert status.', icon: ShieldCheck, actions: ['View SOS alerts', 'Review safety reports', 'Resolve alert'] },
  reports: { id: 'reports', label: 'Reports', description: 'Business reports across revenue, bookings, vendors, routes, and refunds.', icon: Gauge, actions: ['Generate report', 'Schedule report', 'Export CSV'] },
  settings: { id: 'settings', label: 'Settings', description: 'System settings, payment configuration, permissions, and notification templates.', icon: Settings, actions: ['Manage roles', 'Payment settings', 'Notification templates'] },
};

export function getRoleHome(user: StoredUser | null) {
  if (user?.role === 'vendor') return '/vendor';
  if (user?.role === 'admin') return '/admin';
  if (user?.role === 'user') return '/app';
  return '/';
}

export const bookingSteps = [
  { label: 'Search Bus', icon: Home },
  { label: 'View Results', icon: Bus },
  { label: 'Bus Details', icon: Route },
  { label: 'Seat Selection', icon: Ticket },
  { label: 'Passenger Details', icon: Users },
  { label: 'Payment', icon: CreditCard },
  { label: 'Ticket Confirmation', icon: CalendarClock },
];
