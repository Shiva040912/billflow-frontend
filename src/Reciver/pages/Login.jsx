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

import api from "../services/axios";

import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoggingIn, setIsLoggingIn] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
      general: "",
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    const email =
      formData.email.trim();

    const password =
      formData.password;

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      validationErrors.email =
        "Email is required";
    } else if (
      !emailPattern.test(email)
    ) {
      validationErrors.email =
        "Enter a valid email address";
    }

    if (!password) {
      validationErrors.password =
        "Password is required";
    } else if (
      password.length < 6
    ) {
      validationErrors.password =
        "Password must be at least 6 characters";
    }

    setErrors(
      validationErrors
    );

    return (
      Object.keys(
        validationErrors
      ).length === 0
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoggingIn(true);
      setErrors({});

      const response =
        await api.post(
          "/auth/login",
          {
            email:
              formData.email
                .trim()
                .toLowerCase(),

            password:
              formData.password,
          }
        );

      const responseData =
        response.data;

      if (
        !responseData?.accessToken ||
        !responseData?.user
      ) {
        throw new Error(
          "Login response incomplete-ah irukku"
        );
      }

      localStorage.setItem(
        "billFlowAccessToken",
        responseData.accessToken
      );

      localStorage.setItem(
        "billFlowUser",
        JSON.stringify(
          responseData.user
        )
      );

      if (
        responseData.company
      ) {
        localStorage.setItem(
          "billFlowCompany",
          JSON.stringify(
            responseData.company
          )
        );
      }

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      const backendMessage =
        error.response?.data
          ?.message;

      const errorMessage =
        Array.isArray(
          backendMessage
        )
          ? backendMessage[0]
          : backendMessage ||
            error.message ||
            "Unable to login. Try again.";

      setErrors({
        general:
          errorMessage,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <button
          type="button"
          className="login-brand"
          onClick={() =>
            navigate("/")
          }
        >
          <span className="login-brand-mark">
            <FiZap />
          </span>

          <span className="login-brand-copy">
            <strong>
              Bill<span>Flow</span>
            </strong>

            <small>
              Business Workspace
            </small>
          </span>
        </button>

        <div className="login-heading">
          <span className="login-badge">
            Secure Login
          </span>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to continue
            managing your billing
            and business.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          {errors.general && (
            <div
              className="login-error-banner"
              role="alert"
            >
              {
                errors.general
              }
            </div>
          )}

          <div className="login-field">
            <label
              htmlFor="email"
            >
              Email Address
            </label>

            <div
              className={`login-input-wrapper ${
                errors.email
                  ? "error"
                  : ""
              }`}
            >
              <FiMail />

              <input
                id="email"
                name="email"
                type="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="owner@company.com"
                autoComplete="email"
                disabled={
                  isLoggingIn
                }
              />
            </div>

            {errors.email && (
              <span className="login-field-error">
                {
                  errors.email
                }
              </span>
            )}
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label
                htmlFor="password"
              >
                Password
              </label>

              <span>
                Owner access
              </span>
            </div>

            <div
              className={`login-input-wrapper ${
                errors.password
                  ? "error"
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
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={
                  isLoggingIn
                }
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (
                      currentValue
                    ) =>
                      !currentValue
                  )
                }
                disabled={
                  isLoggingIn
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
              <span className="login-field-error">
                {
                  errors.password
                }
              </span>
            )}
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={
              isLoggingIn
            }
          >
            {isLoggingIn ? (
              <>
                <span className="login-button-loader" />
                Signing in...
              </>
            ) : (
              <>
                Login to BillFlow
                <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="login-security-note">
          <FiShield />

          <span>
            Secure access to your
            business workspace
          </span>
        </div>

        <div className="login-footer">
          <span>
            New to BillFlow?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/create-company"
              )
            }
            disabled={
              isLoggingIn
            }
          >
            Create Company
          </button>
        </div>
      </section>
    </main>
  );
};

export default Login;