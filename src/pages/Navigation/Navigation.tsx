import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { useTheme } from '../../context/useTheme';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const active = (path: string) => pathname.toLowerCase().startsWith(path.toLowerCase()) ? 'active' : '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/Home');
  };

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

              <div className="nav-dropdown-wrap" ref={dropdownRef}>
                <button className="nav-avatar" onClick={() => setDropdownOpen(o => !o)}>
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName ?? 'U')}&background=1a73e8&color=fff&bold=true`}
                    alt="Profile"
                  />
                </button>

                {dropdownOpen && (
                  <div className="nav-dropdown">
                    {user?.userName && (
                      <div className="nav-dropdown-item" style={{ opacity: 0.6, cursor: 'default', fontWeight: 700 }}>
                        {user.userName}
                      </div>
                    )}
                    <button className="nav-dropdown-item" onClick={handleLogout}>
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                )}
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
