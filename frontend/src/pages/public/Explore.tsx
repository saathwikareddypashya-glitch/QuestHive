import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, SearchX, X } from 'lucide-react';
import SearchBar from '../../components/search/SearchBar';
import FilterPanel, { activeFilterCount, defaultFilters, PRICE_CAP, type Filters } from '../../components/search/FilterPanel';
import FilterDrawer from '../../components/search/FilterDrawer';
import TeacherGrid from '../../components/teacher/TeacherGrid';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { filterTeachers, SORTS, type SortKey } from '../../utils/filterTeachers';
import { formatINR } from '../../utils/formatters';

export default function Explore() {
  useDocumentTitle('Explore teachers');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [filters, setFilters] = useState<Filters>({
    ...defaultFilters,
    category: params.get('category') ?? '',
    subject: params.get('subject') ?? '',
  });
  const [sort, setSort] = useState<SortKey>((params.get('sort') as SortKey) || 'recommended');
  const [drawer, setDrawer] = useState(false);
  const [liveQ, setLiveQ] = useState(q);

  const { data: teachers, loading, error, reload } = useAsync(() => teacherService.getPublicTeachers(), []);
  const { data: categories } = useCategories();

  useEffect(() => { setLiveQ(q); }, [q]);
  useEffect(() => {
    setFilters((f) => ({ ...f, category: params.get('category') ?? f.category, subject: params.get('subject') ?? f.subject }));
  }, [params]);

  const results = useMemo(
    () => (teachers && categories ? filterTeachers(teachers, liveQ, filters, sort, categories) : null),
    [teachers, categories, liveQ, filters, sort],
  );

  const subjects = useMemo(() => Array.from(new Set((teachers ?? []).map((t) => t.subject))).sort(), [teachers]);
  const count = activeFilterCount(filters);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const changeFilters = (f: Filters) => {
    setFilters(f);
    const next = new URLSearchParams(params);
    f.category ? next.set('category', f.category) : next.delete('category');
    f.subject ? next.set('subject', f.subject) : next.delete('subject');
    setParams(next, { replace: true });
  };
  const clearAll = () => {
    setFilters(defaultFilters);
    setLiveQ('');
    setParams(new URLSearchParams(), { replace: true });
  };

  const catName = (id: string) => categories?.find((c) => c.id === id)?.shortName ?? id;
  const chips: { label: string; clear: () => void }[] = [
    ...(liveQ ? [{ label: `“${liveQ}”`, clear: () => { setLiveQ(''); updateParam('q', ''); } }] : []),
    ...(filters.category ? [{ label: catName(filters.category), clear: () => changeFilters({ ...filters, category: '' }) }] : []),
    ...(filters.subject ? [{ label: filters.subject, clear: () => changeFilters({ ...filters, subject: '' }) }] : []),
    ...(filters.maxPrice < PRICE_CAP ? [{ label: `Up to ${formatINR(filters.maxPrice)}`, clear: () => setFilters({ ...filters, maxPrice: PRICE_CAP }) }] : []),
    ...(filters.minRating ? [{ label: `${filters.minRating}+ ★`, clear: () => setFilters({ ...filters, minRating: 0 }) }] : []),
    ...(filters.gender ? [{ label: filters.gender, clear: () => setFilters({ ...filters, gender: '' }) }] : []),
    ...(filters.minExp ? [{ label: `${filters.minExp}+ yrs`, clear: () => setFilters({ ...filters, minExp: 0 }) }] : []),
    ...(filters.day ? [{ label: filters.day, clear: () => setFilters({ ...filters, day: '' }) }] : []),
    ...(filters.verifiedOnly ? [{ label: 'Verified only', clear: () => setFilters({ ...filters, verifiedOnly: false }) }] : []),
  ];

  const panel = <FilterPanel filters={filters} onChange={changeFilters} subjects={subjects} categories={categories ?? []} />;

  return (
    <div className="page-fade">
      <section className="explore-head">
        <div className="container-qh">
          <h1 className="h-page-lg">Find someone who can teach you.</h1>
          <SearchBar value={liveQ} onChange={setLiveQ} onSubmit={(v) => { setLiveQ(v); updateParam('q', v); }} placeholder="What do you want to learn?" buttonLabel="Search" />
        </div>
      </section>

      <div className="container-qh explore-layout">
        <aside className="explore-filters" aria-label="Filters">
          <div className="filters-title">
            <strong>Filters</strong>
            {count > 0 && <button className="link-btn" onClick={clearAll}>Clear all</button>}
          </div>
          {panel}
        </aside>

        <section className="explore-results" aria-live="polite">
          <div className="results-bar">
            <p className="results-count">
              {results ? <><strong>{results.length}</strong> {results.length === 1 ? 'teacher' : 'teachers'} found</> : 'Loading teachers…'}
            </p>
            <div className="results-actions">
              <button className="btn btn-secondary btn-sm filter-toggle" onClick={() => setDrawer(true)}>
                <SlidersHorizontal size={16} /> Filters{count ? ` (${count})` : ''}
              </button>
              <label className="sort-select">
                <span className="text-muted-qh small">Sort by</span>
                <select className="input input-sm" value={sort} onChange={(e) => { setSort(e.target.value as SortKey); updateParam('sort', e.target.value === 'recommended' ? '' : e.target.value); }}>
                  {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="active-chips">
              {chips.map((c) => (
                <button key={c.label} className="chip is-on chip-removable" onClick={c.clear} aria-label={`Remove filter ${c.label}`}>
                  {c.label} <X size={13} />
                </button>
              ))}
              <button className="link-btn" onClick={clearAll}>Clear all</button>
            </div>
          )}

          {error ? (
            <ErrorState text={error} onRetry={reload} />
          ) : results && results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="We couldn't find anyone matching that."
              text="Try a broader search or remove a filter or two."
              action={<button className="btn btn-primary" onClick={clearAll}>Clear filters</button>}
            />
          ) : (
            <TeacherGrid teachers={results} loading={loading || !results} cols={3} skeletonCount={6} />
          )}
        </section>
      </div>

      <FilterDrawer open={drawer} onClose={() => setDrawer(false)} onClear={clearAll} resultCount={results?.length ?? 0}>
        {panel}
      </FilterDrawer>
    </div>
  );
}
