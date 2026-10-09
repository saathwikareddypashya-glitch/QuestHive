import type { Review, User } from '../types';
import { ApiError, clone, delay, getDb, updateDb } from './mockDb';
import { USE_MOCK } from './http';
import { remoteReview } from './remote';
import { todayISO, uid } from '../utils/formatters';

const mock = {
  // POST /api/reviews
  async submit(bookingId: string, rating: number, comment: string, learner: User): Promise<Review> {
    await delay();
    return updateDb((db) => {
      const b = db.bookings.find((x) => x.id === bookingId);
      if (!b) throw new ApiError('We could not find that class.');
      if (b.status !== 'completed') throw new ApiError('You can review a class after it is completed.');
      if (b.reviewed) throw new ApiError('You have already reviewed this class.');
      const review: Review = {
        id: uid('R'), teacherId: b.teacherId, learnerId: learner.id, learnerName: learner.name.split(' ')[0],
        rating, comment, date: todayISO(), bookingId,
      };
      db.reviews.unshift(review);
      b.reviewed = true;
      const t = db.teachers.find((x) => x.id === b.teacherId);
      if (t) {
        t.rating = Math.round(((t.rating * t.reviewCount + rating) / (t.reviewCount + 1)) * 10) / 10;
        t.reviewCount += 1;
      }
      db.notifications.unshift({
        id: uid('n'), recipientRole: 'teacher', recipientId: b.teacherId, type: 'review',
        message: `You received a new ${rating}★ review from ${review.learnerName}.`, date: new Date().toISOString(), read: false, link: '/teacher/reviews',
      });
      return clone(review);
    });
  },

  // GET /api/learners/:id/reviews
  async getLearnerReviews(learnerId: string): Promise<Review[]> {
    await delay();
    return clone(getDb().reviews.filter((r) => r.learnerId === learnerId));
  },

  async getAll(): Promise<Review[]> {
    await delay();
    return clone(getDb().reviews);
  },

  // DELETE /api/reviews/:id  (admin moderation)
  async remove(id: string): Promise<void> {
    await delay(300, 500);
    updateDb((db) => {
      const r = db.reviews.find((x) => x.id === id);
      db.reviews = db.reviews.filter((x) => x.id !== id);
      const t = r && db.teachers.find((x) => x.id === r.teacherId);
      if (t && r && t.reviewCount > 1) {
        t.rating = Math.round(((t.rating * t.reviewCount - r.rating) / (t.reviewCount - 1)) * 10) / 10;
        t.reviewCount -= 1;
      }
    });
  },
};

export const reviewService: typeof mock = USE_MOCK ? mock : remoteReview;
