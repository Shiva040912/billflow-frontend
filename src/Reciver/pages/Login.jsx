import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    const email = formData.email.trim();
    const password = formData.password;

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      validationErrors.email =
        "Email is required";
    } else if (!emailPattern.test(email)) {
      validationErrors.email =
        "Valid email address enter pannu";
    }

    if (!password) {
      validationErrors.password =
        "Password is required";
    } else if (password.length < 6) {
      validationErrors.password =
        "Password minimum 6 characters irukanum";
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors).length === 0
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoggingIn(true);
      setErrors({});

      const response = await api.post(
        "/auth/login",
        {
          email: formData.email
            .trim()
            .toLowerCase(),

          password: formData.password,
        },
      );

      const responseData = response.data;

      if (
        !responseData?.accessToken ||
        !responseData?.user
      ) {
        throw new Error(
          "Login response incomplete-ah irukku",
        );
      }

      localStorage.setItem(
        "billFlowAccessToken",
        responseData.accessToken,
      );

      localStorage.setItem(
        "billFlowUser",
        JSON.stringify(responseData.user),
      );

      if (responseData.company) {
        localStorage.setItem(
          "billFlowCompany",
          JSON.stringify(
            responseData.company,
          ),
        );
      }

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error,
      );

      const backendMessage =
        error.response?.data?.message;

      const errorMessage =
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage ||
            error.message ||
            "Login panna mudiyala. Try again.";

      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">
            BF
          </span>

          <div>
            <h1>BillFlow</h1>

            <p>
              Billing & Business Management
            </p>
          </div>
        </div>

        <div className="login-heading">
          <span className="login-badge">
            Secure account access
          </span>

          <h2>Welcome back</h2>

          <p>
            Unga company dashboard access panna
            login pannunga.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {errors.general && (
            <div
              className="login-error-banner"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="owner@company.com"
              autoComplete="email"
              disabled={isLoggingIn}
            />

            {errors.email && (
              <p className="login-field-error">
                {errors.email}
              </p>
            )}
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="login-password-wrapper">
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
                disabled={isLoggingIn}
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (currentValue) =>
                      !currentValue,
                  )
                }
                disabled={isLoggingIn}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>
            </div>

            {errors.password && (
              <p className="login-field-error">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={isLoggingIn}
          >
            {isLoggingIn
              ? "Logging in..."
              : "Login to BillFlow"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            New company account create
            pannanuma?
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/create-company",
              )
            }
            disabled={isLoggingIn}
          >
            Create Company
          </button>
        </div>
      </section>
    </main>
  );
};

export default Login;