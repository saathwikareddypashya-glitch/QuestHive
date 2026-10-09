import { Link, useNavigate, useParams } from 'react-router-dom';
import { Award, BookOpen, Briefcase, CalendarDays, ChevronLeft, Clock, Globe, GraduationCap, Languages, MapPin, MessageSquareText, Users, AlertTriangle } from 'lucide-react';
import SmartImage from '../../components/common/SmartImage';
import Rating from '../../components/common/Rating';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import ReviewCard from '../../components/teacher/ReviewCard';
import AvailabilityPicker from '../../components/booking/AvailabilityPicker';
import { HeartButton } from '../../components/teacher/TeacherCard';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonProfile } from '../../components/common/Skeleton';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFavorites } from '../../context/FavoritesContext';
import { formatINR, formatTimeShort, fromMinutes, toMinutes } from '../../utils/formatters';
import { generateSlots, teachingDays } from '../../utils/slots';

export default function TeacherProfile() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: teacher, error, loading, reload } = useAsync(() => teacherService.getTeacherById(id), [id]);
  const { data: reviews } = useAsync(() => teacherService.getReviews(id), [id]);
  useDocumentTitle(teacher ? `${teacher.name} — ${teacher.subject} teacher` : 'Teacher');

  if (loading) return <SkeletonProfile />;
  if (error || !teacher) {
    return (
      <div className="container-qh section">
        <ErrorState title="We couldn't load this teacher." text={error ?? 'Please try again.'} onRetry={reload} />
      </div>
    );
  }

  const isPublic = teacher.status === 'verified' || teacher.status === 'unverified';
  const fav = isFavorite(teacher.id);
  const days = teachingDays(teacher.availability);
  const groups = days.map((d) => ({
    label: d,
    sublabel: teacher.availability.filter((a) => a.day === d).map((a) => `${formatTimeShort(a.start)} – ${formatTimeShort(a.end)}`).join(', '),
    slots: generateSlots(teacher.availability, d, teacher.classDurationMins).map((time) => ({ time, available: true })),
  }));
  const book = (day?: string, time?: string) =>
    navigate(`/booking/${teacher.id}${day ? `?day=${day}${time ? `&time=${time}` : ''}` : ''}`);
  const distribution = [5, 4, 3, 2, 1].map((r) => ({ r, n: reviews?.filter((x) => x.rating === r).length ?? 0 }));
  const maxN = Math.max(1, ...distribution.map((d) => d.n));

  return (
    <div className="page-fade profile-page">
      <div className="container-qh">
        <button className="back-link" onClick={() => navigate(-1)}><ChevronLeft size={16} /> Back</button>

        {!isPublic && (
          <div className="notice notice-warning"><AlertTriangle size={16} /> This profile is {teacher.status === 'pending' ? 'awaiting verification' : 'not public'} and is only visible to admins.</div>
        )}

        <div className="profile-hero">
          <div className="profile-photo-wrap">
            <SmartImage className="profile-photo" src={teacher.image} fallback={teacher.imageFallback} name={teacher.name} alt={`${teacher.name}, ${teacher.subject} teacher`} loading="eager" />
            <HeartButton teacher={teacher} />
          </div>

          <div className="profile-info">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {teacher.verified ? <VerifiedBadge label="Verified teacher" size="md" /> : <span className="pill pill-neutral">New on QuestHive</span>}
              <span className="pill pill-accent">{teacher.subject}</span>
            </div>
            <h1 className="profile-name">{teacher.name}</h1>
            <p className="profile-loc"><MapPin size={15} /> {teacher.location}{teacher.online ? ' · Online classes' : ' · In-person classes'}</p>
            <div className="profile-rating">
              <Rating value={teacher.rating} size={18} />
              <span className="text-muted-qh">{teacher.reviewCount} reviews</span>
            </div>
            <p className="profile-desc">{teacher.description}</p>

            <div className="profile-stats">
              <div><strong>{teacher.studentCount}</strong><span>Students</span></div>
              <div><strong>{teacher.completedClasses.toLocaleString('en-IN')}</strong><span>Classes taught</span></div>
              <div><strong>{teacher.experienceYears} yrs</strong><span>Experience</span></div>
            </div>

            <div className="book-card">
              <div className="book-price">
                <span className="price-lg">{formatINR(teacher.price)}</span>
                <span className="text-muted-qh"> / class · {teacher.classDurationMins} min</span>
              </div>
              {teacher.firstClassFree && <span className="tc-free">Your first class is free</span>}
              <div className="book-actions">
                <button className="btn btn-primary btn-lg" onClick={() => book()} disabled={!isPublic}>Book a class</button>
                <button className={`btn btn-secondary btn-lg ${fav ? 'is-saved' : ''}`} onClick={() => toggleFavorite(teacher.id, teacher.name)} aria-pressed={fav}>
                  {fav ? '♥ Saved' : '♡ Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-body">
          <div className="profile-main">
            <section className="profile-section">
              <h2 className="h-section"><BookOpen size={18} /> About {teacher.name}</h2>
              <p>{teacher.bio}</p>
            </section>

            <section className="profile-section two-col">
              <div>
                <h2 className="h-section"><Briefcase size={18} /> Experience</h2>
                <p>{teacher.experienceYears} years teaching {teacher.subject.toLowerCase()}, {teacher.completedClasses.toLocaleString('en-IN')} classes completed on QuestHive.</p>
              </div>
              <div>
                <h2 className="h-section"><GraduationCap size={18} /> Qualifications</h2>
                <ul className="tick-list">
                  {teacher.qualifications.map((q) => <li key={q}><Award size={15} /> {q}</li>)}
                </ul>
              </div>
            </section>

            <section className="profile-section">
              <h2 className="h-section">Skills</h2>
              <div className="chip-row">{teacher.skills.map((s) => <span key={s} className="chip is-static">{s}</span>)}</div>
            </section>

            <section className="profile-section two-col">
              <div>
                <h2 className="h-section">Teaching style</h2>
                <p>{teacher.teachingStyle}</p>
              </div>
              <div>
                <h2 className="h-section"><Languages size={18} /> Languages</h2>
                <p>{teacher.languages.join(', ')}</p>
              </div>
            </section>

            <section className="profile-section" id="availability">
              <div className="d-flex justify-content-between align-items-end flex-wrap gap-2">
                <h2 className="h-section mb-0"><CalendarDays size={18} /> Available times</h2>
                <span className="text-muted-qh small"><Clock size={13} /> {teacher.classDurationMins}-minute classes · pick a time to book</span>
              </div>
              <div className="mt-3">
                <AvailabilityPicker groups={groups} onSelect={(day, time) => book(day, time)} emptyText="This teacher hasn't added availability yet." />
              </div>
            </section>

            <section className="profile-section" id="reviews">
              <h2 className="h-section"><MessageSquareText size={18} /> Reviews</h2>
              <div className="review-summary">
                <div className="rs-score">
                  <strong>{teacher.rating ? teacher.rating.toFixed(1) : '—'}</strong>
                  <Rating value={teacher.rating} stars size={16} />
                  <span className="text-muted-qh small">{teacher.reviewCount} reviews</span>
                </div>
                <div className="rs-bars">
                  {distribution.map((d) => (
                    <div key={d.r} className="rs-bar">
                      <span>{d.r}★</span>
                      <span className="bar"><span style={{ width: `${(d.n / maxN) * 100}%` }} /></span>
                      <span className="text-muted-qh">{d.n}</span>
                    </div>
                  ))}
                  <span className="text-muted-qh small">Breakdown of the latest {reviews?.length ?? 0} reviews</span>
                </div>
              </div>
              {reviews && reviews.length === 0 ? (
                <EmptyState icon={MessageSquareText} title="No reviews yet." text="Be the first to learn with this teacher." compact />
              ) : (
                <div className="review-list">{(reviews ?? []).slice(0, 6).map((r) => <ReviewCard key={r.id} review={r} />)}</div>
              )}
            </section>
          </div>

          <aside className="profile-aside">
            <div className="aside-card">
              <h3>Quick facts</h3>
              <ul className="facts">
                <li><Users size={16} /> {teacher.studentCount} students taught</li>
                <li><Clock size={16} /> {teacher.classDurationMins}-minute classes</li>
                <li><Globe size={16} /> {teacher.online ? 'Teaches online' : 'Teaches in person'}</li>
                <li><CalendarDays size={16} /> Teaches on {days.map((d) => d.slice(0, 3)).join(', ') || '—'}</li>
              </ul>
              <button className="btn btn-primary btn-block" onClick={() => book()} disabled={!isPublic}>Book a class</button>
              <Link to={`/explore?subject=${encodeURIComponent(teacher.subject)}`} className="btn btn-ghost btn-block">More {teacher.subject} teachers</Link>
            </div>
          </aside>
        </div>
      </div>

      <div className="mobile-book-bar">
        <div>
          <strong>{formatINR(teacher.price)}</strong><span className="text-muted-qh small"> / class</span>
          {teacher.firstClassFree && <div className="tc-free small">1st class free</div>}
        </div>
        <button className="btn btn-primary" onClick={() => book()} disabled={!isPublic}>Book a class</button>
      </div>
    </div>
  );
}
