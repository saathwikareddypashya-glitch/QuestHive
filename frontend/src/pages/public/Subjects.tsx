import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useAsync } from '../../hooks/useAsync';
import { teacherService } from '../../api/teacherService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { slugify } from '../../utils/formatters';
import { teachesSubject } from '../../utils/filterTeachers';
import { SkeletonLine } from '../../components/common/Skeleton';

export default function Subjects() {
  useDocumentTitle('All subjects');
  const { data: categories } = useCategories();
  const { data: teachers } = useAsync(() => teacherService.getPublicTeachers(), []);
  const [q, setQ] = useState('');

  const countFor = (s: string) => teachers?.filter((t) => teachesSubject(t, s)).length ?? 0;
  const filtered = useMemo(
    () => (categories ?? []).map((c) => ({ ...c, subjects: c.subjects.filter((s) => s.toLowerCase().includes(q.toLowerCase())) })).filter((c) => c.subjects.length),
    [categories, q],
  );

  return (
    <div className="page-fade container-qh section-tight">
      <div className="subjects-head">
        <div>
          <h1 className="h-page-lg">All subjects</h1>
          <p className="text-muted-qh">Pick a subject to see the teachers who teach it.</p>
        </div>
        <label className="input-icon subjects-search">
          <Search size={16} aria-hidden />
          <input className="input" placeholder="Filter subjects" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter subjects" />
        </label>
      </div>

      {!categories ? (
        <div className="d-flex flex-column gap-4 mt-4">{[1, 2, 3].map((i) => <SkeletonLine key={i} h={120} r={14} />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-qh mt-4">No subjects match “{q}”.</p>
      ) : (
        <div className="subject-sections">
          {filtered.map((c) => (
            <section key={c.id} className="subject-section">
              <div className="subject-section-head">
                <span className="cat-emoji" aria-hidden>{c.emoji}</span>
                <div>
                  <h2 className="h-section">{c.name}</h2>
                  <p className="text-muted-qh small mb-0">{c.description}</p>
                </div>
                <Link to={`/explore?category=${c.id}`} className="btn btn-ghost btn-sm ms-auto">See teachers</Link>
              </div>
              <div className="subject-pills">
                {c.subjects.map((s) => {
                  const n = countFor(s);
                  return (
                    <Link key={s} to={`/subjects/${slugify(s)}`} className="subject-pill">
                      {s}{n > 0 && <span className="subject-count">{n}</span>}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
