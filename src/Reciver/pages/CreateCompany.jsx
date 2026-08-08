import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUser,
  FiZap,
} from "react-icons/fi";

import "../styles/createcompany.css";

const CreateCompany = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    gstNumber: "",
    address: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Company address is required";
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must contain at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Confirm password is required";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    sessionStorage.setItem(
      "billFlowCompanyRegistration",
      JSON.stringify(formData)
    );

    navigate("/choose-plan");
  };

  return (
    <main className="create-company-page">
      <header className="create-company-topbar">
        <button
          type="button"
          className="create-company-brand"
          onClick={() => navigate("/")}
        >
          <span>
            <FiZap />
          </span>

          <div>
            <strong>
              Bill<span>Flow</span>
            </strong>

            <small>Business Setup</small>
          </div>
        </button>

        <button
          type="button"
          className="create-company-back-btn"
          onClick={() => navigate("/")}
        >
          <FiArrowLeft />
          Back to Home
        </button>
      </header>

      <section className="create-company-container">
        <div className="registration-stepper">
          <div className="registration-step active">
            <span>
              <FiCheck />
            </span>

            <p>Company Details</p>
          </div>

          <div className="registration-step-line active" />

          <div className="registration-step">
            <span>2</span>
            <p>Choose Plan</p>
          </div>

          <div className="registration-step-line" />

          <div className="registration-step">
            <span>3</span>
            <p>Payment</p>
          </div>
        </div>

        <div className="create-company-layout">
          <aside className="create-company-info-panel">
            <span className="create-company-info-tag">
              Setup your workspace
            </span>

            <h1>
              Start your business with
              <span> BillFlow.</span>
            </h1>

            <p>
              Tell us about your business and create your owner
              account. Your information will be used to set up
              your billing workspace.
            </p>

            <div className="create-company-benefits">
              <div>
                <span>
                  <FiBriefcase />
                </span>

                <div>
                  <strong>Business Workspace</strong>
                  <p>
                    Products, billing, customers and inventory
                    in one place.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  <FiShield />
                </span>

                <div>
                  <strong>Secure Access</strong>
                  <p>
                    Owner credentials are used to protect your
                    company workspace.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  <FiZap />
                </span>

                <div>
                  <strong>Quick Setup</strong>
                  <p>
                    Complete your company setup and move
                    directly to plan selection.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="create-company-form-card">
            <div className="create-company-form-heading">
              <span>Step 1 of 3</span>

              <h2>Create your company</h2>

              <p>
                Enter your business and owner information below.
              </p>
            </div>

            <form
              className="create-company-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <section className="form-section">
                <div className="form-section-heading">
                  <span className="section-number">
                    01
                  </span>

                  <div>
                    <h3>Business Details</h3>

                    <p>
                      Basic information about your company.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="companyName">
                      Company Name
                    </label>

                    <div
                      className={`create-company-input ${
                        errors.companyName ? "error" : ""
                      }`}
                    >
                      <FiBriefcase />

                      <input
                        id="companyName"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g. Apex Retail Ventures"
                      />
                    </div>

                    {errors.companyName && (
                      <span className="field-error">
                        {errors.companyName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="businessType">
                      Business Type
                    </label>

                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={
                        errors.businessType ? "error" : ""
                      }
                    >
                      <option value="">
                        Select business type
                      </option>

                      <option value="retail">
                        Retail Shop
                      </option>

                      <option value="wholesale">
                        Wholesale
                      </option>

                      <option value="supermarket">
                        Supermarket
                      </option>

                      <option value="pharmacy">
                        Pharmacy
                      </option>

                      <option value="restaurant">
                        Restaurant
                      </option>

                      <option value="electronics">
                        Electronics
                      </option>

                      <option value="textile">
                        Textile
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>

                    {errors.businessType && (
                      <span className="field-error">
                        {errors.businessType}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gstNumber">
                      GST Number
                      <span> Optional</span>
                    </label>

                    <input
                      id="gstNumber"
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      className="create-company-basic-input"
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label htmlFor="address">
                      Company Address
                    </label>

                    <div
                      className={`create-company-textarea ${
                        errors.address ? "error" : ""
                      }`}
                    >
                      <FiMapPin />

                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter complete business street address, city and pin code"
                        rows="4"
                      />
                    </div>

                    {errors.address && (
                      <span className="field-error">
                        {errors.address}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-heading">
                  <span className="section-number">
                    02
                  </span>

                  <div>
                    <h3>Owner Account</h3>

                    <p>
                      Credentials used to access your workspace.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="ownerName">
                      Owner Name
                    </label>

                    <div
                      className={`create-company-input ${
                        errors.ownerName ? "error" : ""
                      }`}
                    >
                      <FiUser />

                      <input
                        id="ownerName"
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder="Enter full name"
                      />
                    </div>

                    {errors.ownerName && (
                      <span className="field-error">
                        {errors.ownerName}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      Email Address
                    </label>

                    <div
                      className={`create-company-input ${
                        errors.email ? "error" : ""
                      }`}
                    >
                      <FiMail />

                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="owner@business.com"
                      />
                    </div>

                    {errors.email && (
                      <span className="field-error">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <div
                      className={`create-company-input ${
                        errors.phone ? "error" : ""
                      }`}
                    >
                      <FiPhone />

                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />
                    </div>

                    {errors.phone && (
                      <span className="field-error">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      Password
                    </label>

                    <div
                      className={`create-company-input password-input-wrapper ${
                        errors.password ? "error" : ""
                      }`}
                    >
                      <FiLock />

                      <input
                        id="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 6 characters"
                      />

                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
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
                      <span className="field-error">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      Confirm Password
                    </label>

                    <div
                      className={`create-company-input password-input-wrapper ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                    >
                      <FiLock />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                      />

                      <button
                        type="button"
                        className="password-toggle-button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (previous) => !previous
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff />
                        ) : (
                          <FiEye />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <span className="field-error">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <div className="form-footer">
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="login-link-button"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </button>
                </p>

                <button
                  type="submit"
                  className="continue-plan-button"
                >
                  Continue to Plan
                  <FiArrowRight />
                </button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
};

export default CreateCompany;