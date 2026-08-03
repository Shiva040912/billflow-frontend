import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";

import { providerLogin } from "../services/auth";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email ID is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email ID";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoggingIn(true);

      const response = await providerLogin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      localStorage.setItem(
        "billFlowProviderAccessToken",
        response.access_token
      );

      localStorage.setItem(
        "billFlowProviderUser",
        JSON.stringify(response.user)
      );

      toast.success(response.message || "Login successful");

      navigate("/provider/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to login. Try again."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="provider-login-page">
      <section className="provider-login-card">
        <div className="provider-login-brand">
          <div className="provider-login-logo">B</div>

          <div>
            <h1>BillFlow</h1>
            <p>Provider Administration</p>
          </div>
        </div>

        <div className="provider-login-heading">
          <span>Secure Access</span>
          <h2>Welcome back</h2>
          <p>Login to manage the BillFlow platform.</p>
        </div>

        <form className="provider-login-form" onSubmit={handleSubmit}>
          <div className="provider-form-group">
            <label htmlFor="email">Email ID</label>

            <div
              className={`provider-input-wrapper ${
                errors.email ? "provider-input-error" : ""
              }`}
            >
              <FiMail />

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email ID"
                autoComplete="email"
              />
            </div>

            {errors.email && (
              <small className="provider-error-message">
                {errors.email}
              </small>
            )}
          </div>

          <div className="provider-form-group">
            <label htmlFor="password">Password</label>

            <div
              className={`provider-input-wrapper ${
                errors.password ? "provider-input-error" : ""
              }`}
            >
              <FiLock />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="provider-password-toggle"
                onClick={() =>
                  setShowPassword((currentValue) => !currentValue)
                }
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {errors.password && (
              <small className="provider-error-message">
                {errors.password}
              </small>
            )}
          </div>

          <button
            type="submit"
            className="provider-login-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="provider-login-footer">
          BillFlow Provider Management System
        </p>
      </section>
    </main>
  );
};

export default Login;