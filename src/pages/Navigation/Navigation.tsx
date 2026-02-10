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
            <button className="dropbtn">Dropdown Menu</button>
            <div className="dropdown-content">
              <a href="/Home">Home</a>
              <a href="/NotFound">Notfound</a>
              <a href="/Play">Play</a>
              <a href="/Log out" onClick={logout}>Logout</a>
              <a href="/Share">ShareRoom</a>
            </div>
          </div>
        </li>
      </ul>
</div>

  );
}

export default Navigation;