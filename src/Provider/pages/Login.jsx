import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiZap,
} from "react-icons/fi";

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

      console.log("Provider login response:", response);

      const accessToken =
        response.accessToken ||
        response.access_token ||
        response.token ||
        response.data?.accessToken ||
        response.data?.access_token ||
        response.data?.token;

      const providerUser =
        response.user ||
        response.data?.user;

      if (!accessToken) {
        throw new Error(
          "Access token was not found in login response"
        );
      }

      if (!providerUser) {
        throw new Error(
          "Provider user was not found in login response"
        );
      }

      localStorage.setItem(
        "billFlowProviderAccessToken",
        accessToken
      );

      localStorage.setItem(
        "billFlowProviderUser",
        JSON.stringify(providerUser)
      );

      toast.success(
        response.message ||
          response.data?.message ||
          "Login successful"
      );

      navigate("/provider/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Provider login error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Try again."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="provider-login-page">
      <section className="provider-login-visual">
        <div className="provider-login-visual-content">
          <div className="provider-login-main-brand">
            <div className="provider-login-main-logo">
              <FiZap />
            </div>

            <div>
              <h1>
                Bill<span>Flow</span>
              </h1>

              <p>Provider Console</p>
            </div>
          </div>

          <div className="provider-login-visual-copy">
            <span className="provider-login-visual-tag">
              Provider Management
            </span>

            <h2>
              Run your entire
              <br />
              platform from one
              <br />
              secure workspace.
            </h2>

            <p>
              Manage companies, subscriptions, payments,
              employees and support operations from the
              BillFlow provider console.
            </p>
          </div>

          <div className="provider-login-visual-footer">
            <FiShield />

            <span>
              Protected provider administration
            </span>
          </div>
        </div>

        <div className="provider-login-decoration provider-login-decoration-one" />
        <div className="provider-login-decoration provider-login-decoration-two" />
      </section>

      <section className="provider-login-form-side">
        <div className="provider-login-mobile-brand">
          <div className="provider-login-mobile-logo">
            <FiZap />
          </div>

          <div>
            <strong>
              Bill<span>Flow</span>
            </strong>

            <small>Provider Console</small>
          </div>
        </div>

        <div className="provider-login-card">
          <div className="provider-login-heading">
            <span>Secure access</span>

            <h2>Welcome back</h2>

            <p>
              Enter your provider credentials to continue
              to your workspace.
            </p>
          </div>

          <form
            className="provider-login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="provider-form-group">
              <label htmlFor="email">
                Email address
              </label>

              <div
                className={`provider-input-wrapper ${
                  errors.email
                    ? "provider-input-error"
                    : ""
                }`}
              >
                <FiMail />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
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
              <div className="provider-password-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <span>Provider access only</span>
              </div>

              <div
                className={`provider-input-wrapper ${
                  errors.password
                    ? "provider-input-error"
                    : ""
                }`}
              >
                <FiLock />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="provider-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (currentValue) => !currentValue
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
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
              <span>
                {isLoggingIn
                  ? "Signing in..."
                  : "Sign in to BillFlow"}
              </span>

              {!isLoggingIn && <FiArrowRight />}

              {isLoggingIn && (
                <span className="provider-login-button-loader" />
              )}
            </button>
          </form>

          <div className="provider-login-security">
            <FiShield />

            <div>
              <strong>Secure provider login</strong>

              <span>
                Your session is protected and restricted
                to authorised provider accounts.
              </span>
            </div>
          </div>
        </div>

        <p className="provider-login-footer">
          BillFlow Provider Management System
        </p>
      </section>
    </main>
  );
};

export default Login;