import type { ReactNode } from 'react';
import type { Teacher } from '../../types';
import TeacherCard from './TeacherCard';
import { SkeletonGrid } from '../common/Skeleton';

interface Props {
  teachers: Teacher[] | null;
  loading?: boolean;
  skeletonCount?: number;
  renderActions?: (t: Teacher) => ReactNode;
  cols?: 3 | 4;
}

export default function TeacherGrid({ teachers, loading, skeletonCount = 8, renderActions, cols = 4 }: Props) {
  if (loading || !teachers) return <SkeletonGrid count={skeletonCount} />;
  return (
    <div className={`teacher-grid cols-${cols}`}>
      {teachers.map((t) => <TeacherCard key={t.id} teacher={t} actions={renderActions?.(t)} />)}
    </div>
  );
}
