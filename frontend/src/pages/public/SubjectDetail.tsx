import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, SearchX } from 'lucide-react';
import TeacherGrid from '../../components/teacher/TeacherGrid';
import EmptyState from '../../components/common/EmptyState';
import { useCategories } from '../../hooks/useCategories';
import { useAsync } from '../../hooks/useAsync';
import { teacherService } from '../../api/teacherService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { slugify } from '../../utils/formatters';
import { teachesSubject } from '../../utils/filterTeachers';

export default function SubjectDetail() {
  const { subject: slug = '' } = useParams();
  const { data: categories } = useCategories();
  const { data: teachers, loading } = useAsync(() => teacherService.getPublicTeachers(), []);

  const category = categories?.find((c) => c.subjects.some((s) => slugify(s) === slug));
  const subject = category?.subjects.find((s) => slugify(s) === slug) ?? slug.replace(/-/g, ' ');
  useDocumentTitle(`${subject} teachers`);
  const list = teachers ? teachers.filter((t) => teachesSubject(t, subject)).sort((a, b) => b.rating - a.rating) : null;
  const related = category?.subjects.filter((s) => s !== subject).slice(0, 8) ?? [];

  return (
    <div className="page-fade container-qh section-tight">
      <Link to="/subjects" className="back-link"><ChevronLeft size={16} /> All subjects</Link>
      <div className="subject-detail-head">
        {category && <span className="pill pill-accent">{category.emoji} {category.shortName}</span>}
        <h1 className="h-page-lg">{subject} teachers</h1>
        <p className="text-muted-qh">{list ? `${list.length} ${list.length === 1 ? 'teacher teaches' : 'teachers teach'} ${subject}.` : 'Finding teachers…'}</p>
      </div>

      {list && list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={`No ${subject} teachers yet.`}
          text="New teachers join every week. Meanwhile, try a related subject or browse everyone."
          action={<Link to="/explore" className="btn btn-primary">Explore all teachers</Link>}
        />
      ) : (
        <TeacherGrid teachers={list} loading={loading} skeletonCount={4} />
      )}

      {related.length > 0 && (
        <div className="related">
          <h2 className="h-section">Related subjects</h2>
          <div className="subject-pills">
            {related.map((s) => <Link key={s} to={`/subjects/${slugify(s)}`} className="subject-pill">{s}</Link>)}
          </div>
        </div>
      )}
    </div>
  );
}
