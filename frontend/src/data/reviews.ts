import type { Booking, Learner, Review, Teacher } from '../types';
import { addDays, toISODate } from '../utils/formatters';
import { rng } from './bookings';

const templates = [
  (n: string, s: string) => `${n} explained everything clearly and made learning ${s.toLowerCase()} really easy.`,
  (n: string) => `Patient, well prepared and genuinely encouraging. I look forward to every class with ${n}.`,
  (n: string, s: string) => `I had tried learning ${s.toLowerCase()} on YouTube for months. Three classes with ${n} did more than all of that.`,
  (n: string) => `Very structured sessions with useful homework. ${n} always notices exactly where I am stuck.`,
  (n: string) => `Friendly, punctual and knows the subject deeply. Highly recommend ${n}.`,
  (n: string, s: string) => `The first free class convinced me. ${n} tailored the ${s.toLowerCase()} lessons to my goals.`,
  (n: string) => `Great energy and practical tips I could use immediately. Booking more classes with ${n}.`,
];

export function seedReviews(teachers: Teacher[], learners: Learner[], bookings: Booking[]): Review[] {
  const random = rng(7);
  const reviews: Review[] = [];
  let n = 1;
  const today = new Date();

  // Reviews tied to reviewed bookings
  bookings
    .filter((b) => b.reviewed)
    .forEach((b) => {
      const t = teachers.find((x) => x.id === b.teacherId)!;
      const isAnanyaGunjan = b.learnerId === 'L1' && b.teacherId === 't2';
      const isAnanyaMeera = b.learnerId === 'L1' && b.teacherId === 't7';
      reviews.push({
        id: `R${String(n++).padStart(4, '0')}`,
        teacherId: b.teacherId,
        learnerId: b.learnerId,
        learnerName: b.learnerName.split(' ')[0],
        rating: isAnanyaGunjan || isAnanyaMeera ? 5 : random() > 0.25 ? 5 : 4,
        comment: isAnanyaGunjan
          ? 'Gunjan explained everything clearly and made learning guitar really easy.'
          : isAnanyaMeera
            ? 'Meera helped me stop rushing through presentations. My placement interview went so much better.'
            : templates[Math.floor(random() * templates.length)](t.name, t.subject),
        date: toISODate(addDays(new Date(b.date), 1)),
        bookingId: b.id,
      });
    });

  // A few extra older reviews per public teacher so every profile has social proof
  teachers
    .filter((t) => t.status === 'verified' || t.status === 'unverified')
    .forEach((t, ti) => {
      for (let k = 0; k < 2; k++) {
        const l = learners[1 + ((ti + k * 4) % (learners.length - 1))];
        reviews.push({
          id: `R${String(n++).padStart(4, '0')}`,
          teacherId: t.id,
          learnerId: l.id,
          learnerName: l.name.split(' ')[0],
          rating: random() > 0.2 ? 5 : 4,
          comment: templates[(ti + k * 3) % templates.length](t.name, t.subject),
          date: toISODate(addDays(today, -(60 + Math.floor(random() * 200)))),
        });
      }
    });

  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}
