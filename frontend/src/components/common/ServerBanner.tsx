import { useEffect, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { API_URL, USE_MOCK } from '../../api/http';

/** Shows a clear message when the Spring Boot backend isn't reachable. */
export default function ServerBanner() {
  const [down, setDown] = useState(false);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    if (USE_MOCK) return;
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/health`);
      setDown(!res.ok);
    } catch {
      setDown(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { check(); }, []);

  if (!down) return null;
  return (
    <div className="server-banner" role="alert">
      <AlertTriangle size={16} />
      <span>
        <strong>The QuestHive server isn't running.</strong> Start the Spring Boot backend (see README) — it should be at {API_URL}.
      </span>
      <button className="btn btn-secondary btn-sm" onClick={check} disabled={checking}><RotateCw size={14} /> Retry</button>
    </div>
  );
}
