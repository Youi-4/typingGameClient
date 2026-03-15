import '../../styles.css'
import { useAuthContext } from "../../context/AuthProvider";
export interface AuthContextValue {
  login: (email: string, password: string) => Promise<void>;
  isAuthPending: boolean;
  isAuthError: boolean;
}
function Navigation() {
    const { logout } = useAuthContext();

  return (
    <div className='navv'>
      <ul >
        <li><a href="/Home">Home</a></li>
        <li><a href="/Login">Login</a></li>
        <li>
          <div className="dropdown">
            <button className="dropbtn">Menu</button>
            <div className="dropdown-content">
              <a >More Coming Soon</a>
              <a href="/Log out" onClick={logout}>Logout</a>
            </div>
          </div>
        </li>
      </ul>
</div>

  );
}

export default Navigation;