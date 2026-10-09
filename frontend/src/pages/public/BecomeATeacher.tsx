import { Link } from 'react-router-dom';
import { BadgeIndianRupee, CalendarRange, Check, Globe2, LineChart, Star } from 'lucide-react';
import SmartImage from '../../components/common/SmartImage';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAsync } from '../../hooks/useAsync';
import { teacherService } from '../../api/teacherService';
import { formatINR } from '../../utils/formatters';

const benefits = [
  { icon: BadgeIndianRupee, title: 'Set your own price', text: 'Charge what your time is worth. Change it whenever you like.' },
  { icon: CalendarRange, title: 'Choose your availability', text: 'Open the hours that suit you. Learners only book those slots.' },
  { icon: Globe2, title: 'Teach students globally', text: 'Teach online from anywhere, or in person in your city.' },
  { icon: Star, title: 'Build your reputation', text: 'Verified badge, reviews and ratings that follow you.' },
  { icon: LineChart, title: 'Track your earnings', text: 'See every booking, payment and payout in one dashboard.' },
];

const process = [
  { title: 'Apply', text: 'Tell us what you teach, your experience and your price. Takes about 5 minutes.' },
  { title: 'Get verified', text: 'Upload a certificate or proof. Our team reviews it within 48 hours.' },
  { title: 'Start teaching', text: 'Your profile goes live and learners can book your open slots.' },
];

export default function BecomeATeacher() {
  useDocumentTitle('Become a teacher');
  const { data: g } = useAsync(() => teacherService.getTeacherById('t2'), []);

  return (
    <div className="page-fade">
      <section className="hero hero-teach">
        <div className="container-qh hero-grid">
          <div className="hero-copy">
            <h1 className="h-hero">Turn what you know into something valuable.</h1>
            <p className="hero-sub">Teach what you're good at. Build your reputation. Earn on your schedule.</p>
            <ul className="benefit-ticks">
              {benefits.map((b) => <li key={b.title}><Check size={16} /> {b.title}</li>)}
            </ul>
            <div className="d-flex gap-2 flex-wrap">
              <Link to="/register/teacher" className="btn btn-primary btn-lg">Become a teacher</Link>
              <a href="#teach-how" className="btn btn-secondary btn-lg">How it works</a>
            </div>
          </div>
          {g && (
            <div className="earn-card">
              <div className="earn-head">
                <SmartImage src={g.image} fallback={g.imageFallback} name={g.name} alt="" />
                <div>
                  <strong>{g.name}</strong>
                  <span className="text-muted-qh small">{g.subject} · teaching since {new Date(g.joinedAt).getFullYear()}</span>
                </div>
              </div>
              <div className="earn-figure">
                <span className="text-muted-qh small">Earned on QuestHive this year</span>
                <strong>{formatINR(42500)}</strong>
              </div>
              <div className="earn-stats">
                <div><strong>{g.studentCount}</strong><span>students</span></div>
                <div><strong>{g.rating.toFixed(1)}★</strong><span>rating</span></div>
                <div><strong>{formatINR(g.price)}</strong><span>per class</span></div>
              </div>
              <p className="earn-quote">“I set my hours around my gigs. QuestHive fills them.”</p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container-qh">
          <h2 className="h-section-lg">Why teach on QuestHive</h2>
          <div className="benefit-grid">
            {benefits.map((b) => (
              <div key={b.title} className="benefit-card">
                <b.icon size={22} className="text-accent" />
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="teach-how">
        <div className="container-qh">
          <h2 className="h-section-lg">Three steps to your first student</h2>
          <ol className="steps-grid cols-3">
            {process.map((p, i) => (
              <li key={p.title} className="step-card">
                <span className="step-num">{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
          <div className="text-center mt-5">
            <Link to="/register/teacher" className="btn btn-primary btn-lg">Start your application</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
