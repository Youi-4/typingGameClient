import { useFormik } from 'formik';
import { motion } from 'framer-motion';

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/useAuthContext";
import type { LoginValues, ApiError } from '../../types/sharedInterfaces';
import '../Auth/Auth.css';

export function Login() {
  const { login, isAuthPending } = useAuthContext();
  const navigate = useNavigate();

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      toast.success("Logged in successfully");
      navigate("/Home");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(`Login failed: ${error.response?.data?.error}`);
    }
  };

  const formik = useFormik({
    initialValues: { userName_or_email: '', password: '' },
    onSubmit,
  });

  return (
    <div className="auth-page">
      <div className="auth-blur-1" />
      <div className="auth-blur-2" />

      <motion.div
        className="auth-card-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Log in to continue your TypeCrisp journey.</p>
          </div>

          <form className="auth-form" onSubmit={formik.handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="userName_or_email">Username or Email</label>
              <input
                className="auth-input"
                id="userName_or_email"
                name="userName_or_email"
                type="text"
                placeholder="pro_typer_24 or name@typecrisp.com"
                value={formik.values.userName_or_email}
                onChange={formik.handleChange}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <input
                className="auth-input"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
            </div>

            <motion.button
              className="auth-submit"
              type="submit"
              disabled={isAuthPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isAuthPending ? 'Logging in...' : 'Log In'}
            </motion.button>
          </form>

          <div className="auth-divider"><span>Or continue with</span></div>

          <div className="auth-social auth-social--center">
            <button className="auth-social-btn" type="button">
              <img src="https://www.google.com/favicon.ico" alt="Google" referrerPolicy="no-referrer" />
              Google
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account?
            <a href="/SignUp">Sign up</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
