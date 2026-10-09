import type { Category } from '../../types';
import { DAYS, formatINR } from '../../utils/formatters';

export interface Filters {
  subject: string;
  category: string;
  maxPrice: number;
  minRating: number;
  gender: string;
  minExp: number;
  day: string;
  verifiedOnly: boolean;
}

export const PRICE_CAP = 3000;
export const defaultFilters: Filters = { subject: '', category: '', maxPrice: PRICE_CAP, minRating: 0, gender: '', minExp: 0, day: '', verifiedOnly: false };

export const activeFilterCount = (f: Filters) =>
  (f.subject ? 1 : 0) + (f.category ? 1 : 0) + (f.maxPrice < PRICE_CAP ? 1 : 0) + (f.minRating ? 1 : 0) +
  (f.gender ? 1 : 0) + (f.minExp ? 1 : 0) + (f.day ? 1 : 0) + (f.verifiedOnly ? 1 : 0);

export interface SubjectOption { name: string; count: number }
export interface SubjectGroup { label: string; subjects: SubjectOption[] }

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  /** Every subject, grouped by category, with how many teachers teach it. */
  subjectGroups: SubjectGroup[];
  categories: Category[];
}

export default function FilterPanel({ filters, onChange, subjectGroups, categories }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...filters, [k]: v });

  return (
    <div className="filter-panel">
      <div className="field">
        <label className="label" htmlFor="f-category">Category</label>
        <select id="f-category" className="input" value={filters.category} onChange={(e) => {
          const category = e.target.value;
          const keepSubject = !category || categories.find((c) => c.id === category)?.subjects.includes(filters.subject);
          onChange({ ...filters, category, subject: keepSubject ? filters.subject : '' });
        }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.shortName}</option>)}
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="f-subject">Subject</label>
        <select id="f-subject" className="input" value={filters.subject} onChange={(e) => set('subject', e.target.value)}>
          <option value="">All subjects</option>
          {subjectGroups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.subjects.map((s) => (
                <option key={s.name} value={s.name}>{s.name}{s.count ? ` (${s.count})` : ' (no teachers yet)'}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="f-price">
          Max price <span className="label-value">{filters.maxPrice >= PRICE_CAP ? 'Any' : `${formatINR(filters.maxPrice)}/hr`}</span>
        </label>
        <input id="f-price" type="range" className="range" min={500} max={PRICE_CAP} step={100} value={filters.maxPrice} onChange={(e) => set('maxPrice', Number(e.target.value))} />
      </div>

      <fieldset className="field">
        <legend className="label">Rating</legend>
        <div className="chip-row">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button key={r} type="button" className={`chip ${filters.minRating === r ? 'is-on' : ''}`} onClick={() => set('minRating', r)}>
              {r === 0 ? 'Any' : `${r}+ ★`}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="label">Teacher gender</legend>
        <div className="chip-row">
          {['', 'Female', 'Male'].map((g) => (
            <button key={g || 'any'} type="button" className={`chip ${filters.gender === g ? 'is-on' : ''}`} onClick={() => set('gender', g)}>
              {g || 'Any'}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="label" htmlFor="f-exp">Experience</label>
        <select id="f-exp" className="input" value={filters.minExp} onChange={(e) => set('minExp', Number(e.target.value))}>
          <option value={0}>Any experience</option>
          <option value={3}>3+ years</option>
          <option value={5}>5+ years</option>
          <option value={8}>8+ years</option>
          <option value={10}>10+ years</option>
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="f-day">Available on</label>
        <select id="f-day" className="input" value={filters.day} onChange={(e) => set('day', e.target.value)}>
          <option value="">Any day</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <label className="switch-row">
        <span>Verified teachers only</span>
        <input type="checkbox" className="switch" checked={filters.verifiedOnly} onChange={(e) => set('verifiedOnly', e.target.checked)} />
      </label>
    </div>
  );
}
