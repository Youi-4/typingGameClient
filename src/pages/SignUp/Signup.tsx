import { useFormik } from 'formik';
import { signUp } from '../../services/registrationApi';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthProvider";
import type { SignUpValues,ApiError } from '../../types/sharedInterfaces';



export function SignUp() {

    const { login } = useAuthContext();
  const navigate = useNavigate();

  const onSubmit = async (values: SignUpValues) => {
    try {
      await signUp(values);
      await login({userName_or_email:values.email,password:values.password});
      console.log("Login successful, navigating to dashboard");
      toast.success("Signed Up successfully");
      navigate("/Play");
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Login failed", error);
      toast.error(`Sign Up failure, ${error.response?.data?.error}`,);
    }
  };
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      verified:true,
      user:'',
    },
    onSubmit: values => {
          onSubmit(values)
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="login">
        <li></li>
        <input 
          name='email' 
          id='email' 
          type="text" 
          placeholder="Enter email address" 
          onChange={formik.handleChange} 
          value={formik.values.email} 
        />
                <input 
          name='user' 
          id='user' 
          type="text" 
          placeholder="Enter user name" 
          onChange={formik.handleChange} 
          value={formik.values.user} 
        />
        <input 
          name='password' 
          id='password' 
          type="password" 
          placeholder="Enter password" 
          onChange={formik.handleChange} 
          value={formik.values.password} 
        />
        <button id='loginbtn' type='submit'>SignUp</button>
      </div>
    </form>
  )
}
export default SignUp;












