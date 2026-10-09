import { useEffect, useState, type FormEvent } from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onSubmit: (q: string) => void;
  onChange?: (q: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  size?: 'md' | 'lg';
}

export default function SearchBar({ value, onSubmit, onChange, placeholder = 'Try Guitar, Python, Excel, Public Speaking…', buttonLabel = 'Find teachers', size = 'md' }: Props) {
  const [q, setQ] = useState(value);
  useEffect(() => setQ(value), [value]);
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit(q.trim()); };
  return (
    <form className={`search-bar search-${size}`} onSubmit={submit} role="search">
      <Search size={size === 'lg' ? 22 : 18} className="search-icon" aria-hidden />
      <label htmlFor={`search-${size}`} className="visually-hidden">What do you want to learn?</label>
      <input
        id={`search-${size}`}
        value={q}
        onChange={(e) => { setQ(e.target.value); onChange?.(e.target.value); }}
        placeholder={placeholder}
        autoComplete="off"
      />
      {q && (
        <button type="button" className="icon-btn search-clear" aria-label="Clear search" onClick={() => { setQ(''); onChange?.(''); onSubmit(''); }}>
          <X size={16} />
        </button>
      )}
      <button type="submit" className="btn btn-primary">{buttonLabel}</button>
    </form>
  );
}
