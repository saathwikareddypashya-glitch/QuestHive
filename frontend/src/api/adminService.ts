import type { Category, Learner, Teacher } from '../types';
import { ApiError, clone, delay, getDb, resetDb, updateDb } from './mockDb';
import { USE_MOCK } from './http';
import { remoteAdmin } from './remote';
import { lastNMonthKeys, monthKey, monthLabel, todayISO, uid } from '../utils/formatters';

export const COMMISSION = 0.15;

const mock = {
  // GET /api/admin/stats
  async getStats() {
    await delay();
    const db = getDb();
    const paid = db.payments.filter((p) => p.status !== 'Refunded');
    const gmv = paid.reduce((s, p) => s + p.amount, 0);
    const months = lastNMonthKeys(6);
    const series = months.map((k) => {
      const ps = paid.filter((p) => monthKey(p.date) === k);
      return {
        month: monthLabel(k),
        bookings: db.bookings.filter((b) => monthKey(b.createdAt) === k).length,
        revenue: Math.round(ps.reduce((s, p) => s + p.amount, 0) * COMMISSION),
        gmv: ps.reduce((s, p) => s + p.amount, 0),
      };
    });
    return {
      learners: db.learners.length,
      teachers: db.teachers.filter((t) => t.status === 'verified' || t.status === 'unverified').length,
      pending: db.teachers.filter((t) => t.status === 'pending').length,
      bookings: db.bookings.length,
      gmv,
      revenue: Math.round(gmv * COMMISSION),
      series,
    };
  },

  // GET /api/admin/teachers
  async getTeachers(): Promise<Teacher[]> {
    await delay();
    return clone(getDb().teachers);
  },

  // GET /api/admin/applications
  async getApplications(): Promise<Teacher[]> {
    await delay();
    return clone(
      getDb().teachers
        .filter((t) => t.submittedAt)
        .sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '')),
    );
  },

  // POST /api/admin/teachers/:id/approve
  async approve(id: string): Promise<Teacher> {
    await delay();
    return updateDb((db) => {
      const t = db.teachers.find((x) => x.id === id);
      if (!t) throw new ApiError('We could not find that teacher.');
      t.status = 'verified';
      t.verified = true;
      t.verifiedAt = todayISO();
      t.rejectionReason = undefined;
      db.notifications.unshift({
        id: uid('n'), recipientRole: 'teacher', recipientId: t.id, type: 'approval',
        message: 'Your teacher application has been approved. Your profile is now live.', date: new Date().toISOString(), read: false, link: '/teacher/verification',
      });
      return clone(t);
    });
  },

  // POST /api/admin/teachers/:id/reject
  async reject(id: string, reason: string): Promise<Teacher> {
    await delay();
    return updateDb((db) => {
      const t = db.teachers.find((x) => x.id === id);
      if (!t) throw new ApiError('We could not find that teacher.');
      t.status = 'rejected';
      t.verified = false;
      t.rejectionReason = reason || 'Your documents did not meet our verification requirements.';
      return clone(t);
    });
  },

  // PATCH /api/admin/teachers/:id/status
  async setStatus(id: string, status: Teacher['status']): Promise<Teacher> {
    await delay(300, 500);
    return updateDb((db) => {
      const t = db.teachers.find((x) => x.id === id);
      if (!t) throw new ApiError('We could not find that teacher.');
      t.status = status;
      t.verified = status === 'verified';
      return clone(t);
    });
  },

  async getLearners(): Promise<(Learner & { bookings: number; spent: number })[]> {
    await delay();
    const db = getDb();
    return clone(
      db.learners.map((l) => ({
        ...l,
        bookings: db.bookings.filter((b) => b.learnerId === l.id).length,
        spent: db.payments.filter((p) => p.learnerId === l.id && p.status !== 'Refunded').reduce((s, p) => s + p.amount, 0),
      })),
    );
  },

  // GET /api/subjects
  async getCategories(): Promise<Category[]> {
    await delay(200, 400);
    return clone(getDb().categories);
  },

  async addSubject(categoryId: string, name: string) {
    await delay(200, 300);
    updateDb((db) => {
      const c = db.categories.find((x) => x.id === categoryId);
      if (!c) throw new ApiError('Category not found.');
      if (c.subjects.some((s) => s.toLowerCase() === name.toLowerCase())) throw new ApiError(`${name} already exists in ${c.shortName}.`);
      c.subjects.push(name);
    });
  },

  async removeSubject(categoryId: string, name: string) {
    await delay(200, 300);
    updateDb((db) => {
      const c = db.categories.find((x) => x.id === categoryId);
      if (c) c.subjects = c.subjects.filter((s) => s !== name);
    });
  },

  async resetDemo() {
    await delay(200, 300);
    resetDb();
  },

  async getReport() {
    await delay();
    const db = getDb();
    const byCategory = db.categories.map((c) => ({
      name: c.shortName,
      bookings: db.bookings.filter((b) => db.teachers.find((t) => t.id === b.teacherId)?.category === c.id).length,
    }));
    const topTeachers = db.teachers
      .filter((t) => t.status === 'verified')
      .map((t) => ({
        id: t.id, name: t.name, subject: t.subject, rating: t.rating, image: t.image, imageFallback: t.imageFallback,
        earnings: db.payments.filter((p) => p.teacherId === t.id && p.status !== 'Refunded').reduce((s, p) => s + p.amount, 0),
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
    const ratings = [5, 4, 3, 2, 1].map((r) => ({ rating: `${r}★`, count: db.reviews.filter((x) => x.rating === r).length }));
    const methods = Array.from(new Set(db.payments.map((p) => p.method))).map((m) => ({ method: m, count: db.payments.filter((p) => p.method === m).length }));
    return { byCategory, topTeachers, ratings, methods };
  },
};

export const adminService: typeof mock = USE_MOCK ? mock : remoteAdmin;
