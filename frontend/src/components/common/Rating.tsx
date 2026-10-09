import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  onChange?: (v: number) => void;
  stars?: boolean;
}

export default function Rating({ value, count, size = 15, showValue = true, onChange, stars = false }: Props) {
  const [hover, setHover] = useState(0);

  if (onChange) {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
    const shown = hover || value;
    return (
      <div className="rating-input" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            className={`star-btn ${i <= shown ? 'is-on' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
          >
            <Star size={size} fill={i <= shown ? 'currentColor' : 'none'} />
          </button>
        ))}
        <span className="rating-label">{labels[shown]}</span>
      </div>
    );
  }

  if (stars) {
    return (
      <span className="rating-stars" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={size} fill={i <= Math.round(value) ? 'currentColor' : 'none'} className={i <= Math.round(value) ? 'is-on' : 'is-off'} />
        ))}
      </span>
    );
  }

  if (!value) return <span className="rating rating-new">New teacher</span>;
  return (
    <span className="rating" aria-label={`Rated ${value.toFixed(1)} from ${count ?? 0} reviews`}>
      <Star size={size} fill="currentColor" className="rating-star" aria-hidden />
      {showValue && <strong>{value.toFixed(1)}</strong>}
      {count !== undefined && <span className="rating-count">({count} reviews)</span>}
    </span>
  );
}
