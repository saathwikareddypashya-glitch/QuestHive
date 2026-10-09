import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Check, CalendarPlus } from 'lucide-react';
import BookingStepper from '../../components/booking/BookingStepper';
import BookingSummary from '../../components/booking/BookingSummary';
import ErrorState from '../../components/common/ErrorState';
import { SkeletonLine } from '../../components/common/Skeleton';
import { bookingService } from '../../api/bookingService';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function BookingConfirmed() {
  useDocumentTitle('Booking confirmed');
  const [params] = useSearchParams();
  const id = params.get('id');
  const { data, error } = useAsync(async () => {
    if (!id) return null;
    const booking = await bookingService.getBookingById(id);
    const teacher = await teacherService.getTeacherById(booking.teacherId);
    return { booking, teacher };
  }, [id]);

  if (!id) return <Navigate to="/learner/bookings" replace />;

  return (
    <div className="page-fade booking-page">
      <div className="container-qh narrow">
        <BookingStepper step={4} />
        {error ? (
          <ErrorState text={error} />
        ) : !data ? (
          <div className="panel confirm-panel"><SkeletonLine h={80} w={80} r={40} /><SkeletonLine w="60%" h={28} /><SkeletonLine h={160} r={12} /></div>
        ) : (
          <div className="panel confirm-panel">
            <div className="confirm-check" aria-hidden><Check size={36} strokeWidth={2.5} /></div>
            <h1 className="h-page">{data.booking.isFree ? 'Free class booked' : 'Payment successful'}</h1>
            <p className="text-muted-qh">Your class has been booked. {data.teacher.name} has been notified and will share the class link before you start.</p>
            <div className="confirm-summary">
              <BookingSummary
                teacherName={data.teacher.name} teacherImage={data.teacher.image} teacherFallback={data.teacher.imageFallback} subject={data.booking.subject}
                date={data.booking.date} time={data.booking.time} durationMins={data.booking.durationMins}
                price={data.teacher.price} amount={data.booking.amount} isFree={data.booking.isFree}
              />
              <p className="text-muted-qh small mt-2 mb-0">Booking ID {data.booking.id} · Paid via {data.booking.paymentMethod}</p>
            </div>
            <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
              <Link to="/learner/bookings?tab=upcoming" className="btn btn-primary">View booking</Link>
              <Link to="/learner/dashboard" className="btn btn-secondary">Go to dashboard</Link>
              <Link to="/explore" className="btn btn-ghost"><CalendarPlus size={16} /> Book another class</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
