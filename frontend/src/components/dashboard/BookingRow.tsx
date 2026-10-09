import type { ReactNode } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import type { Booking } from '../../types';
import SmartImage from '../common/SmartImage';
import StatusPill from '../common/StatusPill';
import { dayOfISO, formatDate, formatINR, timeRange } from '../../utils/formatters';

interface Props { booking: Booking; image?: string; fallback?: string; title: string; actions?: ReactNode }

export default function BookingRow({ booking: b, image, fallback, title, actions }: Props) {
  return (
    <div className="booking-row">
      <SmartImage className="br-photo" src={image} fallback={fallback} name={title} alt="" />
      <div className="br-main">
        <strong>{b.subject} with {title}</strong>
        <div className="br-meta">
          <span><CalendarDays size={14} /> {dayOfISO(b.date)}, {formatDate(b.date, { day: 'numeric', month: 'short' })}</span>
          <span><Clock size={14} /> {timeRange(b.time, b.durationMins)}</span>
        </div>
      </div>
      <div className="br-side">
        <span className="br-amount">{b.isFree ? 'Free' : formatINR(b.amount)}</span>
        <StatusPill status={b.status} />
      </div>
      {actions && <div className="br-actions">{actions}</div>}
    </div>
  );
}
