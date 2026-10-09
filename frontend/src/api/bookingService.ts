import type { Booking } from '../types';
import { ApiError, clone, delay, getDb, updateDb } from './mockDb';
import { USE_MOCK } from './http';
import { remoteBooking } from './remote';
import { uid } from '../utils/formatters';

const byDateAsc = (a: Booking, b: Booking) => (a.date + a.time).localeCompare(b.date + b.time);
const byDateDesc = (a: Booking, b: Booking) => (b.date + b.time).localeCompare(a.date + a.time);

const mock = {
  // GET /api/learners/:id/bookings
  async getLearnerBookings(learnerId: string): Promise<Booking[]> {
    await delay();
    return clone(getDb().bookings.filter((b) => b.learnerId === learnerId).sort(byDateDesc));
  },

  // GET /api/teachers/:id/bookings
  async getTeacherBookings(teacherId: string): Promise<Booking[]> {
    await delay();
    return clone(getDb().bookings.filter((b) => b.teacherId === teacherId).sort(byDateDesc));
  },

  // GET /api/bookings/:id
  async getBookingById(id: string): Promise<Booking> {
    await delay(300, 500);
    const b = getDb().bookings.find((x) => x.id === id);
    if (!b) throw new ApiError('We could not find that booking.', 'NOT_FOUND');
    return clone(b);
  },

  // GET /api/bookings/first-class?learner=&teacher=
  async isFirstClass(learnerId: string, teacherId: string): Promise<boolean> {
    await delay(200, 300);
    return !getDb().bookings.some((b) => b.learnerId === learnerId && b.teacherId === teacherId && b.status !== 'cancelled');
  },

  // POST /api/bookings/:id/cancel
  async cancel(id: string): Promise<Booking> {
    await delay();
    return updateDb((db) => {
      const b = db.bookings.find((x) => x.id === id);
      if (!b) throw new ApiError('We could not find that booking.');
      b.status = 'cancelled';
      const p = db.payments.find((x) => x.bookingId === id);
      if (p) p.status = 'Refunded';
      db.notifications.unshift({
        id: uid('n'), recipientRole: 'teacher', recipientId: b.teacherId, type: 'booking',
        message: `${b.learnerName.split(' ')[0]} cancelled the ${b.subject} class on ${b.date}.`, date: new Date().toISOString(), read: false, link: '/teacher/bookings',
      });
      return clone(b);
    });
  },

  // POST /api/bookings/:id/complete
  async markCompleted(id: string): Promise<Booking> {
    await delay();
    return updateDb((db) => {
      const b = db.bookings.find((x) => x.id === id);
      if (!b) throw new ApiError('We could not find that booking.');
      b.status = 'completed';
      const p = db.payments.find((x) => x.bookingId === id);
      if (p) p.status = 'Completed';
      const t = db.teachers.find((x) => x.id === b.teacherId);
      if (t) t.completedClasses += 1;
      db.notifications.unshift({
        id: uid('n'), recipientRole: 'learner', recipientId: b.learnerId, type: 'review',
        message: `How was your ${b.subject} class with ${b.teacherName}? Leave a review.`, date: new Date().toISOString(), read: false, link: '/learner/reviews',
      });
      return clone(b);
    });
  },

  async getAll(): Promise<Booking[]> {
    await delay();
    return clone([...getDb().bookings].sort(byDateDesc));
  },

  sortAsc: byDateAsc,
};

export const bookingService = USE_MOCK ? mock : { ...remoteBooking, sortAsc: mock.sortAsc };
