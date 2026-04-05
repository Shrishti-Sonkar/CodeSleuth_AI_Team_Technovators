import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingestService } from '../services/ingestService';
import { useSessionStore } from '../store/sessionStore';
import { POLL_INTERVAL_MS } from '../lib/constants';

export function useIngestPolling(sessionId: string | undefined) {
  const navigate = useNavigate();
  const { updateStatus, status } = useSessionStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    if (status === 'ready' || status === 'error') return;

    const poll = async () => {
      try {
        const res = await ingestService.getStatus(sessionId);
        updateStatus(res.status, res.progress, res.repo_name, res.error);

        if (res.status === 'ready') {
          clearInterval(intervalRef.current!);
          navigate(`/overview/${sessionId}`);
        } else if (res.status === 'error') {
          clearInterval(intervalRef.current!);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    poll(); // immediate first call
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId]);
}
