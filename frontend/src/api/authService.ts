import type { Gender, Learner, Role, User } from '../types';
import { ApiError, clone, delay, getDb, updateDb } from './mockDb';
import { USE_MOCK } from './http';
import { remoteAuth } from './remote';
import { initialsAvatar } from '../utils/images';
import { todayISO, uid } from '../utils/formatters';

/** Admin login used in mock mode. The real backend reads it from application.properties. */
export const MOCK_ADMIN = { email: 'admin@questhive.demo', password: 'admin123' };

const learnerUser = (l: Learner): User => ({ id: l.id, role: 'learner', name: l.name, email: l.email, avatar: l.avatar });

const mock = {
  // POST /api/auth/login
  async login(email: string, password: string, role: Role): Promise<User> {
    await delay();
    if (!email || !password) throw new ApiError('Enter your email and password.');
    const db = getDb();
    const e = email.trim().toLowerCase();
    if (role === 'learner') {
      const l = db.learners.find((x) => x.email.toLowerCase() === e);
      if (!l) throw new ApiError('No learner account found with this email. Create one first.');
      if (db.passwords[`learner:${l.id}`] !== password) throw new ApiError('Incorrect password. Please try again.');
      return learnerUser(l);
    }
    if (role === 'teacher') {
      const t = db.teachers.find((x) => x.email.toLowerCase() === e);
      if (!t) throw new ApiError('No teacher account found with this email. Apply to teach first.');
      if (db.passwords[`teacher:${t.id}`] !== password) throw new ApiError('Incorrect password. Please try again.');
      if (t.status === 'pending') throw new ApiError('Your application is still being reviewed. You can sign in once it is approved.');
      if (t.status === 'rejected') throw new ApiError(`Your application was not approved: ${t.rejectionReason}`);
      return { id: t.id, role: 'teacher', name: t.name, email: t.email, avatar: t.image };
    }
    if (e !== MOCK_ADMIN.email || password !== MOCK_ADMIN.password) throw new ApiError('Incorrect admin email or password.');
    return { id: 'admin', role: 'admin', name: 'Admin', email: MOCK_ADMIN.email, avatar: initialsAvatar('Admin QH') };
  },

  // POST /api/auth/register
  async registerLearner(data: { name: string; email: string; password: string; gender: Gender }): Promise<User> {
    await delay();
    return updateDb((db) => {
      if (db.learners.some((l) => l.email.toLowerCase() === data.email.trim().toLowerCase()))
        throw new ApiError('An account with this email already exists. Sign in instead.');
      const learner: Learner = {
        id: uid('L'), name: data.name.trim(), email: data.email.trim(), gender: data.gender, avatar: initialsAvatar(data.name),
        rating: 5, ratingNote: 'New to QuestHive.', joinedAt: todayISO(),
      };
      db.learners.push(learner);
      db.passwords[`learner:${learner.id}`] = data.password;
      return learnerUser(learner);
    });
  },

  // POST /api/auth/change-password
  async changePassword(role: Role, userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await delay();
    updateDb((db) => {
      if (role === 'admin') throw new ApiError('The admin password is set in application.properties.');
      const key = `${role}:${userId}`;
      if (db.passwords[key] !== currentPassword) throw new ApiError('Your current password is incorrect.');
      db.passwords[key] = newPassword;
    });
  },

  // GET /api/learners/:id
  async getLearner(id: string): Promise<Learner> {
    await delay(300, 500);
    const l = getDb().learners.find((x) => x.id === id);
    if (!l) throw new ApiError('Account not found.');
    return clone(l);
  },

  // PATCH /api/learners/:id
  async updateLearner(id: string, patch: Partial<Learner>): Promise<Learner> {
    await delay();
    return updateDb((db) => {
      const l = db.learners.find((x) => x.id === id);
      if (!l) throw new ApiError('Account not found.');
      if (patch.email && patch.email.toLowerCase() !== l.email.toLowerCase() && db.learners.some((x) => x.email.toLowerCase() === patch.email!.toLowerCase()))
        throw new ApiError('Another account already uses this email.');
      Object.assign(l, patch);
      if (patch.name) {
        db.bookings.forEach((b) => { if (b.learnerId === id) b.learnerName = patch.name!; });
        db.payments.forEach((p) => { if (p.learnerId === id) p.learnerName = patch.name!; });
      }
      return clone(l);
    });
  },
};

export const authService: typeof mock = USE_MOCK ? mock : remoteAuth;
