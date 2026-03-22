import { useFormik } from 'formik';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthProvider";
import type { LoginValues,ApiError } from '../../types/sharedInterfaces';


export function Login() {

  const { login, isAuthPending } = useAuthContext();

  const navigate = useNavigate();

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      console.log("Login successful, navigating to dashboard");
      toast.success("Login successfully");
      navigate("/Play");
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Login failed", error);
      toast.error(`Login failure, ${error.response?.data?.error}`,);
    }
  };
  const formik = useFormik({
    initialValues: {
      userName_or_email: '',
      password: '',
    },
    onSubmit: values => {
      //alert(JSON.stringify(values, null, 2));
          onSubmit(values)
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="login">
        <li></li>
        <input 
          name='userName_or_email' 
          id='userName_or_email' 
          type="text" 
          placeholder="Enter username" 
          onChange={formik.handleChange} 
          value={formik.values.userName_or_email} 
        />
        <input 
          name='password' 
          id='password' 
          type="password" 
          placeholder="Enter password" 
          onChange={formik.handleChange} 
          value={formik.values.password} 
        />
        <button id='loginbtn' type='submit' disabled={isAuthPending}>
          {isAuthPending ? "Logging in..." : "Login"}
        </button>
        <button id='loginbtn' type='button' onClick={() =>{navigate("/SignUp")}}>SignUp</button>
      </div>
    </form>
  )
}
export default Login;












