import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarClock, CheckCircle2, CreditCard, FileCheck2, Star, UserPlus, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { relativeTime } from '../../utils/formatters';
import type { Notification } from '../../types';

const icons: Record<Notification['type'], typeof Bell> = {
  booking: CheckCircle2, approval: FileCheck2, review: Star, reminder: CalendarClock,
  application: UserPlus, payment: CreditCard, info: Info,
};

export default function NotificationDropdown() {
  const { notifications, unread, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="dropdown-wrap" ref={ref}>
      <button className="icon-btn nav-icon" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Bell size={19} />
        {unread > 0 && <span className="dot-count">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="dropdown-panel notif-panel">
          <div className="notif-head">
            <strong>Notifications</strong>
            {unread > 0 && <button className="link-btn" onClick={markAllRead}>Mark all as read</button>}
          </div>
          {notifications.length === 0 ? (
            <p className="notif-empty">You're all caught up.</p>
          ) : (
            <ul className="notif-list">
              {notifications.slice(0, 8).map((n) => {
                const I = icons[n.type] ?? Info;
                return (
                  <li key={n.id}>
                    <button
                      className={`notif-item ${n.read ? '' : 'is-unread'}`}
                      onClick={() => { markRead(n.id); setOpen(false); if (n.link) navigate(n.link); }}
                    >
                      <span className={`notif-icon type-${n.type}`}><I size={16} /></span>
                      <span className="notif-text">
                        <span>{n.message}</span>
                        <small>{relativeTime(n.date)}</small>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
