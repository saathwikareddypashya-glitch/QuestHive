import type { Review } from '../../types';
import Rating from '../common/Rating';
import { formatDateYear, initials } from '../../utils/formatters';

export default function ReviewCard({ review, teacherName }: { review: Review; teacherName?: string }) {
  return (
    <figure className="review-card">
      <div className="review-top">
        <Rating value={review.rating} stars size={15} />
        <time className="text-muted-qh small" dateTime={review.date}>{formatDateYear(review.date)}</time>
      </div>
      <blockquote>"{review.comment}"</blockquote>
      <figcaption>
        <span className="review-initials" aria-hidden>{initials(review.learnerName)}</span>
        <span>— {review.learnerName}{teacherName ? <span className="text-muted-qh"> on {teacherName}</span> : null}</span>
      </figcaption>
    </figure>
  );
}
