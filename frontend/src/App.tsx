import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ServerBanner from './components/common/ServerBanner';
import DashboardLayout from './components/layout/DashboardLayout';
import { ProtectedRoute } from './utils/guards';
import type { Role } from './types';

import Home from './pages/public/Home';
import Explore from './pages/public/Explore';
import Subjects from './pages/public/Subjects';
import SubjectDetail from './pages/public/SubjectDetail';
import TeacherProfile from './pages/public/TeacherProfile';
import Booking from './pages/public/Booking';
import Payment from './pages/public/Payment';
import BookingConfirmed from './pages/public/BookingConfirmed';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import TeacherRegister from './pages/public/TeacherRegister';
import BecomeATeacher from './pages/public/BecomeATeacher';
import Favorites from './pages/public/Favorites';
import NotFound from './pages/public/NotFound';

import LearnerDashboard from './pages/learner/LearnerDashboard';
import LearnerBookings from './pages/learner/LearnerBookings';
import LearnerFavorites from './pages/learner/LearnerFavorites';
import LearnerReviews from './pages/learner/LearnerReviews';
import LearnerPayments from './pages/learner/LearnerPayments';
import LearnerProfile from './pages/learner/LearnerProfile';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfileEdit from './pages/teacher/TeacherProfileEdit';
import TeacherAvailability from './pages/teacher/TeacherAvailability';
import TeacherBookings from './pages/teacher/TeacherBookings';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherReviews from './pages/teacher/TeacherReviews';
import TeacherEarnings from './pages/teacher/TeacherEarnings';
import TeacherVerification from './pages/teacher/TeacherVerification';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerification from './pages/admin/AdminVerification';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminLearners from './pages/admin/AdminLearners';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminReports from './pages/admin/AdminReports';
import SettingsPage from './pages/shared/SettingsPage';

function PublicShell() {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar />
      <main id="main" key={pathname}><Outlet /></main>
      <Footer />
    </>
  );
}

function AppShell() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const guard = (roles: Role[], el: JSX.Element) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;
const settings = (role: Role) => guard([role], <DashboardLayout role={role}><SettingsPage /></DashboardLayout>);

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <ServerBanner />
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/subjects/:subject" element={<SubjectDetail />} />
          <Route path="/t/:id" element={<TeacherProfile />} />
          <Route path="/become-a-teacher" element={<BecomeATeacher />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/booking/:teacherId" element={guard(['learner'], <Booking />)} />
          <Route path="/payment" element={guard(['learner'], <Payment />)} />
          <Route path="/booking-confirmed" element={guard(['learner'], <BookingConfirmed />)} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/teacher" element={<TeacherRegister />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AppShell />}>
          <Route path="/learner/dashboard" element={guard(['learner'], <LearnerDashboard />)} />
          <Route path="/learner/bookings" element={guard(['learner'], <LearnerBookings />)} />
          <Route path="/learner/favorites" element={guard(['learner'], <LearnerFavorites />)} />
          <Route path="/learner/reviews" element={guard(['learner'], <LearnerReviews />)} />
          <Route path="/learner/payments" element={guard(['learner'], <LearnerPayments />)} />
          <Route path="/learner/profile" element={guard(['learner'], <LearnerProfile />)} />
          <Route path="/learner/settings" element={settings('learner')} />

          <Route path="/teacher/dashboard" element={guard(['teacher'], <TeacherDashboard />)} />
          <Route path="/teacher/profile" element={guard(['teacher'], <TeacherProfileEdit />)} />
          <Route path="/teacher/availability" element={guard(['teacher'], <TeacherAvailability />)} />
          <Route path="/teacher/bookings" element={guard(['teacher'], <TeacherBookings />)} />
          <Route path="/teacher/students" element={guard(['teacher'], <TeacherStudents />)} />
          <Route path="/teacher/reviews" element={guard(['teacher'], <TeacherReviews />)} />
          <Route path="/teacher/earnings" element={guard(['teacher'], <TeacherEarnings />)} />
          <Route path="/teacher/verification" element={guard(['teacher'], <TeacherVerification />)} />
          <Route path="/teacher/settings" element={settings('teacher')} />

          <Route path="/admin/dashboard" element={guard(['admin'], <AdminDashboard />)} />
          <Route path="/admin/verification" element={guard(['admin'], <AdminVerification />)} />
          <Route path="/admin/teachers" element={guard(['admin'], <AdminTeachers />)} />
          <Route path="/admin/learners" element={guard(['admin'], <AdminLearners />)} />
          <Route path="/admin/bookings" element={guard(['admin'], <AdminBookings />)} />
          <Route path="/admin/payments" element={guard(['admin'], <AdminPayments />)} />
          <Route path="/admin/reviews" element={guard(['admin'], <AdminReviews />)} />
          <Route path="/admin/subjects" element={guard(['admin'], <AdminSubjects />)} />
          <Route path="/admin/reports" element={guard(['admin'], <AdminReports />)} />
          <Route path="/admin/settings" element={settings('admin')} />
        </Route>
      </Routes>
    </>
  );
}
