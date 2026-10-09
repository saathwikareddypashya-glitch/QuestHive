import type { LucideIcon } from 'lucide-react';

interface Props { icon: LucideIcon; label: string; value: string | number; hint?: string; tone?: 'accent' | 'peach' | 'neutral' | 'warning' }

export default function StatCard({ icon: Icon, label, value, hint, tone = 'accent' }: Props) {
  return (
    <div className="stat-card">
      <div className={`stat-icon tone-${tone}`}><Icon size={18} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
