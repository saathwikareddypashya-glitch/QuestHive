import { useEffect, useState } from 'react';
import { CalendarPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/common/Modal';
import { SkeletonRows } from '../../components/common/Skeleton';
import { teacherService } from '../../api/teacherService';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { DAYS, formatTime, formatTimeShort, fromMinutes, toMinutes, uid } from '../../utils/formatters';
import { generateSlots, rangesOverlap, weeklyHours } from '../../utils/slots';
import type { AvailabilityRange, Day } from '../../types';

const TIMES = Array.from({ length: 35 }, (_, i) => fromMinutes(6 * 60 + i * 30)); // 06:00 → 23:00

export default function TeacherAvailability() {
  useDocumentTitle('Availability');
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: teacher } = useAsync(() => teacherService.getTeacherById(user!.id), [user?.id]);
  const [ranges, setRanges] = useState<AvailabilityRange[]>([]);
  const [duration, setDuration] = useState(60);
  const [editing, setEditing] = useState<AvailabilityRange | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { if (teacher) { setRanges(teacher.availability); setDuration(teacher.classDurationMins); } }, [teacher?.id]);

  const persist = async (next: AvailabilityRange[], dur = duration, msg = 'Availability saved.') => {
    setRanges(next);
    await teacherService.updateAvailability(user!.id, next, dur);
    toast(msg);
  };

  const openNew = (day: Day) => { setError(''); setEditing({ id: '', day, start: '17:00', end: '20:00' }); };

  const saveRange = async () => {
    if (!editing) return;
    if (toMinutes(editing.end) - toMinutes(editing.start) < duration) return setError(`A range must be at least one ${duration}-minute class long.`);
    if (ranges.some((r) => r.id !== editing.id && r.day === editing.day && rangesOverlap(r, editing))) return setError(`This overlaps another ${editing.day} range.`);
    const next = editing.id ? ranges.map((r) => (r.id === editing.id ? editing : r)) : [...ranges, { ...editing, id: uid('av') }];
    await persist(next.sort((a, b) => a.start.localeCompare(b.start)), duration, editing.id ? 'Time range updated.' : 'Time range added.');
    setEditing(null);
  };

  return (
    <DashboardLayout role="teacher">
      <PageHeader
        title="Availability"
        subtitle="Learners can only book times inside these weekly ranges. Changes apply immediately."
        actions={
          <label className="sort-select">
            <span className="text-muted-qh small">Class duration</span>
            <select className="input input-sm" value={duration} onChange={(e) => { const d = Number(e.target.value); setDuration(d); persist(ranges, d, `Classes are now ${d} minutes.`); }}>
              {[30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} min</option>)}
            </select>
          </label>
        }
      />
      {!teacher ? <SkeletonRows rows={7} /> : (
        <>
          <div className="avail-summary">
            <span><strong>{weeklyHours(ranges).toFixed(1)}</strong> hours open per week</span>
            <span><strong>{DAYS.reduce((n, d) => n + generateSlots(ranges, d, duration).length, 0)}</strong> bookable slots per week</span>
          </div>
          <div className="week-grid">
            {DAYS.map((d) => {
              const dayRanges = ranges.filter((r) => r.day === d);
              const slots = generateSlots(ranges, d, duration);
              return (
                <div key={d} className={`week-day ${dayRanges.length ? 'has-hours' : ''}`}>
                  <div className="wd-head">
                    <strong>{d}</strong>
                    <button className="icon-btn" aria-label={`Add hours on ${d}`} onClick={() => openNew(d)}><Plus size={16} /></button>
                  </div>
                  {dayRanges.length === 0 ? (
                    <button className="wd-empty" onClick={() => openNew(d)}><CalendarPlus size={16} /> Add hours</button>
                  ) : (
                    dayRanges.map((r) => (
                      <div key={r.id} className="wd-range">
                        <span>{formatTimeShort(r.start)} — {formatTimeShort(r.end)}</span>
                        <span className="wd-actions">
                          <button className="icon-btn" aria-label="Edit range" onClick={() => { setError(''); setEditing(r); }}><Pencil size={14} /></button>
                          <button className="icon-btn" aria-label="Remove range" onClick={() => persist(ranges.filter((x) => x.id !== r.id), duration, 'Time range removed.')}><Trash2 size={14} /></button>
                        </span>
                      </div>
                    ))
                  )}
                  {slots.length > 0 && <div className="wd-slots">{slots.map((s) => <span key={s}>{formatTime(s)}</span>)}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit time range' : 'Add time range'}
        size="sm"
        footer={<><button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" onClick={saveRange}>Save</button></>}
      >
        {editing && (
          <div className="d-flex flex-column gap-3">
            <div className="field mb-0">
              <label className="label" htmlFor="av-day">Day</label>
              <select id="av-day" className="input" value={editing.day} onChange={(e) => setEditing({ ...editing, day: e.target.value as Day })}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="row g-2">
              <div className="col-6 field mb-0">
                <label className="label" htmlFor="av-start">From</label>
                <select id="av-start" className="input" value={editing.start} onChange={(e) => setEditing({ ...editing, start: e.target.value })}>
                  {TIMES.map((t) => <option key={t} value={t}>{formatTimeShort(t)}</option>)}
                </select>
              </div>
              <div className="col-6 field mb-0">
                <label className="label" htmlFor="av-end">To</label>
                <select id="av-end" className="input" value={editing.end} onChange={(e) => setEditing({ ...editing, end: e.target.value })}>
                  {TIMES.map((t) => <option key={t} value={t}>{formatTimeShort(t)}</option>)}
                </select>
              </div>
            </div>
            <p className="text-muted-qh small mb-0">
              Creates {Math.max(0, Math.floor((toMinutes(editing.end) - toMinutes(editing.start)) / duration))} bookable {duration}-minute slots.
            </p>
            {error && <p className="field-error mb-0">{error}</p>}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
