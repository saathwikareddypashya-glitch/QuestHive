import { Component, type ReactNode } from 'react';

interface State { error: Error | null }

/** Catches render errors so the app never shows a blank white page. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error('QuestHive crashed:', error); }
  reset = () => {
    ['questhive_db', 'qh_auth', 'qh_booking_draft'].forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem('qh_auth');
    window.location.href = '/';
  };
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 520, margin: '80px auto', padding: 24, fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong.</h1>
        <p style={{ color: '#7A756C' }}>{this.state.error.message}</p>
        <button onClick={this.reset} style={{ marginTop: 16, padding: '10px 18px', borderRadius: 10, border: 0, background: '#5E7F62', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Reset demo data and reload
        </button>
      </div>
    );
  }
}
