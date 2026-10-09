import { useCallback, useEffect, useRef, useState } from 'react';
import { useDbVersion } from './useDbVersion';

/**
 * Runs an async loader and refetches when deps change or the mock DB changes.
 * On refetch the previous data stays visible, so the UI doesn't flash skeletons.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const version = useDbVersion();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const depsKey = JSON.stringify(deps);
  const prevKey = useRef(depsKey);

  useEffect(() => {
    let alive = true;
    const depsChanged = prevKey.current !== depsKey;
    prevKey.current = depsKey;
    if (depsChanged) setData(null);
    setLoading(true);
    setError(null);
    loaderRef
      .current()
      .then((d) => { if (alive) setData(d); })
      .catch((e: Error) => { if (alive) setError(e.message || 'Something went wrong.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [depsKey, version, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading: loading && data === null, refreshing: loading, reload, setData };
}
