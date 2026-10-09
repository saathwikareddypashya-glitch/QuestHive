/** Real API implementations — same signatures as the mock services, backed by Spring Boot. */
import type {
  AvailabilityRange, Booking, BookingDraft, Category, Learner, Notification, Payment, Review, Role, Teacher, TeacherApplication, User,
} from '../types';
import { http, q } from './http';

const e = encodeURIComponent;

export const remoteTeacher = {
  getPublicTeachers: () => http.get<Teacher[]>('/teachers'),
  getAllTeachers: () => http.get<Teacher[]>('/teachers' + q({ include: 'all' })),
  getTeacherById: (id: string) => http.get<Teacher>(`/teachers/${e(id)}`),
  getReviews: (teacherId: string) => http.get<Review[]>(`/teachers/${e(teacherId)}/reviews`),
  getSlotsForDate: (teacherId: string, date: string) =>
    http.get<{ time: string; available: boolean; reason?: 'booked' | 'past' }[]>(`/teachers/${e(teacherId)}/slots` + q({ date }))
      .then((slots) => slots.map((s) => ({ ...s, reason: s.reason ?? undefined }))),
  updateProfile: (id: string, patch: Partial<Teacher>) => http.patch<Teacher>(`/teachers/${e(id)}`, patch),
  updateAvailability: (id: string, availability: AvailabilityRange[], classDurationMins: number) =>
    http.put<Teacher>(`/teachers/${e(id)}/availability`, { availability, classDurationMins }),
  apply: (app: TeacherApplication) => http.post<Teacher>('/teachers/apply', app),
};

export const remoteBooking = {
  getLearnerBookings: (learnerId: string) => http.get<Booking[]>(`/learners/${e(learnerId)}/bookings`),
  getTeacherBookings: (teacherId: string) => http.get<Booking[]>(`/teachers/${e(teacherId)}/bookings`),
  getBookingById: (id: string) => http.get<Booking>(`/bookings/${e(id)}`),
  isFirstClass: (learnerId: string, teacherId: string) =>
    http.get<{ firstClass: boolean }>('/bookings/first-class' + q({ learner: learnerId, teacher: teacherId })).then((r) => r.firstClass),
  cancel: (id: string) => http.post<Booking>(`/bookings/${e(id)}/cancel`),
  markCompleted: (id: string) => http.post<Booking>(`/bookings/${e(id)}/complete`),
  getAll: () => http.get<Booking[]>('/bookings'),
};

export const remotePayment = {
  payAndBook: (draft: BookingDraft, learner: User, method: string) =>
    http.post<Booking>('/payments', { draft, learner: { id: learner.id, name: learner.name }, method }),
  getLearnerPayments: (learnerId: string) => http.get<Payment[]>(`/learners/${e(learnerId)}/payments`),
  getTeacherTransactions: (teacherId: string) => http.get<Payment[]>(`/teachers/${e(teacherId)}/transactions`),
  getAll: () => http.get<Payment[]>('/payments'),
};

export const remoteReview = {
  submit: (bookingId: string, rating: number, comment: string, learner: User) =>
    http.post<Review>('/reviews', { bookingId, rating, comment, learnerId: learner.id }),
  getLearnerReviews: (learnerId: string) => http.get<Review[]>(`/learners/${e(learnerId)}/reviews`),
  getAll: () => http.get<Review[]>('/reviews'),
  remove: (id: string) => http.delete<void>(`/reviews/${e(id)}`),
};

export const remoteAuth = {
  login: (email: string, password: string, role: Role) => http.post<User>('/auth/login', { email, password, role }),
  registerLearner: (data: { name: string; email: string; password: string; gender: string }) => http.post<User>('/auth/register', data),
  changePassword: (role: Role, userId: string, currentPassword: string, newPassword: string) =>
    http.post<void>('/auth/change-password', { role, userId, currentPassword, newPassword }),
  getLearner: (id: string) => http.get<Learner>(`/learners/${e(id)}`),
  updateLearner: (id: string, patch: Partial<Learner>) => http.patch<Learner>(`/learners/${e(id)}`, patch),
};

export const remoteNotification = {
  getFor: (role: Role, userId: string) => http.get<Notification[]>('/notifications' + q({ role, userId })),
  markAllRead: (role: Role, userId: string) => http.post<void>('/notifications/read-all', { role, userId }),
  markRead: (id: string) => http.post<void>(`/notifications/${e(id)}/read`),
};

type Stats = { learners: number; teachers: number; pending: number; bookings: number; gmv: number; revenue: number;
  series: { month: string; bookings: number; revenue: number; gmv: number }[] };
type Report = {
  byCategory: { name: string; bookings: number }[];
  topTeachers: { id: string; name: string; subject: string; rating: number; image: string; imageFallback: string | undefined; earnings: number }[];
  ratings: { rating: string; count: number }[];
  methods: { method: string; count: number }[];
};

export const remoteAdmin = {
  getStats: () => http.get<Stats>('/admin/stats'),
  getTeachers: () => http.get<Teacher[]>('/admin/teachers'),
  getApplications: () => http.get<Teacher[]>('/admin/applications'),
  approve: (id: string) => http.post<Teacher>(`/admin/teachers/${e(id)}/approve`),
  reject: (id: string, reason: string) => http.post<Teacher>(`/admin/teachers/${e(id)}/reject`, { reason }),
  setStatus: (id: string, status: Teacher['status']) => http.patch<Teacher>(`/admin/teachers/${e(id)}/status`, { status }),
  getLearners: () => http.get<(Learner & { bookings: number; spent: number })[]>('/admin/learners'),
  getCategories: () => http.get<Category[]>('/subjects'),
  addSubject: (categoryId: string, name: string) => http.post<Category>(`/subjects/${e(categoryId)}`, { name }).then(() => undefined),
  removeSubject: (categoryId: string, name: string) => http.delete<Category>(`/subjects/${e(categoryId)}` + q({ name })).then(() => undefined),
  getReport: () => http.get<Report>('/admin/reports'),
  resetDemo: () => http.post<{ ok: boolean }>('/admin/reset').then(() => undefined),
};
