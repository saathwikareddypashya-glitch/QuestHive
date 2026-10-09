import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, CalendarCheck, Search, Sparkles, Users } from 'lucide-react';
import SearchBar from '../../components/search/SearchBar';
import CategoryCard from '../../components/teacher/CategoryCard';
import TeacherGrid from '../../components/teacher/TeacherGrid';
import SmartImage from '../../components/common/SmartImage';
import Rating from '../../components/common/Rating';
import ErrorState from '../../components/common/ErrorState';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useCategories } from '../../hooks/useCategories';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { POPULAR_SEARCHES } from '../../data/subjects';
import { formatINR } from '../../utils/formatters';

const steps = [
  { icon: Search, title: 'Search', text: 'Tell us what you want to learn. We show teachers who teach exactly that.' },
  { icon: Users, title: 'Compare', text: 'Look at photos, reviews, prices and real availability side by side.' },
  { icon: CalendarCheck, title: 'Book', text: 'Pick a time that suits you. Your first class with most teachers is free.' },
  { icon: Sparkles, title: 'Learn', text: 'Meet one-to-one, then leave a review to help the next learner choose.' },
];

export default function Home() {
  useDocumentTitle('');
  const navigate = useNavigate();
  const { data: teachers, loading, error, reload } = useAsync(() => teacherService.getPublicTeachers(), []);
  const { data: categories } = useCategories();

  const popular = teachers
    ? [...teachers].filter((t) => t.verified).sort((a, b) => b.rating * Math.log10(b.reviewCount + 10) - a.rating * Math.log10(a.reviewCount + 10)).slice(0, 8)
    : null;
  const heroTeachers = teachers ? ['t2', 't4', 't7', 't5'].map((id) => teachers.find((t) => t.id === id)).filter(Boolean) : [];
  const search = (q: string) => navigate(q ? `/explore?q=${encodeURIComponent(q)}` : '/explore');

  return (
    <div className="page-fade">
      <section className="hero">
        <div className="container-qh hero-grid">
          <div className="hero-copy">
            <h1 className="h-hero">Find your next skill.</h1>
            <p className="hero-sub">Learn from verified people who know it — one-to-one, online or near you.</p>
            <SearchBar value="" onSubmit={search} size="lg" />
            <div className="popular-row">
              <span className="text-muted-qh">Popular:</span>
              {POPULAR_SEARCHES.map((p) => (
                <Link key={p} to={`/explore?q=${encodeURIComponent(p)}`} className="chip chip-link">{p}</Link>
              ))}
            </div>
            <div className="hero-trust">
              <span><BadgeCheck size={16} /> Every teacher is ID and qualification checked</span>
              <span><Sparkles size={16} /> First class free with most teachers</span>
            </div>
          </div>

          <div className="hero-mosaic" aria-label="Featured teachers">
            {heroTeachers.length === 0
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className={`mosaic-tile skeleton m-${i}`} />)
              : heroTeachers.map((t, i) => t && (
                <Link key={t.id} to={`/t/${t.id}`} className={`mosaic-tile m-${i}`}>
                  <SmartImage src={t.image} fallback={t.imageFallback} name={t.name} alt={`${t.name}, ${t.subject} teacher`} loading="eager" />
                  <span className="mosaic-label">
                    <strong>{t.name}</strong>
                    <span>{t.subject} · {formatINR(t.price)}/hr</span>
                    <Rating value={t.rating} size={12} />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-qh">
          <div className="section-head">
            <div>
              <h2 className="h-section-lg">Browse by category</h2>
              <p className="text-muted-qh">Six areas, more than eighty skills.</p>
            </div>
            <Link to="/subjects" className="btn btn-ghost">All subjects</Link>
          </div>
          <div className="category-grid">
            {(categories ?? []).map((c) => (
              <CategoryCard key={c.id} category={c} count={teachers?.filter((t) => t.category === c.id).length} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container-qh">
          <div className="section-head">
            <div>
              <h2 className="h-section-lg">Learn from people who know it.</h2>
              <p className="text-muted-qh">Explore highly rated teachers across popular skills.</p>
            </div>
            <Link to="/explore" className="btn btn-secondary">See all teachers</Link>
          </div>
          {error ? <ErrorState text={error} onRetry={reload} /> : <TeacherGrid teachers={popular} loading={loading} />}
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container-qh">
          <div className="section-head">
            <div>
              <h2 className="h-section-lg">How QuestHive works</h2>
              <p className="text-muted-qh">From “I want to learn this” to your first class in a few minutes.</p>
            </div>
          </div>
          <ol className="steps-grid">
            {steps.map((s, i) => (
              <li key={s.title} className="step-card">
                <span className="step-num">{i + 1}</span>
                <s.icon size={22} className="step-icon" aria-hidden />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container-qh">
          <div className="teach-band">
            <div>
              <h2 className="h-section-lg">Know something well? Teach it.</h2>
              <p>Set your own price and hours. We bring the learners and handle bookings and payments.</p>
            </div>
            <div className="teach-band-actions">
              <Link to="/become-a-teacher" className="btn btn-primary btn-lg">Become a teacher</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
