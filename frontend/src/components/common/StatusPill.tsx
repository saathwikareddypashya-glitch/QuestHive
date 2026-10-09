const tones: Record<string, string> = {
  verified: 'success', completed: 'success', paid: 'success', approved: 'success', active: 'success',
  pending: 'warning', upcoming: 'accent', unverified: 'neutral',
  rejected: 'error', cancelled: 'error', refunded: 'neutral', free: 'peach',
};

export default function StatusPill({ status, label }: { status: string; label?: string }) {
  const tone = tones[status.toLowerCase()] ?? 'neutral';
  const text = label ?? status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`pill pill-${tone}`}>{text}</span>;
}
