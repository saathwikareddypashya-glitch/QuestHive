import type { Booking, Notification } from '../types';
import { dayOfISO, formatTime } from '../utils/formatters';

export function seedNotifications(bookings: Booking[], pendingCount: number): Notification[] {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
  const next = bookings.find((b) => b.learnerId === 'L1' && b.teacherId === 't2' && b.status === 'upcoming');
  const toReview = bookings.find((b) => b.learnerId === 'L1' && b.status === 'completed' && !b.reviewed);
  const list: Omit<Notification, 'id'>[] = [
    { recipientRole: 'learner', recipientId: 'L1', type: 'booking', message: 'Your booking with Gunjan is confirmed.', date: hoursAgo(30), read: false, link: '/learner/bookings' },
    next && { recipientRole: 'learner', recipientId: 'L1', type: 'reminder', message: `Your Guitar class is on ${dayOfISO(next.date)} at ${formatTime(next.time)}.`, date: hoursAgo(3), read: false, link: '/learner/bookings' },
    toReview && { recipientRole: 'learner', recipientId: 'L1', type: 'review', message: `How was your ${toReview.subject} class with ${toReview.teacherName}? Leave a review.`, date: hoursAgo(50), read: false, link: '/learner/reviews' },
    { recipientRole: 'learner', recipientId: 'L1', type: 'payment', message: 'Payment of ₹1,800 to Arjun was successful.', date: hoursAgo(72), read: true, link: '/learner/payments' },
    { recipientRole: 'teacher', recipientId: 't2', type: 'booking', message: 'Ananya booked a Guitar class with you.', date: hoursAgo(30), read: false, link: '/teacher/bookings' },
    { recipientRole: 'teacher', recipientId: 't2', type: 'review', message: 'You received a new 5★ review.', date: hoursAgo(80), read: false, link: '/teacher/reviews' },
    { recipientRole: 'teacher', recipientId: 't2', type: 'approval', message: 'Your teacher application has been approved.', date: hoursAgo(24 * 200), read: true, link: '/teacher/verification' },
    { recipientRole: 'admin', recipientId: 'admin', type: 'application', message: `${pendingCount} teacher applications are waiting for review.`, date: hoursAgo(5), read: false, link: '/admin/verification' },
    { recipientRole: 'admin', recipientId: 'admin', type: 'booking', message: 'New booking: Ananya with Gunjan (Guitar).', date: hoursAgo(30), read: true, link: '/admin/bookings' },
  ].filter(Boolean) as Omit<Notification, 'id'>[];
  return list.map((x, i) => ({ ...x, id: `N${i + 1}` }));
}
