import { useState, type FormEvent } from 'react';
import Rating from '../common/Rating';

interface Props { onSubmit: (rating: number, comment: string) => Promise<void>; teacherName?: string; compact?: boolean }

export default function ReviewForm({ onSubmit, teacherName, compact }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rating) return setError('Choose a star rating.');
    if (comment.trim().length < 10) return setError('Write at least a sentence about your class (10+ characters).');
    setError('');
    setBusy(true);
    try {
      await onSubmit(rating, comment.trim());
      setRating(0);
      setComment('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={`review-form ${compact ? 'is-compact' : ''}`} onSubmit={submit}>
      <p className="rf-q">How was your experience{teacherName ? ` with ${teacherName}` : ''}?</p>
      <Rating value={rating} onChange={setRating} size={28} />
      <label className="visually-hidden" htmlFor="review-text">Your review</label>
      <textarea id="review-text" className="input" rows={compact ? 3 : 4} placeholder="Write a review… What did you learn? How was the teaching style?" value={comment} onChange={(e) => setComment(e.target.value)} />
      {error && <p className="field-error">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit review'}</button>
    </form>
  );
}
