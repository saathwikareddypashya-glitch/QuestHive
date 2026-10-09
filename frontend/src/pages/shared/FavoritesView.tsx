import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import TeacherGrid from '../../components/teacher/TeacherGrid';
import EmptyState from '../../components/common/EmptyState';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoritesView({ cols = 4 }: { cols?: 3 | 4 }) {
  const { favorites, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const { data: teachers, loading } = useAsync(() => teacherService.getPublicTeachers(), []);
  const list = teachers ? teachers.filter((t) => favorites.includes(t.id)) : null;

  if (list && list.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Save teachers you love."
        text="You haven't saved any teachers yet. Tap the heart on any teacher to keep them here."
        action={<Link to="/explore" className="btn btn-primary">Explore teachers</Link>}
      />
    );
  }

  return (
    <TeacherGrid
      teachers={list}
      loading={loading}
      cols={cols}
      skeletonCount={Math.max(favorites.length, 2)}
      renderActions={(t) => (
        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn is-bordered" aria-label={`Remove ${t.name}`} onClick={() => toggleFavorite(t.id, t.name)}><Trash2 size={15} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/booking/${t.id}`)}>Book</button>
        </div>
      )}
    />
  );
}
