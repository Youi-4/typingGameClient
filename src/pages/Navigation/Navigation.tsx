import { Bell, Settings, Sun, Moon } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();

  const active = (path: string) => pathname.toLowerCase().startsWith(path.toLowerCase()) ? 'active' : '';

  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        <span className="nav-logo">TYPECRISP</span>

        <ul className="nav-links">
          <li><Link to="/Home" className={active('/home')}>Home</Link></li>
          <li><Link to="/Leaderboard" className={active('/leaderboard')}>Leaderboard</Link></li>
          {isAuthenticated && <li><Link to="/Stats" className={active('/stats')}>Stats</Link></li>}
        </ul>

        <div className="nav-actions">
          <button className="nav-icon-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <button className="nav-icon-btn">
                <Bell size={20} />
              </button>
              <button className="nav-icon-btn">
                <Settings size={20} />
              </button>
              <div className="nav-avatar">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtz9_tYaXaQyB5wYu7cXyIdO1LVYhDPKLIpf8e2zZMHd3mt5Q9XRp6SaBtPHwP_D6QI6H24qrs2hrFiKGr2XPgkT7wcZ4k0b17l3D3pUX7CUhtm7-3s-kb02R_AlQzqz-AvZ1rwVPHL8yvPos-_AXBMbdeqBDiUVI0XzawNGLi1c-3_TY3UnJ_PjqWOO4FaA3TJGW5vTh53LV6QP_wGoq-AC0xxVIiMt9ARO4IWuB9d2aefYgS-rfP6PkOwPa0NCsI9hmmA4ppU08"
                  alt="Profile"
                  referrerPolicy="no-referrer"
                />
              </div>
            </>
          ) : (
            <>
              <Link to="/SignUp" className="nav-btn">Sign up</Link>
              <Link to="/Login" className="nav-btn">Log in</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
