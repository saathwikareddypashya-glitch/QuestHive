import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import FavoritesView from '../shared/FavoritesView';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function LearnerFavorites() {
  useDocumentTitle('Favorites');
  return (
    <DashboardLayout role="learner">
      <PageHeader title="My favorite teachers" subtitle="Teachers you've saved. Book a class or remove them anytime." />
      <FavoritesView cols={3} />
    </DashboardLayout>
  );
}
