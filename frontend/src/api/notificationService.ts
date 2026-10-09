import type { Notification, Role } from '../types';
import { clone, delay, getDb, updateDb } from './mockDb';
import { USE_MOCK } from './http';
import { remoteNotification } from './remote';

const mock = {
  // GET /api/notifications
  async getFor(role: Role, userId: string): Promise<Notification[]> {
    await delay(150, 300);
    return clone(
      getDb().notifications
        .filter((n) => n.recipientRole === role && n.recipientId === userId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    );
  },

  // POST /api/notifications/read-all
  async markAllRead(role: Role, userId: string) {
    updateDb((db) => db.notifications.forEach((n) => { if (n.recipientRole === role && n.recipientId === userId) n.read = true; }));
  },

  async markRead(id: string) {
    updateDb((db) => { const n = db.notifications.find((x) => x.id === id); if (n) n.read = true; });
  },
};

export const notificationService: typeof mock = USE_MOCK ? mock : remoteNotification;
