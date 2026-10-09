import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, Menu, User as UserIcon, X } from 'lucide-react';
import Logo from '../common/Logo';
import Avatar from '../common/Avatar';
import NotificationDropdown from '../notification/NotificationDropdown';
import { dashboardPath, useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';

const links = [
  { to: '/explore', label: 'Explore' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/become-a-teacher', label: 'Become a Teacher' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMenu(false); setUserMenu(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    const close = (e: MouseEvent) => userRef.current && !userRef.current.contains(e.target as Node) && setUserMenu(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  const doLogout = () => { logout(); navigate('/'); };
  const profilePath = user ? (user.role === 'admin' ? '/admin/settings' : `/${user.role}/profile`) : '/login';

  return (
    <header className="navbar-qh">
      <div className="container-qh nav-inner">
        <Logo />
        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link-qh ${isActive && !l.to.includes('#') ? 'is-active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to={user?.role === 'learner' ? '/learner/favorites' : '/favorites'} className="icon-btn nav-icon" aria-label={`Favorites (${favorites.length})`}>
            <Heart size={19} />
            {favorites.length > 0 && <span className="dot-count is-soft">{favorites.length}</span>}
          </Link>
          {user ? (
            <>
              <NotificationDropdown />
              <div className="dropdown-wrap" ref={userRef}>
                <button className="avatar-btn" onClick={() => setUserMenu((o) => !o)} aria-expanded={userMenu} aria-label="Account menu">
                  <Avatar src={user.avatar} name={user.name} size={36} />
                </button>
                {userMenu && (
                  <div className="dropdown-panel user-panel">
                    <div className="user-panel-head">
                      <strong>{user.name}</strong>
                      <span className="text-muted-qh small">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} account</span>
                    </div>
                    <Link to={dashboardPath(user.role)} className="menu-item"><LayoutDashboard size={16} /> Dashboard</Link>
                    <Link to={profilePath} className="menu-item"><UserIcon size={16} /> {user.role === 'admin' ? 'Settings' : 'Profile'}</Link>
                    <button className="menu-item" onClick={doLogout}><LogOut size={16} /> Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Get started</Link>
            </div>
          )}
          <button className="icon-btn nav-burger" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menu ? 'is-open' : ''}`} aria-hidden={!menu}>
        <nav aria-label="Mobile">
          {links.map((l) => <Link key={l.to} to={l.to} className="mobile-link">{l.label}</Link>)}
          <Link to="/favorites" className="mobile-link">Favorites ({favorites.length})</Link>
        </nav>
        <div className="mobile-menu-foot">
          {user ? (
            <>
              <Link to={dashboardPath(user.role)} className="btn btn-primary btn-block">Go to dashboard</Link>
              <button className="btn btn-secondary btn-block" onClick={doLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-block">Get started</Link>
              <Link to="/login" className="btn btn-secondary btn-block">Sign in</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
