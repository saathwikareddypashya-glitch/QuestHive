import type { Booking, BookingDraft, Payment, User } from '../types';
import { ApiError, clone, delay, getDb, updateDb } from './mockDb';
import { USE_MOCK } from './http';
import { remotePayment } from './remote';
import { dayOfISO, formatINR, formatTime, uid } from '../utils/formatters';

const mock = {
  /**
   * POST /api/payments  — simulates a successful payment and creates the booking.
   * Rejects if the slot was taken in the meantime.
   */
  async payAndBook(draft: BookingDraft, learner: User, method: string): Promise<Booking> {
    await delay(1200, 1700);
    return updateDb((db) => {
      const taken = db.bookings.some(
        (b) => b.teacherId === draft.teacherId && b.date === draft.date && b.time === draft.time && b.status === 'upcoming',
      );
      if (taken) throw new ApiError('That time slot is no longer available.', 'SLOT_TAKEN');
      const teacher = db.teachers.find((t) => t.id === draft.teacherId);
      if (!teacher) throw new ApiError('We could not find that teacher.');
      const now = new Date().toISOString();
      const isNewStudent = !db.bookings.some((b) => b.teacherId === teacher.id && b.learnerId === learner.id);
      const booking: Booking = {
        id: `B${String(db.bookings.length + 1).padStart(4, '0')}${Math.floor(Math.random() * 10)}`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        learnerId: learner.id,
        learnerName: learner.name,
        subject: teacher.subject,
        date: draft.date,
        time: draft.time,
        durationMins: draft.durationMins,
        amount: draft.amount,
        isFree: draft.isFree,
        status: 'upcoming',
        paymentMethod: draft.isFree ? 'Free first class' : method,
        reviewed: false,
        createdAt: now,
      };
      db.bookings.push(booking);
      if (isNewStudent) teacher.studentCount += 1;
      if (booking.amount > 0) {
        db.payments.push({
          id: uid('PAY'), bookingId: booking.id, learnerId: learner.id, learnerName: learner.name,
          teacherId: teacher.id, teacherName: teacher.name, subject: teacher.subject,
          amount: booking.amount, method, date: now, status: 'Pending',
        });
      }
      const when = `${dayOfISO(booking.date)} at ${formatTime(booking.time)}`;
      db.notifications.unshift(
        { id: uid('n'), recipientRole: 'learner', recipientId: learner.id, type: 'booking', message: `Your booking with ${teacher.name} is confirmed for ${when}.`, date: now, read: false, link: '/learner/bookings' },
        { id: uid('n'), recipientRole: 'teacher', recipientId: teacher.id, type: 'booking', message: `${learner.name.split(' ')[0]} booked a ${teacher.subject} class on ${when}.`, date: now, read: false, link: '/teacher/bookings' },
        { id: uid('n'), recipientRole: 'admin', recipientId: 'admin', type: 'payment', message: `New booking: ${learner.name.split(' ')[0]} with ${teacher.name} (${booking.amount ? formatINR(booking.amount) : 'free class'}).`, date: now, read: false, link: '/admin/bookings' },
      );
      return clone(booking);
    });
  },

  // GET /api/learners/:id/payments
  async getLearnerPayments(learnerId: string): Promise<Payment[]> {
    await delay();
    return clone(getDb().payments.filter((p) => p.learnerId === learnerId).sort((a, b) => b.date.localeCompare(a.date)));
  },

  // GET /api/teachers/:id/transactions
  async getTeacherTransactions(teacherId: string): Promise<Payment[]> {
    await delay();
    return clone(getDb().payments.filter((p) => p.teacherId === teacherId).sort((a, b) => b.date.localeCompare(a.date)));
  },

  async getAll(): Promise<Payment[]> {
    await delay();
    return clone([...getDb().payments].sort((a, b) => b.date.localeCompare(a.date)));
  },
};

export const paymentService: typeof mock = USE_MOCK ? mock : remotePayment;
