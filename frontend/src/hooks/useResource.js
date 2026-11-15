import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/api.js';

export function useResource(path, interval = 0) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const reloadRef = useRef(() => Promise.resolve());
  useEffect(() => {
    let alive = true;
    let timer;
    let active = false;
    const controller = new AbortController();
    setData(null); setLoading(true); setError('');
    const reload = async () => {
      if (active || !path) { if (!path && alive) setLoading(false); return; }
      active = true;
      try {
        const result = await apiFetch(path, { signal: controller.signal });
        if (alive) { setData(result); setError(''); }
        return result;
      } catch (e) { if (alive && e.name !== 'AbortError') setError(e.message); }
      finally { active = false; if (alive) setLoading(false); }
    };
    reloadRef.current = reload;
    const tick = async () => { await reload(); if (alive && interval) timer = setTimeout(tick, interval); };
    tick();
    return () => { alive = false; controller.abort(); clearTimeout(timer); };
  }, [path, interval]);
  const reload = useCallback(() => reloadRef.current(), []);
  return { data, error, loading, reload };
}
