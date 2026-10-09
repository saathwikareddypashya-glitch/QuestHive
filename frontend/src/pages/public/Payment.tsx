import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Building2, ChevronLeft, CreditCard, Loader2, Lock, Smartphone, Sparkles, Wallet, AlertTriangle } from 'lucide-react';
import BookingStepper from '../../components/booking/BookingStepper';
import BookingSummary from '../../components/booking/BookingSummary';
import PaymentMethodCard from '../../components/booking/PaymentMethodCard';
import { paymentService } from '../../api/paymentService';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatINR } from '../../utils/formatters';

const methods = [
  { id: 'UPI', label: 'UPI', description: 'Google Pay, PhonePe, Paytm or any UPI app', icon: Smartphone },
  { id: 'Credit / Debit Card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'Net Banking', label: 'Net Banking', description: 'All major Indian banks', icon: Building2 },
  { id: 'Wallet', label: 'Wallet', description: 'Paytm, Amazon Pay, Mobikwik', icon: Wallet },
  { id: 'Demo Payment', label: 'Demo Payment', description: 'Instant success — for testing', icon: Sparkles },
];

export default function Payment() {
  useDocumentTitle('Payment');
  const { draft, clearDraft } = useBooking();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [method, setMethod] = useState('UPI');
  const [fields, setFields] = useState({ upi: '', card: '', expiry: '', cvv: '', name: '', bank: '', wallet: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [failure, setFailure] = useState('');

  if (!draft) return <Navigate to="/explore" replace />;

  const set = (k: keyof typeof fields, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (draft.isFree) return {};
    const e: Record<string, string> = {};
    if (method === 'UPI' && !/^[\w.-]+@[\w]+$/.test(fields.upi)) e.upi = 'Enter a UPI ID like name@okbank.';
    if (method === 'Credit / Debit Card') {
      if (fields.card.replace(/\s/g, '').length < 16) e.card = 'Enter the 16-digit card number.';
      if (!/^\d{2}\/\d{2}$/.test(fields.expiry)) e.expiry = 'Use MM/YY.';
      if (!/^\d{3}$/.test(fields.cvv)) e.cvv = '3 digits.';
      if (!fields.name.trim()) e.name = 'Enter the name on the card.';
    }
    if (method === 'Net Banking' && !fields.bank) e.bank = 'Choose your bank.';
    if (method === 'Wallet' && !fields.wallet) e.wallet = 'Choose a wallet.';
    return e;
  };

  const pay = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setFailure('');
    setProcessing(true);
    try {
      const booking = await paymentService.payAndBook(draft, user!, method);
      clearDraft();
      toast(draft.isFree ? 'Your free class is booked.' : 'Payment successful. Your class is booked.');
      navigate(`/booking-confirmed?id=${booking.id}`, { replace: true });
    } catch (err) {
      setFailure((err as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  return (
    <div className="page-fade booking-page">
      <div className="container-qh narrow">
        <Link to={`/booking/${draft.teacherId}`} className="back-link"><ChevronLeft size={16} /> Back to review</Link>
        <BookingStepper step={3} />

        {failure && (
          <div className="notice notice-error" role="alert">
            <AlertTriangle size={16} />
            <span>{failure} {failure.includes('no longer available') && <Link to={`/booking/${draft.teacherId}`}>Choose another time</Link>}</span>
          </div>
        )}

        <form className="booking-grid" onSubmit={pay} noValidate>
          <div className="panel">
            <h1 className="h-page">{draft.isFree ? 'Confirm your free class' : 'Payment'}</h1>
            {draft.isFree ? (
              <p className="text-muted-qh">Your first class with {draft.teacherName} is free, so there's nothing to pay. Confirm to book it.</p>
            ) : (
              <>
                <p className="text-muted-qh">Choose how you'd like to pay. This is a demo — no real money moves.</p>
                <div className="pay-methods" role="radiogroup" aria-label="Payment method">
                  {methods.map((m) => (
                    <PaymentMethodCard key={m.id} {...m} selected={method === m.id} onSelect={() => { setMethod(m.id); setErrors({}); }} />
                  ))}
                </div>

                <div className="pay-fields">
                  {method === 'UPI' && (
                    <div className="field">
                      <label className="label" htmlFor="upi">UPI ID</label>
                      <input id="upi" className={`input ${errors.upi ? 'is-invalid' : ''}`} placeholder="yourname@okbank" value={fields.upi} onChange={(e) => set('upi', e.target.value)} />
                      {errors.upi && <p className="field-error">{errors.upi}</p>}
                    </div>
                  )}
                  {method === 'Credit / Debit Card' && (
                    <div className="row g-3">
                      <div className="col-12 field">
                        <label className="label" htmlFor="card">Card number</label>
                        <input id="card" inputMode="numeric" className={`input ${errors.card ? 'is-invalid' : ''}`} placeholder="4111 1111 1111 1111" value={fields.card} onChange={(e) => set('card', formatCard(e.target.value))} />
                        {errors.card && <p className="field-error">{errors.card}</p>}
                      </div>
                      <div className="col-6 field">
                        <label className="label" htmlFor="exp">Expiry</label>
                        <input id="exp" className={`input ${errors.expiry ? 'is-invalid' : ''}`} placeholder="MM/YY" value={fields.expiry} onChange={(e) => set('expiry', formatExpiry(e.target.value))} />
                        {errors.expiry && <p className="field-error">{errors.expiry}</p>}
                      </div>
                      <div className="col-6 field">
                        <label className="label" htmlFor="cvv">CVV</label>
                        <input id="cvv" inputMode="numeric" type="password" className={`input ${errors.cvv ? 'is-invalid' : ''}`} placeholder="123" value={fields.cvv} onChange={(e) => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))} />
                        {errors.cvv && <p className="field-error">{errors.cvv}</p>}
                      </div>
                      <div className="col-12 field">
                        <label className="label" htmlFor="cname">Name on card</label>
                        <input id="cname" className={`input ${errors.name ? 'is-invalid' : ''}`} value={fields.name} onChange={(e) => set('name', e.target.value)} />
                        {errors.name && <p className="field-error">{errors.name}</p>}
                      </div>
                    </div>
                  )}
                  {method === 'Net Banking' && (
                    <div className="field">
                      <label className="label" htmlFor="bank">Bank</label>
                      <select id="bank" className={`input ${errors.bank ? 'is-invalid' : ''}`} value={fields.bank} onChange={(e) => set('bank', e.target.value)}>
                        <option value="">Choose your bank</option>
                        {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'].map((b) => <option key={b}>{b}</option>)}
                      </select>
                      {errors.bank && <p className="field-error">{errors.bank}</p>}
                    </div>
                  )}
                  {method === 'Wallet' && (
                    <div className="chip-row">
                      {['Paytm', 'Amazon Pay', 'Mobikwik'].map((w) => (
                        <button type="button" key={w} className={`chip ${fields.wallet === w ? 'is-on' : ''}`} onClick={() => set('wallet', w)}>{w}</button>
                      ))}
                      {errors.wallet && <p className="field-error w-100">{errors.wallet}</p>}
                    </div>
                  )}
                  {method === 'Demo Payment' && <p className="text-muted-qh mb-0">Click Pay to simulate a successful payment instantly.</p>}
                </div>
              </>
            )}

            <button className="btn btn-primary btn-lg btn-block mt-4" type="submit" disabled={processing}>
              {processing ? <><Loader2 size={18} className="spin" /> Processing…</> : draft.isFree ? 'Confirm free class' : `Pay ${formatINR(draft.amount)}`}
            </button>
            <p className="secure-note"><Lock size={13} /> Payments are simulated in this demo. No card details are stored.</p>
          </div>

          <aside className="booking-aside">
            <div className="panel">
              <h2 className="h-section">Order summary</h2>
              <BookingSummary
                compact teacherName={draft.teacherName} teacherImage={draft.teacherImage} subject={draft.subject}
                date={draft.date} time={draft.time} durationMins={draft.durationMins} price={draft.price} amount={draft.amount} isFree={draft.isFree}
              />
            </div>
          </aside>
        </form>
      </div>

      {processing && (
        <div className="processing-overlay" role="status">
          <div className="processing-card">
            <Loader2 size={34} className="spin" />
            <strong>{draft.isFree ? 'Booking your class…' : 'Processing payment…'}</strong>
            <span className="text-muted-qh small">Please don't close this window.</span>
          </div>
        </div>
      )}
    </div>
  );
}
