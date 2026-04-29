import { Sun, Moon, LogOut, User, Bell } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { useTheme } from '../../context/useTheme';
import { useUserProfileContext } from '../../context/useUserProfileContext';
import { useNotifications } from '../../context/useNotifications';
import { useSharedSpace } from '../../context/useSharedSpace';
import { LetterAvatar } from '../../components/LetterAvatar';
import './Navigation.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUserProfileContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userToggledNotif, setUserToggledNotif] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { incomingChallenge, respondToChallenge } = useNotifications();
  const { setNamespace, setRoomId, setRoomSize, setIsChallenge } = useSharedSpace();

  // Auto-show notification panel when a challenge arrives; keep it visible
  // as long as the challenge is pending (clicking outside won't dismiss it).
  const notifOpen = userToggledNotif || !!incomingChallenge;

  const active = (path: string) =>
    pathname.toLowerCase().startsWith(path.toLowerCase()) ? 'active' : '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setUserToggledNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccept = () => {
    if (!incomingChallenge) return;
    setUserToggledNotif(false);
    setNamespace("/private_game");
    setRoomSize(2);
    setIsChallenge(true);
    setRoomId(incomingChallenge.roomId);
    respondToChallenge(true);
    navigate(`/Play/${incomingChallenge.roomId}`);
  };

  const handleDecline = () => {
    setUserToggledNotif(false);
    respondToChallenge(false);
  };

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
          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {isAuthenticated && (
            <div className="nav-notif-wrap" ref={notifRef}>
              <button
                className="nav-icon-btn nav-notif-btn"
                onClick={() => setUserToggledNotif(o => !o)}
                title="Notifications"
                aria-label={incomingChallenge ? '1 new notification' : 'Notifications'}
              >
                <Bell size={20} />
                {incomingChallenge && <span className="nav-notif-badge" />}
              </button>

              {notifOpen && (
                <div className="nav-notif-dropdown">
                  <p className="nav-notif-heading">Notifications</p>
                  {incomingChallenge ? (
                    <div className="nav-notif-item">
                      <p className="nav-notif-text">
                        <strong>{incomingChallenge.fromUsername}</strong> challenged you to a race!
                      </p>
                      <div className="nav-notif-actions">
                        <button className="notif-btn notif-btn--accept" onClick={handleAccept}>
                          Accept
                        </button>
                        <button className="notif-btn notif-btn--decline" onClick={handleDecline}>
                          Decline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="nav-notif-empty">No new notifications.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="nav-dropdown-wrap" ref={dropdownRef}>
              <button
                className="nav-avatar"
                onClick={() => setDropdownOpen(o => !o)}
                title="Account"
              >
                <LetterAvatar
                  username={user?.userName ?? 'U'}
                  avatarColor={profile?.avatar_color}
                  size={36}
                />
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown">
                  {user?.userName && (
                    <div className="nav-dropdown-item nav-dropdown-username">
                      {user.userName}
                    </div>
                  )}
                  <Link
                    to="/user/profile"
                    className="nav-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={15} />
                    My Profile
                  </Link>
                  <button className="nav-dropdown-item" onClick={handleLogout}>
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              )}
            </div>
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
