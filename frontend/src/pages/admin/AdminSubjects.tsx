import { useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import { SkeletonRows } from '../../components/common/Skeleton';
import { adminService } from '../../api/adminService';
import { useCategories } from '../../hooks/useCategories';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function AdminSubjects() {
  useDocumentTitle('Subjects');
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const add = async (e: FormEvent, categoryId: string) => {
    e.preventDefault();
    const name = (drafts[categoryId] ?? '').trim();
    if (!name) return;
    try { await adminService.addSubject(categoryId, name); setDrafts({ ...drafts, [categoryId]: '' }); toast(`Added ${name}.`); }
    catch (err) { toast((err as Error).message, 'error'); }
  };

  return (
    <DashboardLayout role="admin">
      <PageHeader title="Subjects" subtitle="Subjects learners can browse and teachers can apply for." />
      {!categories ? <SkeletonRows rows={6} /> : (
        <div className="d-flex flex-column gap-4">
          {categories.map((c) => (
            <div key={c.id} className="panel">
              <div className="panel-head">
                <h2 className="h-section mb-0">{c.emoji} {c.name}</h2>
                <span className="text-muted-qh small">{c.subjects.length} subjects</span>
              </div>
              <div className="subject-pills">
                {c.subjects.map((s) => (
                  <span key={s} className="subject-pill is-editable">
                    {s}
                    <button className="pill-x" aria-label={`Remove ${s}`} onClick={async () => { await adminService.removeSubject(c.id, s); toast(`Removed ${s}.`, 'info'); }}><X size={12} /></button>
                  </span>
                ))}
              </div>
              <form className="inline-add" onSubmit={(e) => add(e, c.id)}>
                <input className="input input-sm" placeholder={`Add a subject to ${c.shortName}`} value={drafts[c.id] ?? ''} onChange={(e) => setDrafts({ ...drafts, [c.id]: e.target.value })} />
                <button className="btn btn-secondary btn-sm" type="submit"><Plus size={14} /> Add</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
