import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import Logo from '../common/Logo';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';
import { useBooking } from '../../context/BookingContext';

export default function Footer() {
  const { toast } = useToast();
  const { clearDraft } = useBooking();
  const reset = async () => {
    try {
      await adminService.resetDemo();
      clearDraft();
      toast('Demo data reset to its original state.', 'info');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };
  return (
    <footer className="footer-qh">
      <div className="container-qh">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>Find a skill. Find your person. Learn one-to-one from verified teachers across India and online.</p>
          </div>
          <div>
            <h4>Learn</h4>
            <Link to="/explore">Explore teachers</Link>
            <Link to="/subjects">All subjects</Link>
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/favorites">Favorites</Link>
          </div>
          <div>
            <h4>Teach</h4>
            <Link to="/become-a-teacher">Become a teacher</Link>
            <Link to="/register/teacher">Apply now</Link>
            <Link to="/login">Teacher sign in</Link>
          </div>
          <div>
            <h4>Popular</h4>
            <Link to="/subjects/guitar">Guitar</Link>
            <Link to="/subjects/python">Python</Link>
            <Link to="/subjects/public-speaking">Public Speaking</Link>
            <Link to="/subjects/excel">Excel</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} QuestHive. Frontend demo — all data is simulated.</span>
          <button className="link-btn" onClick={reset}><RotateCcw size={14} /> Reset demo data</button>
        </div>
      </div>
    </footer>
  );
}
