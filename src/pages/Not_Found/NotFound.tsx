import { Link } from "react-router-dom";

function NotFound() {
  return (
    
    <>
      <div>
        <h1>404 Error: Not Found</h1>
        <Link to="/Home">
          <span className="link">Go back to Home</span>
        </Link>
      </div>
    </>
  );
}

export default NotFound;
