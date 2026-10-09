import type { LucideIcon } from 'lucide-react';

interface Props { id: string; label: string; description: string; icon: LucideIcon; selected: boolean; onSelect: () => void }

export default function PaymentMethodCard({ id, label, description, icon: Icon, selected, onSelect }: Props) {
  return (
    <label className={`pay-method ${selected ? 'is-selected' : ''}`} htmlFor={`pm-${id}`}>
      <input type="radio" id={`pm-${id}`} name="payment-method" checked={selected} onChange={onSelect} />
      <span className="pm-icon"><Icon size={20} /></span>
      <span className="pm-text">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="pm-radio" aria-hidden />
    </label>
  );
}
