import type { Booking, Day, Learner, Payment, Teacher } from '../types';
import { addDays, dayOfISO, toISODate } from '../utils/formatters';
import { generateSlots, teachingDays } from '../utils/slots';

/** Deterministic random numbers so the demo data is the same on every reset. */
export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function nextDateFor(day: Day, minOffset = 1): string {
  const today = new Date();
  for (let i = minOffset; i < minOffset + 8; i++) {
    const iso = toISODate(addDays(today, i));
    if (dayOfISO(iso) === day) return iso;
  }
  return toISODate(addDays(today, minOffset));
}

export function prevDateIn(days: Day[], offset: number): string {
  const today = new Date();
  for (let i = offset; i < offset + 8; i++) {
    const iso = toISODate(addDays(today, -i));
    if (days.includes(dayOfISO(iso))) return iso;
  }
  return toISODate(addDays(today, -offset));
}

const createdBefore = (date: string, days: number) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d - days, 10, 0, 0).toISOString();
};

export function seedBookingsAndPayments(teachers: Teacher[], learners: Learner[]) {
  const bookings: Booking[] = [];
  const random = rng(42);
  const methods = ['UPI', 'Credit / Debit Card', 'Net Banking', 'Wallet'];
  const T = (id: string) => teachers.find((t) => t.id === id)!;
  const L = (id: string) => learners.find((l) => l.id === id)!;
  let n = 1;

  const add = (teacherId: string, learnerId: string, date: string, time: string, status: Booking['status'], opts: Partial<Booking> = {}) => {
    const t = T(teacherId);
    const l = L(learnerId);
    const isFree = opts.isFree ?? false;
    bookings.push({
      id: `B${String(n++).padStart(4, '0')}`,
      teacherId, teacherName: t.name, learnerId, learnerName: l.name, subject: t.subject,
      date, time, durationMins: t.classDurationMins,
      amount: isFree ? 0 : t.price, isFree, status,
      paymentMethod: isFree ? 'Free first class' : methods[Math.floor(random() * methods.length)],
      reviewed: false,
      createdAt: status === 'upcoming' ? new Date(Date.now() - (2 + Math.floor(random() * 3)) * 86400000).toISOString() : createdBefore(date, 3),
      ...opts,
    });
  };

  // Ananya (L1) — the demo learner
  add('t2', 'L1', nextDateFor('Saturday', 1), '17:00', 'upcoming', { paymentMethod: 'UPI' });
  add('t4', 'L1', nextDateFor('Tuesday', 2), '18:00', 'upcoming', { paymentMethod: 'Credit / Debit Card' });
  add('t9', 'L1', prevDateIn(['Monday', 'Tuesday', 'Thursday'], 4), '16:00', 'completed');
  add('t7', 'L1', prevDateIn(['Monday', 'Tuesday', 'Thursday'], 12), '17:00', 'completed', { reviewed: true });
  add('t2', 'L1', prevDateIn(['Monday', 'Wednesday', 'Saturday'], 20), '18:00', 'completed', { isFree: true, reviewed: true });

  // Gunjan (t2) — the demo teacher: six months of history
  const gDays = teachingDays(T('t2').availability);
  const offsets = [2, 5, 9, 13, 17, 23, 28, 33, 38, 44, 51, 58, 64, 71, 79, 86, 95, 104, 118, 133, 150, 168];
  const times = ['17:00', '18:00', '19:00'];
  const used = new Set(bookings.map((b) => `${b.teacherId}|${b.date}|${b.time}`));
  offsets.forEach((o, i) => {
    const date = prevDateIn(gDays, o);
    let time = times[i % 3];
    if (dayOfISO(date) === 'Saturday') time = ['10:00', '11:00', '12:00'][i % 3];
    const key = `t2|${date}|${time}`;
    if (used.has(key)) return;
    used.add(key);
    add('t2', `L${2 + (i % 9)}`, date, time, 'completed', { reviewed: i % 4 === 0 });
  });
  add('t2', 'L3', nextDateFor('Monday', 1), '17:00', 'upcoming');
  add('t2', 'L5', nextDateFor('Wednesday', 1), '18:00', 'upcoming');
  add('t2', 'L7', nextDateFor('Saturday', 1), '11:00', 'upcoming');
  add('t2', 'L9', prevDateIn(gDays, 40), '19:00', 'cancelled');

  // Everyone else: a little history and one upcoming class each
  teachers
    .filter((t) => (t.status === 'verified' || t.status === 'unverified') && t.id !== 't2')
    .forEach((t, ti) => {
      const days = teachingDays(t.availability);
      const learnerA = `L${2 + ((ti * 3) % 9)}`;
      const learnerB = `L${2 + ((ti * 5 + 1) % 9)}`;
      const firstSlot = (d: Day) => generateSlots(t.availability, d, t.classDurationMins)[0];
      const p1 = prevDateIn(days, 6 + ti);
      const p2 = prevDateIn(days, 25 + ti * 2);
      const p3 = prevDateIn(days, 55 + ti * 3);
      add(t.id, learnerA, p1, firstSlot(dayOfISO(p1)), 'completed', { reviewed: true });
      add(t.id, learnerB, p2, firstSlot(dayOfISO(p2)), 'completed');
      add(t.id, learnerA, p3, firstSlot(dayOfISO(p3)), 'completed');
      const lastDay = days[days.length - 1];
      const up = nextDateFor(lastDay, 3);
      add(t.id, learnerB, up, firstSlot(lastDay), 'upcoming');
    });

  const payments: Payment[] = bookings
    .filter((b) => b.amount > 0)
    .map((b, i) => ({
      id: `PAY${String(i + 1).padStart(4, '0')}`,
      bookingId: b.id,
      learnerId: b.learnerId,
      learnerName: b.learnerName,
      teacherId: b.teacherId,
      teacherName: b.teacherName,
      subject: b.subject,
      amount: b.amount,
      method: b.paymentMethod,
      date: b.createdAt,
      status: b.status === 'completed' ? 'Completed' : b.status === 'cancelled' ? 'Refunded' : 'Pending',
    }));

  return { bookings, payments };
}
