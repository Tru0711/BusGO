import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicHomePage from './pages/public/PublicHomePage';
import SearchFlowPage from './pages/public/SearchFlowPage';
import StaticInfoPage from './pages/public/StaticInfoPage';
import RoutesPage from './pages/public/RoutesPage';
import OffersListingPage from './pages/public/OffersListingPage';
import ContactPage from './pages/public/ContactPage';
import AuthFlowPage from './pages/auth/AuthFlowPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import UserSectionPage from './pages/user/UserSectionPage';
import PassengerDetailsPage from './pages/user/PassengerDetailsPage';
import DemoPaymentPage from './pages/user/DemoPaymentPage';
import BookingConfirmationPage from './pages/user/BookingConfirmationPage';
import VendorWorkspacePage from './pages/vendor/VendorWorkspacePage';
import AdminWorkspacePage from './pages/admin/AdminWorkspacePage';
import CheckoutGuard from './routes/CheckoutGuard';
import RefundStatusPage from './pages/RefundStatusPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<PublicHomePage />} />
        <Route path="search" element={<SearchFlowPage />} />
        <Route path="search-buses" element={<Navigate to="/search" replace />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="offers" element={<OffersListingPage />} />
        <Route path="about" element={<StaticInfoPage type="about" />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="support" element={<StaticInfoPage type="support" />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="refund-status/:status/:refundId?" element={<RefundStatusPage />} />

        <Route path="login" element={<AuthFlowPage mode="login" />} />
        <Route path="register" element={<AuthFlowPage mode="register" />} />
        <Route path="signup" element={<Navigate to="/register" replace />} />
        <Route path="forgot-password" element={<AuthFlowPage mode="forgot-password" />} />
        <Route path="otp-verification" element={<AuthFlowPage mode="otp" />} />
        <Route path="reset-password" element={<AuthFlowPage mode="reset-password" />} />
        <Route path="vendor/register" element={<AuthFlowPage mode="vendor-register" />} />
        <Route path="vendor/signup" element={<Navigate to="/vendor/register" replace />} />
        <Route path="vendor/login" element={<AuthFlowPage mode="vendor-login" />} />
      </Route>

      <Route element={<ProtectedRoute roles={['user']} />}>
        <Route path="app" element={<DashboardLayout role="user" />}>
          <Route index element={<UserDashboardPage />} />
          <Route path=":sectionId" element={<UserSectionPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['user']} />}>
        <Route element={<CheckoutGuard requiredStep="passenger-details" />}>
          <Route path="passenger-details" element={<PassengerDetailsPage />} />
        </Route>
        <Route element={<CheckoutGuard requiredStep="payment" />}>
          <Route path="payment" element={<DemoPaymentPage />} />
        </Route>
        <Route element={<CheckoutGuard requiredStep="confirmation" />}>
          <Route path="confirmation/:bookingId" element={<BookingConfirmationPage />} />
        </Route>
        <Route path="booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['vendor']} />}>
        <Route path="vendor" element={<DashboardLayout role="vendor" />}>
          <Route index element={<VendorWorkspacePage />} />
          <Route path=":sectionId" element={<VendorWorkspacePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route path="admin" element={<DashboardLayout role="admin" />}>
          <Route index element={<AdminWorkspacePage />} />
          <Route path=":sectionId" element={<AdminWorkspacePage />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/app" replace />} />
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="/my-bookings" element={<Navigate to="/app/bookings" replace />} />
      <Route path="/ticket" element={<Navigate to="/app/bookings" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/buses" element={<Navigate to="/search" replace />} />
      <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/admin-dashboard/:sectionId" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
