import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="logo" aria-label="QuestHive home">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
        <path d="M16 2l12 7v14l-12 7-12-7V9z" fill="var(--accent-deep)" />
        <path d="M16 9l6 3.5v7L16 23l-6-3.5v-7z" fill="var(--accent-tint)" />
      </svg>
      <span>QuestHive</span>
    </Link>
  );
}
