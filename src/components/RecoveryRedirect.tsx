import { useEffect, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recoverySession } from '@/lib/recoverySession';
import { confirmationSession } from '@/lib/confirmationSession';

export default function RecoveryRedirect() {
  const state = useSyncExternalStore(recoverySession.subscribe, recoverySession.getSnapshot);
  const confirmation = useSyncExternalStore(confirmationSession.subscribe, confirmationSession.getSnapshot);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (['confirmed', 'invalid'].includes(confirmation) && location.pathname !== '/auth') {
      navigate('/auth?mode=confirm', { replace: true });
      return;
    }
    if (['checking', 'ready', 'invalid'].includes(state.status) && location.pathname !== '/auth' && location.pathname !== '/reset-password') {
      navigate('/reset-password', { replace: true });
    }
  }, [state.status, confirmation, location.pathname, navigate]);
  return null;
}