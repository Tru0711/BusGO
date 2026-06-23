import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isReservationExpired, readCheckoutDraft } from '../features/checkout/checkoutStore';

type CheckoutGuardProps = {
  requiredStep: 'passenger-details' | 'payment' | 'confirmation';
};

function CheckoutGuard({ requiredStep }: CheckoutGuardProps) {
  const location = useLocation();
  const draft = readCheckoutDraft();

  if (!draft) {
    return <Navigate to="/search" replace state={{ from: location.pathname }} />;
  }

  if (requiredStep !== 'confirmation' && isReservationExpired(draft)) {
    return <Navigate to="/search" replace state={{ reason: 'reservation-expired' }} />;
  }

  if (requiredStep === 'payment' && !draft.passengerDetails?.name) {
    return <Navigate to="/passenger-details" replace />;
  }

  if (requiredStep === 'confirmation' && !draft.bookingId) {
    return <Navigate to="/payment" replace />;
  }

  return <Outlet />;
}

export default CheckoutGuard;
