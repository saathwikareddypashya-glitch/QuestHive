import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Notification } from '../types';
import { notificationService } from '../api/notificationService';
import { useAuth } from './AuthContext';
import { useDbVersion } from '../hooks/useDbVersion';

interface Ctx {
  notifications: Notification[];
  unread: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<Ctx>({ notifications: [], unread: 0, markAllRead: () => {}, markRead: () => {} });

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const version = useDbVersion();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    let alive = true;
    notificationService.getFor(user.role, user.id).then((n) => alive && setNotifications(n));
    return () => { alive = false; };
  }, [user?.id, user?.role, version]);

  const markAllRead = () => user && notificationService.markAllRead(user.role, user.id);
  const markRead = (id: string) => notificationService.markRead(id);
  const unread = notifications.filter((n) => !n.read).length;

  return <NotificationContext.Provider value={{ notifications, unread, markAllRead, markRead }}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
