import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import type { Teacher } from '../../types';
import SmartImage from '../common/SmartImage';
import Rating from '../common/Rating';
import VerifiedBadge from '../common/VerifiedBadge';
import { useFavorites } from '../../context/FavoritesContext';
import { formatINR } from '../../utils/formatters';

export function HeartButton({ teacher, floating = true }: { teacher: Teacher; floating?: boolean }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(teacher.id);
  return (
    <button
      type="button"
      className={`heart-btn ${floating ? 'is-floating' : ''} ${fav ? 'is-on' : ''}`}
      aria-pressed={fav}
      aria-label={fav ? `Remove ${teacher.name} from favorites` : `Save ${teacher.name} to favorites`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(teacher.id, teacher.name); }}
    >
      <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
    </button>
  );
}

export default function TeacherCard({ teacher, actions }: { teacher: Teacher; actions?: ReactNode }) {
  const navigate = useNavigate();
  const go = () => navigate(`/t/${teacher.id}`);
  return (
    <article className="teacher-card" onClick={go} onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && go()} tabIndex={0} aria-label={`${teacher.name}, ${teacher.subject} teacher`}>
      <div className="tc-photo">
        <SmartImage src={teacher.image} fallback={teacher.imageFallback} name={teacher.name} alt={`${teacher.name}, ${teacher.subject} teacher`} />
        <HeartButton teacher={teacher} />
        <span className="tc-subject">{teacher.subject}</span>
      </div>
      <div className="tc-body">
        <div className="tc-head">
          <h3 className="tc-name">{teacher.name}</h3>
          {teacher.verified && <VerifiedBadge />}
        </div>
        <p className="tc-loc"><MapPin size={13} aria-hidden /> {teacher.location}{teacher.online ? ' · Online' : ' · In person'}</p>
        <Rating value={teacher.rating} count={teacher.reviewCount} />
        <p className="tc-desc">{teacher.description}</p>
        <div className="tc-foot">
          <div>
            <span className="tc-price">{formatINR(teacher.price)}<small>/hr</small></span>
            {teacher.firstClassFree && <span className="tc-free">1st class free</span>}
          </div>
          {actions ?? <Link to={`/t/${teacher.id}`} className="btn btn-secondary btn-sm" onClick={(e) => e.stopPropagation()}>View profile</Link>}
        </div>
      </div>
    </article>
  );
}
