import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props { icon: LucideIcon; title: string; text?: string; action?: ReactNode; compact?: boolean }

export default function EmptyState({ icon: Icon, title, text, action, compact }: Props) {
  return (
    <div className={`empty-state ${compact ? 'is-compact' : ''}`}>
      <div className="empty-icon"><Icon size={26} strokeWidth={1.6} /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
