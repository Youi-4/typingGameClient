import '../../styles.css'
import { useAuthContext } from "../../context/useAuthContext";
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
              <a href="/SignUp" >Sign Up</a>
            </div>
          </div>
        </li>
      </ul>
</div>

  );
}

export default Navigation;