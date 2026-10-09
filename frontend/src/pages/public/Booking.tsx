import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import BookingStepper from '../../components/booking/BookingStepper';
import AvailabilityPicker from '../../components/booking/AvailabilityPicker';
import BookingSummary from '../../components/booking/BookingSummary';
import ErrorState from '../../components/common/ErrorState';
import SmartImage from '../../components/common/SmartImage';
import { SkeletonLine } from '../../components/common/Skeleton';
import { teacherService } from '../../api/teacherService';
import { bookingService } from '../../api/bookingService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { addDays, dayOfISO, formatDate, formatINR, parseISODate, toISODate } from '../../utils/formatters';

export default function Booking() {
  const { teacherId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { draft, setDraft } = useBooking();
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  const { data: teacher, error: loadError, reload } = useAsync(() => teacherService.getTeacherById(teacherId), [teacherId]);
  const { data: firstClass } = useAsync(() => bookingService.isFirstClass(user!.id, teacherId), [teacherId, user?.id]);
  useDocumentTitle(teacher ? `Book ${teacher.name}` : 'Book a class');

  const dates = useMemo(() => {
    if (!teacher) return [];
    const today = new Date();
    return Array.from({ length: 21 }, (_, i) => {
      const iso = toISODate(addDays(today, i));
      return { iso, enabled: teacher.availability.some((a) => a.day === dayOfISO(iso)) };
    });
  }, [teacher]);

  // Preselect: resume a draft for this teacher, or use ?day= & ?time= from the profile page
  useEffect(() => {
    if (!teacher || date) return;
    if (draft && draft.teacherId === teacher.id && dates.some((d) => d.iso === draft.date)) {
      setDate(draft.date);
      setTime(draft.time);
      return;
    }
    const wanted = params.get('day');
    const match = dates.find((d) => d.enabled && (!wanted || dayOfISO(d.iso) === wanted)) ?? dates.find((d) => d.enabled);
    if (match) {
      setDate(match.iso);
      setTime(params.get('time') ?? '');
    }
  }, [teacher, dates]);

  const { data: slots, loading: slotsLoading } = useAsync(
    () => (date ? teacherService.getSlotsForDate(teacherId, date) : Promise.resolve([])),
    [teacherId, date],
  );

  // Drop a preselected time if it's not actually free
  useEffect(() => {
    if (slots && time && !slots.some((s) => s.time === time && s.available)) setTime('');
  }, [slots]);

  if (loadError) return <div className="container-qh section"><ErrorState title="We couldn't load this teacher." text={loadError} onRetry={reload} /></div>;
  if (!teacher) return <div className="container-qh section"><SkeletonLine h={40} w="50%" /><div className="mt-4"><SkeletonLine h={260} r={14} /></div></div>;

  const isFree = Boolean(teacher.firstClassFree && firstClass);
  const amount = isFree ? 0 : teacher.price;

  const goReview = () => {
    if (!date || !time) return setError('Please select a date and a time slot.');
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goPay = () => {
    setDraft({
      teacherId: teacher.id, teacherName: teacher.name, teacherImage: teacher.image, subject: teacher.subject,
      date, time, durationMins: teacher.classDurationMins, price: teacher.price, amount, isFree,
    });
    navigate('/payment');
  };

  return (
    <div className="page-fade booking-page">
      <div className="container-qh narrow">
        <Link to={`/t/${teacher.id}`} className="back-link"><ChevronLeft size={16} /> Back to {teacher.name}'s profile</Link>
        <BookingStepper step={step} />

        {step === 1 ? (
          <div className="booking-grid">
            <div className="panel">
              <h1 className="h-page">Choose a date and time</h1>
              <p className="text-muted-qh">All times are in IST. Classes are {teacher.classDurationMins} minutes.</p>

              <h2 className="label mt-4">1. Date</h2>
              <div className="date-strip" role="listbox" aria-label="Available dates">
                {dates.map((d) => {
                  const dt = parseISODate(d.iso);
                  return (
                    <button
                      key={d.iso}
                      role="option"
                      aria-selected={date === d.iso}
                      disabled={!d.enabled}
                      className={`date-chip ${date === d.iso ? 'is-selected' : ''}`}
                      onClick={() => { setDate(d.iso); setTime(''); setError(''); }}
                    >
                      <span>{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                      <strong>{dt.getDate()}</strong>
                      <span>{dt.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </button>
                  );
                })}
              </div>

              <h2 className="label mt-4">2. Time {date && <span className="text-muted-qh">· {dayOfISO(date)}, {formatDate(date, { day: 'numeric', month: 'long' })}</span>}</h2>
              {slotsLoading ? (
                <div className="d-flex gap-2 flex-wrap">{[1, 2, 3, 4].map((i) => <SkeletonLine key={i} w={96} h={42} r={10} />)}</div>
              ) : (
                <AvailabilityPicker
                  groups={date ? [{ label: dayOfISO(date), slots: slots ?? [] }] : []}
                  selected={time ? { group: dayOfISO(date), time } : null}
                  onSelect={(_, t) => { setTime(t); setError(''); }}
                  emptyText="Pick a highlighted date to see times."
                />
              )}
              <p className="slot-legend"><span className="lg lg-free" /> Available <span className="lg lg-sel" /> Selected <span className="lg lg-off" /> Booked or passed</p>
              {error && <p className="field-error" role="alert">{error}</p>}
            </div>

            <aside className="booking-aside">
              <div className="panel">
                <div className="mini-teacher">
                  <SmartImage src={teacher.image} fallback={teacher.imageFallback} name={teacher.name} alt="" />
                  <div>
                    <strong>{teacher.name}</strong>
                    <span className="text-muted-qh small">{teacher.subject}</span>
                  </div>
                </div>
                <div className="bs-line"><span>Class fee</span><span>{formatINR(teacher.price)}</span></div>
                {isFree && <div className="bs-line is-discount"><span>First class free</span><span>−{formatINR(teacher.price)}</span></div>}
                <div className="bs-line is-total"><span>Total</span><span>{formatINR(amount)}</span></div>
                <button className="btn btn-primary btn-block mt-3" onClick={goReview} disabled={!time}>Continue</button>
                {!time && <p className="text-muted-qh small text-center mt-2 mb-0">Select a time to continue</p>}
              </div>
            </aside>
          </div>
        ) : (
          <div className="booking-grid">
            <div className="panel">
              <h1 className="h-page">Review your booking</h1>
              <p className="text-muted-qh">Check the details before you pay.</p>
              <BookingSummary
                teacherName={teacher.name} teacherImage={teacher.image} teacherFallback={teacher.imageFallback} subject={teacher.subject}
                date={date} time={time} durationMins={teacher.classDurationMins} price={teacher.price} amount={amount} isFree={isFree}
              />
              <div className="notice notice-info mt-3"><Info size={16} /> Free cancellation up to 12 hours before the class.</div>
              <div className="d-flex gap-2 mt-4 flex-wrap">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>Change time</button>
                <button className="btn btn-primary" onClick={goPay}>{isFree ? 'Continue to confirm' : `Continue to payment`}</button>
              </div>
            </div>
            <aside className="booking-aside">
              <div className="panel">
                <h3 className="h-section">What happens next</h3>
                <ol className="next-list">
                  <li>Pay securely{isFree ? ' (₹0 for your first class)' : ''}.</li>
                  <li>{teacher.name} gets notified and shares a class link.</li>
                  <li>Join at the scheduled time and start learning.</li>
                </ol>
              </div>
            </aside>
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="mobile-book-bar">
          <div>
            <strong>{formatINR(amount)}</strong>
            <div className="text-muted-qh small">{time ? `${dayOfISO(date).slice(0, 3)} · selected` : 'Select a time'}</div>
          </div>
          <button className="btn btn-primary" onClick={goReview} disabled={!time}>Continue</button>
        </div>
      )}
    </div>
  );
}
