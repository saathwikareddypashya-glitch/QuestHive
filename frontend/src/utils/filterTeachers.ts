import type { Category, Teacher } from '../types';
import type { Filters } from '../components/search/FilterPanel';
import { PRICE_CAP } from '../components/search/FilterPanel';

export type SortKey = 'recommended' | 'rating' | 'price' | 'reviews';

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price', label: 'Lowest price' },
  { value: 'reviews', label: 'Most reviewed' },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]/g, '');

export function matchesQuery(t: Teacher, q: string, categories: Category[]) {
  if (!q.trim()) return true;
  const cat = categories.find((c) => c.id === t.category);
  const hay = [t.name, t.subject, t.location, t.description, cat?.name ?? '', ...t.skills].join(' ').toLowerCase();
  const hayNorm = norm(hay);
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word) || hayNorm.includes(norm(word)));
}

export function teachesSubject(t: Teacher, subject: string) {
  const s = subject.toLowerCase();
  return t.subject.toLowerCase() === s || t.skills.some((k) => k.toLowerCase() === s);
}

export function filterTeachers(list: Teacher[], q: string, f: Filters, sort: SortKey, categories: Category[]) {
  const out = list.filter((t) =>
    matchesQuery(t, q, categories) &&
    (!f.category || t.category === f.category) &&
    (!f.subject || teachesSubject(t, f.subject)) &&
    (f.maxPrice >= PRICE_CAP || t.price <= f.maxPrice) &&
    (!f.minRating || t.rating >= f.minRating) &&
    (!f.gender || t.gender === f.gender) &&
    (!f.minExp || t.experienceYears >= f.minExp) &&
    (!f.day || t.availability.some((a) => a.day === f.day)) &&
    (!f.verifiedOnly || t.verified),
  );
  const score = (t: Teacher) => t.rating * Math.log10(t.reviewCount + 10) + (t.verified ? 1 : 0);
  const sorters: Record<SortKey, (a: Teacher, b: Teacher) => number> = {
    recommended: (a, b) => score(b) - score(a),
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    price: (a, b) => a.price - b.price,
    reviews: (a, b) => b.reviewCount - a.reviewCount,
  };
  return [...out].sort(sorters[sort]);
}
