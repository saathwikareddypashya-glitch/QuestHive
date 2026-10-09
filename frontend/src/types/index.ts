export type Role = 'learner' | 'teacher' | 'admin';
export type Gender = 'Female' | 'Male' | 'Other';
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TeacherStatus = 'verified' | 'unverified' | 'pending' | 'rejected';

export interface AvailabilityRange {
  id: string;
  day: Day;
  start: string; // "17:00"
  end: string;   // "20:00"
}

export interface Teacher {
  id: string;
  name: string;
  gender: Gender;
  email: string;
  image: string;          // local path, remote URL or uploaded data URL
  imageFallback?: string; // used if `image` fails to load
  location: string;
  online: boolean;
  subject: string;
  category: string;       // category id
  rating: number;
  reviewCount: number;
  description: string;
  bio: string;
  price: number;
  experienceYears: number;
  qualifications: string[];
  skills: string[];
  teachingStyle: string;
  languages: string[];
  verified: boolean;
  status: TeacherStatus;
  firstClassFree: boolean;
  studentCount: number;
  completedClasses: number;
  availability: AvailabilityRange[];
  classDurationMins: number;
  joinedAt: string;
  submittedAt?: string;
  verifiedAt?: string;
  certificate?: string;
  certificateName?: string;
  rejectionReason?: string;
}

export interface Learner {
  id: string;
  name: string;
  email: string;
  gender: Gender;
  avatar: string;
  rating: number;
  ratingNote: string;
  joinedAt: string;
  location?: string;
}

export interface Review {
  id: string;
  teacherId: string;
  learnerId: string;
  learnerName: string;
  rating: number;
  comment: string;
  date: string;
  bookingId?: string;
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  teacherId: string;
  teacherName: string;
  learnerId: string;
  learnerName: string;
  subject: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMins: number;
  amount: number;
  isFree: boolean;
  status: BookingStatus;
  paymentMethod: string;
  reviewed: boolean;
  createdAt: string;
}

export type PaymentStatus = 'Completed' | 'Pending' | 'Refunded';

export interface Payment {
  id: string;
  bookingId: string;
  learnerId: string;
  learnerName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  amount: number;
  method: string;
  date: string;
  status: PaymentStatus;
}

export interface Notification {
  id: string;
  recipientRole: Role;
  recipientId: string;
  type: 'booking' | 'approval' | 'review' | 'reminder' | 'application' | 'payment' | 'info';
  message: string;
  date: string; // ISO datetime
  read: boolean;
  link?: string;
}

export interface Category {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  description: string;
  subjects: string[];
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar: string;
}

export interface BookingDraft {
  teacherId: string;
  teacherName: string;
  teacherImage: string;
  subject: string;
  date: string;
  time: string;
  durationMins: number;
  price: number;
  amount: number;
  isFree: boolean;
}

export interface TeacherApplication {
  name: string;
  gender: Gender;
  email: string;
  password: string;
  image: string;
  subject: string;
  category: string;
  bio: string;
  experienceYears: number;
  qualifications: string[];
  certificate: string;
  certificateName: string;
  price: number;
  classDurationMins: number;
  availability: AvailabilityRange[];
  location: string;
}
