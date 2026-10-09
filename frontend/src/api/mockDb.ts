/**
 * Mock database — a localStorage-backed store that every mock service reads from and writes to.
 * Nothing here runs on a server. When a real backend exists, replace the service functions in
 * src/api/*Service.ts with fetch() calls; pages and components will not need to change.
 */
import type { Booking, Category, Learner, Notification, Payment, Review, Teacher } from '../types';
import { seedTeachers } from '../data/teachers';
import { seedLearners } from '../data/learners';
import { seedBookingsAndPayments } from '../data/bookings';
import { seedReviews } from '../data/reviews';
import { seedNotifications } from '../data/notifications';
import { seedCategories } from '../data/subjects';

export interface DB {
  version: number;
  teachers: Teacher[];
  learners: Learner[];
  bookings: Booking[];
  payments: Payment[];
  reviews: Review[];
  notifications: Notification[];
  categories: Category[];
  /** Mock-mode credentials, keyed "role:id". The real backend stores BCrypt hashes in MySQL. */
  passwords: Record<string, string>;
}

const KEY = 'questhive_db';
const VERSION = 4;
export const DEMO_PASSWORD = 'demo1234';
export const DB_EVENT = 'questhive:db-change';

function seed(): DB {
  const teachers = seedTeachers();
  const learners = seedLearners();
  const { bookings, payments } = seedBookingsAndPayments(teachers, learners);
  const reviews = seedReviews(teachers, learners, bookings);
  const notifications = seedNotifications(bookings, teachers.filter((t) => t.status === 'pending').length);
  const passwords: Record<string, string> = {};
  teachers.forEach((t) => { passwords[`teacher:${t.id}`] = DEMO_PASSWORD; });
  learners.forEach((l) => { passwords[`learner:${l.id}`] = DEMO_PASSWORD; });
  return { version: VERSION, teachers, learners, bookings, payments, reviews, notifications, categories: seedCategories.map((c) => ({ ...c, subjects: [...c.subjects] })), passwords };
}

let cache: DB | null = null;

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    throw new Error('Your browser storage is full. Use "Reset demo data" in the footer to clear it.');
  }
}

export function getDb(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as DB) : null;
    cache = parsed && parsed.version === VERSION ? parsed : seed();
  } catch {
    cache = seed();
  }
  persist();
  return cache;
}

/** Mutate the database, save it, and tell every subscribed component to refetch. */
export function updateDb<T>(mutator: (db: DB) => T): T {
  const db = getDb();
  const result = mutator(db);
  persist();
  window.dispatchEvent(new Event(DB_EVENT));
  return result;
}

export function resetDb() {
  cache = seed();
  persist();
  window.dispatchEvent(new Event(DB_EVENT));
}

/** Simulated network latency (400–800ms). */
export const delay = (min = 400, max = 800) =>
  new Promise<void>((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

/** Services return copies so components can never mutate the store directly. */
export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export class ApiError extends Error {
  constructor(message: string, public code = 'ERROR') {
    super(message);
  }
}
