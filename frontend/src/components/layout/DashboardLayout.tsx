import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { PanelLeft, X } from 'lucide-react';
import {
  BarChart3, BookOpen, CalendarCheck, CalendarClock, CalendarDays, CreditCard, FileCheck2, GraduationCap, Heart,
  History, LayoutGrid, Library, MessageSquareText, Settings, ShieldCheck, Star, User, Users, Wallet,
} from 'lucide-react';
import DashboardSidebar, { type NavItem } from './DashboardSidebar';
import type { Role } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { adminService } from '../../api/adminService';
import { bookingService } from '../../api/bookingService';

const navFor = (role: Role, pending: number, toReview: number): NavItem[] => {
  if (role === 'learner') return [
    { to: '/learner/dashboard', label: 'Overview', icon: LayoutGrid },
    { to: '/learner/bookings?tab=upcoming', label: 'Upcoming Classes', icon: CalendarClock },
    { to: '/learner/bookings?tab=past', label: 'Past Classes', icon: History },
    { to: '/learner/favorites', label: 'Favorites', icon: Heart },
    { to: '/learner/reviews', label: 'Reviews', icon: Star, badge: toReview },
    { to: '/learner/payments', label: 'Payments', icon: CreditCard },
    { to: '/learner/profile', label: 'Profile', icon: User },
    { to: '/learner/settings', label: 'Settings', icon: Settings },
  ];
  if (role === 'teacher') return [
    { to: '/teacher/dashboard', label: 'Overview', icon: LayoutGrid },
    { to: '/teacher/profile', label: 'My Profile', icon: User },
    { to: '/teacher/availability', label: 'Availability', icon: CalendarDays },
    { to: '/teacher/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/teacher/students', label: 'Students', icon: Users },
    { to: '/teacher/reviews', label: 'Reviews', icon: MessageSquareText },
    { to: '/teacher/earnings', label: 'Earnings', icon: Wallet },
    { to: '/teacher/verification', label: 'Verification', icon: ShieldCheck },
    { to: '/teacher/settings', label: 'Settings', icon: Settings },
  ];
  return [
    { to: '/admin/dashboard', label: 'Overview', icon: LayoutGrid },
    { to: '/admin/verification', label: 'Teacher Verification', icon: FileCheck2, badge: pending },
    { to: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
    { to: '/admin/learners', label: 'Learners', icon: Users },
    { to: '/admin/bookings', label: 'Bookings', icon: BookOpen },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/reviews', label: 'Reviews', icon: Star },
    { to: '/admin/subjects', label: 'Subjects', icon: Library },
    { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];
};

const titles: Record<Role, string> = { learner: 'Learner', teacher: 'Teacher', admin: 'Admin' };

export default function DashboardLayout({ role, children }: { role: Role; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  useEffect(() => setOpen(false), [location.pathname, location.search]);

  const { data: counts } = useAsync(async () => {
    if (role === 'admin') return { pending: (await adminService.getStats()).pending, toReview: 0 };
    if (role === 'learner' && user) {
      const bookings = await bookingService.getLearnerBookings(user.id);
      return { pending: 0, toReview: bookings.filter((b) => b.status === 'completed' && !b.reviewed).length };
    }
    return { pending: 0, toReview: 0 };
  }, [role, user?.id]);

  const items = navFor(role, counts?.pending ?? 0, counts?.toReview ?? 0);

  return (
    <div className="dash-shell">
      <aside className={`dash-aside ${open ? 'is-open' : ''}`}>
        <div className="dash-aside-mobile-head">
          <strong>Menu</strong>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <DashboardSidebar items={items} title={titles[role]} onNavigate={() => setOpen(false)} />
      </aside>
      {open && <div className="dash-scrim" onClick={() => setOpen(false)} />}
      <main className="dash-main" id="main">
        <button className="btn btn-secondary btn-sm dash-menu-btn" onClick={() => setOpen(true)}>
          <PanelLeft size={16} /> Menu
        </button>
        <div className="page-fade" key={location.pathname}>{children}</div>
      </main>
    </div>
  );
}
