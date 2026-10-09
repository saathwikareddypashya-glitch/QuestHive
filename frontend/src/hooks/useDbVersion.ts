import { useEffect, useState } from 'react';
import { DB_EVENT } from '../api/mockDb';

/** Increments whenever the mock database changes, so pages can refetch. */
export function useDbVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const on = () => setV((x) => x + 1);
    window.addEventListener(DB_EVENT, on);
    return () => window.removeEventListener(DB_EVENT, on);
  }, []);
  return v;
}
