import { BadgeCheck } from 'lucide-react';

export default function VerifiedBadge({ label = 'Verified', size = 'sm' }: { label?: string; size?: 'sm' | 'md' }) {
  return (
    <span className={`verified-badge verified-${size}`}>
      <BadgeCheck size={size === 'md' ? 16 : 14} aria-hidden /> {label}
    </span>
  );
}
