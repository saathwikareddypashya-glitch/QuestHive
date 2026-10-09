import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface NavItem { to: string; label: string; icon: LucideIcon; badge?: number }

export default function DashboardSidebar({ items, title, onNavigate }: { items: NavItem[]; title: string; onNavigate?: () => void }) {
  const location = useLocation();
  const current = location.pathname + location.search;
  return (
    <nav className="dash-sidebar" aria-label={`${title} navigation`}>
      <div className="dash-sidebar-title">{title}</div>
      {items.map((item) => {
        const Icon = item.icon;
        const hasQuery = item.to.includes('?');
        const active = hasQuery
          ? current === item.to
          : location.pathname === item.to && !(item.to.endsWith('/bookings') && location.search.includes('tab='));
        return (
          <NavLink key={item.to} to={item.to} end className={`dash-link ${active ? 'is-active' : ''}`} onClick={onNavigate}>
            <Icon size={18} aria-hidden />
            <span>{item.label}</span>
            {item.badge ? <span className="dash-badge">{item.badge}</span> : null}
          </NavLink>
        );
      })}
    </nav>
  );
}
