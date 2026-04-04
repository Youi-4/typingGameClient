import { useFormik } from "formik";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthContext } from "../../context/useAuthContext";
import { signUp } from "../../services/registrationApi";
import type { ApiError, SignupRequestDto } from "../../types/api";
import "../Auth/Auth.css";

export function SignUp() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const onSubmit = async (values: SignupRequestDto) => {
    if (!values.user) {
      toast.error("Username is required.");
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(values.user)) {
      toast.error("Username: 3–20 characters, letters/numbers/_ and - only.");
      return;
    }

    if (!values.email) {
      toast.error("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (!values.password) {
      toast.error("Password is required.");
      return;
    }

    if (values.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (values.password.length > 64) {
      toast.error("Password must be 64 characters or fewer.");
      return;
    }

    if (!/[A-Z]/.test(values.password)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(values.password)) {
      toast.error("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(values.password)) {
      toast.error("Password must contain at least one number.");
      return;
    }

    if (!/[@$!%*?&_#^()]/.test(values.password)) {
      toast.error("Password must contain a special character (@$!%*?&_#^()).");
      return;
    }

    try {
      await signUp(values);
      await login({ userName_or_email: values.email, password: values.password });
      toast.success("Signed up successfully");
      navigate("/Home");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(
        `Sign up failed: ${error.response?.data?.error ?? error.response?.data?.message ?? "Unknown error"}`
      );
    }
  };

  const formik = useFormik({
    initialValues: { email: "", password: "", verified: true, user: "" },
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
            <h1 className="auth-title">Join the Circuit</h1>
            <p className="auth-subtitle">Master your precision and speed with TypeCrisp.</p>
          </div>

          <form className="auth-form" onSubmit={formik.handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="user">Username</label>
              <input
                className="auth-input"
                id="user"
                name="user"
                type="text"
                placeholder="pro_typer_24"
                value={formik.values.user}
                onChange={formik.handleChange}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">Email Address</label>
              <input
                className="auth-input"
                id="email"
                name="email"
                type="text"
                placeholder="name@typecrisp.com"
                value={formik.values.email}
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
                placeholder="Create a password"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
            </div>

            <motion.button
              className="auth-submit"
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>
          </form>

          <div className="auth-divider"><span>Or continue with</span></div>

          <div className="auth-social auth-social--center">
            <button
              className="auth-social-btn"
              type="button"
              onClick={() => {
                window.location.href = `${(import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "")}/api/auth/google`;
              }}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" referrerPolicy="no-referrer" />
              Google
            </button>
          </div>

          <p className="auth-footer">
            Already have an account?
            <Link to="/Login">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUp;
