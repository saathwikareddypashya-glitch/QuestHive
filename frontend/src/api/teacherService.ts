import type { AvailabilityRange, Review, Teacher, TeacherApplication } from '../types';
import { ApiError, clone, delay, getDb, updateDb } from './mockDb';
import { USE_MOCK } from './http';
import { remoteTeacher } from './remote';
import { dayOfISO, isPastSlot, uid } from '../utils/formatters';
import { generateSlots } from '../utils/slots';

export const isPublic = (t: Teacher) => t.status === 'verified' || t.status === 'unverified';

export interface Slot { time: string; available: boolean; reason?: 'booked' | 'past' }

const mock = {
  // GET /api/teachers
  async getPublicTeachers(): Promise<Teacher[]> {
    await delay();
    return clone(getDb().teachers.filter(isPublic));
  },

  // GET /api/teachers?include=all  (used to show photos next to bookings)
  async getAllTeachers(): Promise<Teacher[]> {
    await delay(200, 400);
    return clone(getDb().teachers);
  },

  // GET /api/teachers/:id
  async getTeacherById(id: string): Promise<Teacher> {
    await delay();
    const t = getDb().teachers.find((x) => x.id === id);
    if (!t) throw new ApiError('We could not find that teacher.', 'NOT_FOUND');
    return clone(t);
  },

  // GET /api/teachers/:id/reviews
  async getReviews(teacherId: string): Promise<Review[]> {
    await delay(300, 500);
    return clone(getDb().reviews.filter((r) => r.teacherId === teacherId).sort((a, b) => b.date.localeCompare(a.date)));
  },

  // GET /api/teachers/:id/slots?date=YYYY-MM-DD
  async getSlotsForDate(teacherId: string, date: string): Promise<Slot[]> {
    await delay(300, 600);
    const db = getDb();
    const t = db.teachers.find((x) => x.id === teacherId);
    if (!t) throw new ApiError('We could not find that teacher.', 'NOT_FOUND');
    const booked = new Set(
      db.bookings.filter((b) => b.teacherId === teacherId && b.date === date && b.status === 'upcoming').map((b) => b.time),
    );
    return generateSlots(t.availability, dayOfISO(date), t.classDurationMins).map((time) => {
      if (booked.has(time)) return { time, available: false, reason: 'booked' as const };
      if (isPastSlot(date, time)) return { time, available: false, reason: 'past' as const };
      return { time, available: true };
    });
  },

  // PATCH /api/teachers/:id
  async updateProfile(id: string, patch: Partial<Teacher>): Promise<Teacher> {
    await delay();
    return updateDb((db) => {
      const t = db.teachers.find((x) => x.id === id);
      if (!t) throw new ApiError('We could not find that teacher.');
      Object.assign(t, patch);
      db.bookings.forEach((b) => { if (b.teacherId === id && patch.name) b.teacherName = patch.name; });
      return clone(t);
    });
  },

  // PUT /api/teachers/:id/availability
  async updateAvailability(id: string, availability: AvailabilityRange[], classDurationMins: number): Promise<Teacher> {
    await delay(250, 450);
    return updateDb((db) => {
      const t = db.teachers.find((x) => x.id === id);
      if (!t) throw new ApiError('We could not find that teacher.');
      t.availability = availability;
      t.classDurationMins = classDurationMins;
      return clone(t);
    });
  },

  // POST /api/teachers/apply
  async apply(app: TeacherApplication): Promise<Teacher> {
    await delay(900, 1300);
    return updateDb((db) => {
      if (db.teachers.some((t) => t.email.toLowerCase() === app.email.toLowerCase()))
        throw new ApiError('An application with this email already exists.');
      const now = new Date().toISOString();
      const teacher: Teacher = {
        id: uid('t'),
        name: app.name,
        gender: app.gender,
        email: app.email,
        image: app.image,
        location: app.location || 'India',
        online: true,
        subject: app.subject,
        category: app.category,
        rating: 0,
        reviewCount: 0,
        description: app.bio.split('. ')[0].slice(0, 120),
        bio: app.bio,
        price: app.price,
        experienceYears: app.experienceYears,
        qualifications: app.qualifications,
        skills: [app.subject],
        teachingStyle: 'Personalised one-to-one classes.',
        languages: ['English'],
        verified: false,
        status: 'pending',
        firstClassFree: true,
        studentCount: 0,
        completedClasses: 0,
        availability: app.availability,
        classDurationMins: app.classDurationMins,
        joinedAt: now.slice(0, 10),
        submittedAt: now.slice(0, 10),
        certificate: app.certificate,
        certificateName: app.certificateName,
      };
      db.teachers.push(teacher);
      db.passwords[`teacher:${teacher.id}`] = app.password;
      db.notifications.unshift({
        id: uid('n'), recipientRole: 'admin', recipientId: 'admin', type: 'application',
        message: `New teacher application from ${app.name} (${app.subject}).`, date: now, read: false, link: '/admin/verification',
      });
      return clone(teacher);
    });
  },
};

export const teacherService: typeof mock = USE_MOCK ? mock : remoteTeacher;
