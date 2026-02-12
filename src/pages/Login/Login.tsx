import { useFormik } from 'formik';

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// import { useState } from 'react';
import { useAuthContext } from "../../context/AuthProvider";


export interface AuthUser {
  userName_or_email: string;
  password: string;
  
}
export interface AuthContextValue {
  login: (email: string, password: string) => Promise<void>;
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

export function Login() {

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
      await login(values);
      console.log("Login successful, navigating to dashboard");
      toast.success("Login successfully");
      navigate("/Play");
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error("Login failed", error);
      // if (error.response?.data?.id === "loginPassword")
      //   setPassError(error.response.data.error?? " invalid Password");
      // if (error.response?.data?.id === "email")
      //   setEmailError(error.response.data.error?? " invalid Email");
      toast.error(`Login failure, ${error.response?.data?.error}`,);
      // setLoginAttempts((value) => value + 1);
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
        <button id='loginbtn' type='submit'>Login</button>
        <button id='loginbtn' type='button' onClick={() =>{navigate("/SignUp")}}>SignUp</button>
      </div>
    </form>
  )
}
export default Login;












