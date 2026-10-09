import { Navigate } from 'react-router-dom';
import FavoritesView from '../shared/FavoritesView';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';

export default function Favorites() {
  useDocumentTitle('Favorites');
  const { user } = useAuth();
  if (user?.role === 'learner') return <Navigate to="/learner/favorites" replace />;
  return (
    <div className="page-fade container-qh section-tight">
      <h1 className="h-page-lg">My favorite teachers</h1>
      <p className="text-muted-qh mb-4">Saved on this device. Sign in to book a class with any of them.</p>
      <FavoritesView />
    </div>
  );
}
