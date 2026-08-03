import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/createcompany.css";

const CreateCompany = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      newErrors.password = "Password must contain at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      JSON.stringify(formData),
    );

    navigate("/choose-plan");
  };

  return (
    <main className="create-company-page">
      <section className="create-company-container">
        <div className="registration-stepper">
          <div className="registration-step active">
            <span>1</span>
            <p>Company Details</p>
          </div>

          <div className="registration-step-line"></div>

          <div className="registration-step">
            <span>2</span>
            <p>Choose Plan</p>
          </div>

          <div className="registration-step-line"></div>

          <div className="registration-step">
            <span>3</span>
            <p>Payment</p>
          </div>
        </div>

        <div className="create-company-header">
          <span className="create-company-badge">
            🚀 BillFlow Pro Setup
          </span>

          <h1>Create your company account</h1>

          <p>
            Enter your business and owner details to setup your smart billing workspace.
          </p>
        </div>

        <form className="create-company-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <div className="form-section-heading">
              <span className="section-number">01</span>

              <div>
                <h2>Company Details</h2>
                <p>Tell us about your business establishment.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>

                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Apex Retail Ventures"
                />

                {errors.companyName && (
                  <span className="field-error">
                    {errors.companyName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="businessType">Business Type</label>

                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                >
                  <option value="">Select business type</option>
                  <option value="retail">Retail Shop</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="electronics">Electronics</option>
                  <option value="textile">Textile</option>
                  <option value="other">Other</option>
                </select>

                {errors.businessType && (
                  <span className="field-error">
                    {errors.businessType}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gstNumber">
                  GST Number <span>(Optional)</span>
                </label>

                <input
                  id="gstNumber"
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="address">Company Address</label>

                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete business street address, city, and pin code"
                  rows="4"
                />

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
              <span className="section-number">02</span>

              <div>
                <h2>Owner Credentials</h2>
                <p>Setup administrative access for the workspace owner.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="ownerName">Owner Name</label>

                <input
                  id="ownerName"
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />

                {errors.ownerName && (
                  <span className="field-error">
                    {errors.ownerName}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="owner@business.com"
                />

                {errors.email && (
                  <span className="field-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                />

                {errors.phone && (
                  <span className="field-error">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>

                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                  />

                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
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

                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
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
                        (previous) => !previous,
                      )
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
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
              Already registered?{" "}
              <button
                type="button"
                className="login-link-button"
                onClick={() => navigate("/login")}
              >
                Login to Dashboard
              </button>
            </p>

            <button
              type="submit"
              className="continue-plan-button"
            >
              Continue to Plan →
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default CreateCompany;