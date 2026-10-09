import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

export default function FilterDrawer({ open, onClose, onClear, resultCount, children }: { open: boolean; onClose: () => void; onClear: () => void; resultCount: number; children: ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  return (
    <>
      <div className={`drawer-scrim ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`filter-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label="Filters">
        <div className="drawer-head">
          <strong>Filters</strong>
          <button className="icon-btn" onClick={onClose} aria-label="Close filters"><X size={20} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        <div className="drawer-foot">
          <button className="btn btn-secondary" onClick={onClear}>Clear all</button>
          <button className="btn btn-primary" onClick={onClose}>Show {resultCount} teachers</button>
        </div>
      </aside>
    </>
  );
}
