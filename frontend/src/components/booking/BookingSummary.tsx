import { CalendarDays, Clock, Video } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import { dayOfISO, formatDate, formatINR, timeRange } from '../../utils/formatters';

interface Props {
  teacherName: string;
  teacherImage?: string;
  teacherFallback?: string;
  subject: string;
  date: string;
  time: string;
  durationMins: number;
  price: number;
  amount: number;
  isFree: boolean;
  compact?: boolean;
}

export default function BookingSummary(p: Props) {
  return (
    <div className={`booking-summary ${p.compact ? 'is-compact' : ''}`}>
      <div className="bs-head">
        <SmartImage className="bs-photo" src={p.teacherImage} fallback={p.teacherFallback} name={p.teacherName} alt="" />
        <div>
          <strong className="bs-title">{p.subject} with {p.teacherName}</strong>
          <span className="text-muted-qh small">One-to-one class · {p.durationMins} min</span>
        </div>
      </div>
      <ul className="bs-rows">
        <li><CalendarDays size={16} /> <span>{dayOfISO(p.date)}, {formatDate(p.date, { day: 'numeric', month: 'long' })}</span></li>
        <li><Clock size={16} /> <span>{timeRange(p.time, p.durationMins)}</span></li>
        <li><Video size={16} /> <span>Online · link shared after booking</span></li>
      </ul>
      <div className="bs-price">
        <div className="bs-line"><span>Class fee</span><span>{formatINR(p.price)}</span></div>
        {p.isFree && <div className="bs-line is-discount"><span>First class free</span><span>−{formatINR(p.price)}</span></div>}
        <div className="bs-line is-total"><span>Total</span><span>{formatINR(p.amount)}</span></div>
      </div>
    </div>
  );
}
