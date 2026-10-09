import { Check } from 'lucide-react';

const steps = ['Schedule', 'Review', 'Payment', 'Confirmed'];

export default function BookingStepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="stepper" aria-label="Booking progress">
      {steps.map((s, i) => {
        const n = i + 1;
        const state = n < step ? 'is-done' : n === step ? 'is-current' : '';
        return (
          <li key={s} className={`step ${state}`} aria-current={n === step ? 'step' : undefined}>
            <span className="step-dot">{n < step ? <Check size={14} /> : n}</span>
            <span className="step-label">{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
