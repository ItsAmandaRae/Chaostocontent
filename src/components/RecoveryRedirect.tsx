import { useEffect, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recoverySession } from '@/lib/recoverySession';

export default function RecoveryRedirect() {
  const state = useSyncExternalStore(recoverySession.subscribe, recoverySession.getSnapshot);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (['checking', 'ready', 'invalid'].includes(state.status) && location.pathname !== '/auth' && location.pathname !== '/reset-password') {
      navigate('/reset-password', { replace: true });
    }
  }, [state.status, location.pathname, navigate]);
  return null;
}