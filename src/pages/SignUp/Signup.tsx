import { useFormik } from 'formik';
import { signUp } from '../../services/registrationApi';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import { useState } from 'react';
import { useAuthContext } from "../../context/AuthProvider";


export interface AuthUser {
  email: string;
  password: string;
  user:string
  verified: boolean;
}
export interface AuthContextValue {
  signup: (email: string, password: string) => Promise<void>;
  isAuthPending: boolean;
  isAuthError: boolean;
}
export interface ApiError {
  response?: {
    data?: {
      id?: string;
      error?: string;
    };
  };
}

export function SignUp() {

  //     const updatedSchema = loginSchema;

  //   const formikRef = useRef();
  //   const [formikState, setFormikState] = useState({});
// const [passError, setPassError] = useState<string | null>(null);
// const [emailError, setEmailError] = useState<string | null>(null);

// const [loginAttempts, setLoginAttempts] = useState<number>(0);
// const AuthContext = createContext<AuthContextValue | undefined>(undefined);
// const useAuthContext = (): AuthContextValue => {
// const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuthContext must be used within an AuthProvider");
//   }

//   return context;
// };



    const { login } = useAuthContext();
  const navigate = useNavigate();

  //   const loginApi = usePostData(loginUser, ["loginUser"]);

  // TODO 4: Define your onSubmit function
  const onSubmit = async (values: AuthUser) => {
    // loginApi.mutate(values, {
    //   onSuccess: () => {
    //     toast.success("Login successfully");
    //     navigate("/");
    //   },
    //   onError: (err) => {
    //     if (err.response.data.id === "loginPassword")
    //       setPassError(err.response.data.error);
    //     if (err.response.data.id === "email")
    //       setEmailError(err.response.data.error);
    //     toast.error("Login failure.");
    //     setLoginAttempts((value) => value + 1);
    //   },
    // });
    try {
      await signUp(values);
      await login({userName_or_email:values.email,password:values.password});
      console.log("Login successful, navigating to dashboard");
      toast.success("Signed Up successfully");
      navigate("/Play");
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Login failed", error);
      // if (error.response?.data?.id === "loginPassword")
      //   setPassError(error.response.data.error?? " invalid Password");
      // if (error.response?.data?.id === "email")
      //   setEmailError(error.response.data.error?? " invalid Password");
      // toast.error(`Sign Up failure, ${error.response?.data?.error}`,);
      // setLoginAttempts((value) => value + 1);
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
      //alert(JSON.stringify(values, null, 2));
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












