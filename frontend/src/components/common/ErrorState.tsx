import { AlertTriangle, RotateCw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong.', text = 'Please try again.', onRetry }: { title?: string; text?: string; onRetry?: () => void }) {
  return (
    <div className="empty-state is-error" role="alert">
      <div className="empty-icon"><AlertTriangle size={26} strokeWidth={1.6} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {onRetry && (
        <button className="btn btn-secondary mt-3" onClick={onRetry}><RotateCw size={16} /> Try again</button>
      )}
    </div>
  );
}
