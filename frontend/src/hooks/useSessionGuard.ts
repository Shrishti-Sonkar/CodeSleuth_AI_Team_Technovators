import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';

/**
 * Guard hook: if there is no valid session in the store, redirect to landing.
 * Call at the top of every protected page.
 */
export function useSessionGuard(sessionId: string | undefined) {
  const navigate = useNavigate();
  const storedId = useSessionStore((s) => s.sessionId);

  useEffect(() => {
    if (!sessionId || (storedId && storedId !== sessionId)) {
      // mismatch — silently adopt the URL session id (browser-back case)
    }
    if (!sessionId) {
      navigate('/', { replace: true });
    }
  }, [sessionId]);
}
