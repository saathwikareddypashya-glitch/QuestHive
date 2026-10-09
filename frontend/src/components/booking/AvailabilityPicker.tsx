import { Clock } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

export interface SlotGroup { label: string; sublabel?: string; slots: { time: string; available: boolean; reason?: string }[] }

interface Props {
  groups: SlotGroup[];
  selected?: { group: string; time: string } | null;
  onSelect?: (group: string, time: string) => void;
  emptyText?: string;
}

export default function AvailabilityPicker({ groups, selected, onSelect, emptyText = 'No times available on this day.' }: Props) {
  if (groups.length === 0 || groups.every((g) => g.slots.length === 0)) {
    return <p className="slot-empty"><Clock size={16} /> {emptyText}</p>;
  }
  return (
    <div className="slot-groups">
      {groups.map((g) => (
        <div key={g.label} className="slot-group">
          <div className="slot-day">
            <strong>{g.label}</strong>
            {g.sublabel && <span>{g.sublabel}</span>}
          </div>
          <div className="slot-list" role="listbox" aria-label={`${g.label} times`}>
            {g.slots.map((s) => {
              const isSel = selected?.group === g.label && selected.time === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  disabled={!s.available}
                  title={!s.available ? (s.reason === 'booked' ? 'Already booked' : 'Time has passed') : undefined}
                  className={`slot ${isSel ? 'is-selected' : ''}`}
                  onClick={() => onSelect?.(g.label, s.time)}
                >
                  {formatTime(s.time)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
