import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import {
  FiAlertTriangle,
  FiBell,
  FiBriefcase,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiGlobe,
  FiPackage,
  FiPrinter,
  FiSave,
  FiSettings,
  FiShield,
  FiUser,
} from "react-icons/fi";

import "../styles/settings.css";

const INITIAL_SETTINGS = {
  companyName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  gstNumber: "",
  companyLogo: "",

  invoicePrefix: "INV",
  nextInvoiceNumber: 1,
  defaultGstRate: 0,
  currency: "INR",
  invoiceFooter: "",
  termsAndConditions: "",
  upiId: "",

  paymentMethods: {
    cash: true,
    upi: true,
    card: true,
    credit: true,
  },

  printerType: "thermal",
  paperSize: "80mm",
  printLayout: "compact",
  autoPrintAfterBilling: false,
  printCopies: 1,
  printFontSize: "medium",
  showLogoOnInvoice: true,
  showGstBreakdown: true,
  showCustomerAddress: true,
  showTermsOnInvoice: true,

  defaultLowStockAlert: 5,
  allowNegativeStock: false,
  defaultProductUnit: "pcs",

  lowStockNotifications: true,
  dailySalesSummary: false,
  emailNotifications: true,

  theme: "light",
  language: "en-IN",
  dateFormat: "DD/MM/YYYY",
  timezone: "Asia/Kolkata",

  planName: "",
  planAmount: 0,
  subscriptionStatus: "",
};

const Settings = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await api.get(
          "/company/settings",
        );

        setSettings((currentSettings) => ({
          ...currentSettings,
          ...response.data,

          paymentMethods: {
            ...currentSettings.paymentMethods,
            ...(response.data.paymentMethods || {}),
          },
        }));
      } catch (error) {
        console.error("Settings fetch error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("billFlowAccessToken");
          localStorage.removeItem("billFlowUser");
          localStorage.removeItem("billFlowCompany");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load settings.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSuccessMessage("");
    setErrorMessage("");

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePaymentMethodChange = (event) => {
    const { name, checked } = event.target;

    setSuccessMessage("");
    setErrorMessage("");

    setSettings((currentSettings) => ({
      ...currentSettings,

      paymentMethods: {
        ...currentSettings.paymentMethods,
        [name]: checked,
      },
    }));
  };

  const validateSettings = () => {
    if (!settings.companyName.trim()) {
      return "Company name is required.";
    }

    if (!settings.ownerName.trim()) {
      return "Owner name is required.";
    }

    if (!settings.email.trim()) {
      return "Email is required.";
    }

    if (!settings.phone.trim()) {
      return "Phone number is required.";
    }

    if (!settings.address.trim()) {
      return "Company address is required.";
    }

    if (!settings.invoicePrefix.trim()) {
      return "Invoice prefix is required.";
    }

    if (Number(settings.nextInvoiceNumber) < 1) {
      return "Next invoice number must be at least 1.";
    }

    if (
      Number(settings.defaultGstRate) < 0 ||
      Number(settings.defaultGstRate) > 100
    ) {
      return "Default GST must be between 0 and 100.";
    }

    if (Number(settings.defaultLowStockAlert) < 0) {
      return "Low-stock alert cannot be negative.";
    }

    if (
      Number(settings.printCopies) < 1 ||
      Number(settings.printCopies) > 5
    ) {
      return "Print copies must be between 1 and 5.";
    }

    const enabledPaymentMethods = Object.values(
      settings.paymentMethods,
    ).some(Boolean);

    if (!enabledPaymentMethods) {
      return "Enable at least one payment method.";
    }

    return "";
  };

  const handleSave = async () => {
    const validationError = validateSettings();

    if (validationError) {
      setErrorMessage(validationError);
      setSuccessMessage("");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        companyName: settings.companyName.trim(),
        ownerName: settings.ownerName.trim(),
        email: settings.email.trim(),
        phone: settings.phone.trim(),
        address: settings.address.trim(),
        gstNumber: settings.gstNumber.trim(),
        companyLogo: settings.companyLogo.trim(),

        invoicePrefix: settings.invoicePrefix.trim(),
        nextInvoiceNumber: Number(settings.nextInvoiceNumber),
        defaultGstRate: Number(settings.defaultGstRate),
        currency: settings.currency,
        invoiceFooter: settings.invoiceFooter.trim(),
        termsAndConditions:
          settings.termsAndConditions.trim(),
        upiId: settings.upiId.trim(),

        paymentMethods: {
          cash: Boolean(settings.paymentMethods.cash),
          upi: Boolean(settings.paymentMethods.upi),
          card: Boolean(settings.paymentMethods.card),
          credit: Boolean(settings.paymentMethods.credit),
        },

        printerType: settings.printerType,
        paperSize: settings.paperSize,
        printLayout: settings.printLayout,
        autoPrintAfterBilling: Boolean(
          settings.autoPrintAfterBilling,
        ),
        printCopies: Number(settings.printCopies),
        printFontSize: settings.printFontSize,
        showLogoOnInvoice: Boolean(
          settings.showLogoOnInvoice,
        ),
        showGstBreakdown: Boolean(
          settings.showGstBreakdown,
        ),
        showCustomerAddress: Boolean(
          settings.showCustomerAddress,
        ),
        showTermsOnInvoice: Boolean(
          settings.showTermsOnInvoice,
        ),

        defaultLowStockAlert: Number(
          settings.defaultLowStockAlert,
        ),
        allowNegativeStock: Boolean(
          settings.allowNegativeStock,
        ),
        defaultProductUnit:
          settings.defaultProductUnit.trim(),

        lowStockNotifications: Boolean(
          settings.lowStockNotifications,
        ),
        dailySalesSummary: Boolean(
          settings.dailySalesSummary,
        ),
        emailNotifications: Boolean(
          settings.emailNotifications,
        ),

        theme: settings.theme,
        language: settings.language,
        dateFormat: settings.dateFormat,
        timezone: settings.timezone,
      };

      const response = await api.patch(
        "/company/settings",
        payload,
      );

      setSettings((currentSettings) => ({
        ...currentSettings,
        ...response.data.company,

        paymentMethods: {
          ...currentSettings.paymentMethods,
          ...(response.data.company.paymentMethods || {}),
        },
      }));

      localStorage.setItem(
        "billFlowCompany",
        JSON.stringify(response.data.company),
      );

      const storedUser = JSON.parse(
        localStorage.getItem("billFlowUser") || "{}",
      );

      localStorage.setItem(
        "billFlowUser",
        JSON.stringify({
          ...storedUser,
          name: response.data.company.ownerName,
          email: response.data.company.email,
        }),
      );

      setSuccessMessage(
        response.data.message ||
          "Settings updated successfully.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Settings update error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("billFlowAccessToken");
        localStorage.removeItem("billFlowUser");
        localStorage.removeItem("billFlowCompany");

        navigate("/login", {
          replace: true,
        });

        return;
      }

      const backendMessage = error.response?.data?.message;

      setErrorMessage(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage ||
              "Unable to update settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const sections = [
    {
      id: "general",
      title: "General",
      description: "Company and owner information",
      icon: <FiBriefcase />,
    },
    {
      id: "billing",
      title: "Billing",
      description: "Invoice and payment preferences",
      icon: <FiFileText />,
    },
    {
      id: "printing",
      title: "Printing",
      description: "Printer and paper preferences",
      icon: <FiPrinter />,
    },
    {
      id: "inventory",
      title: "Inventory",
      description: "Stock and product defaults",
      icon: <FiPackage />,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Business alerts and summaries",
      icon: <FiBell />,
    },
    {
      id: "appearance",
      title: "Application",
      description: "Theme and regional preferences",
      icon: <FiGlobe />,
    },
    {
      id: "subscription",
      title: "Subscription",
      description: "Current plan information",
      icon: <FiCreditCard />,
    },
  ];

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="settings-loading-state">
          <div className="settings-loading-spinner" />

          <h3>Loading settings</h3>

          <p>Please wait while your preferences are loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <section className="settings-header">
        <div>
          <p className="settings-eyebrow">Configuration</p>

          <h1>Settings</h1>

          <p>
            Manage your company, billing, inventory and
            application preferences.
          </p>
        </div>

        <button
          type="button"
          className="settings-save-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FiSave />

          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </section>

      {errorMessage && (
        <div className="settings-message error">
          <FiAlertTriangle />

          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="settings-message success">
          <FiCheckCircle />

          <span>{successMessage}</span>
        </div>
      )}

      <section className="settings-layout">
        <aside className="settings-navigation">
          <div className="settings-navigation-heading">
            <FiSettings />

            <div>
              <strong>Preferences</strong>
              <span>Select a section</span>
            </div>
          </div>

          <div className="settings-navigation-list">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={
                  activeSection === section.id
                    ? "settings-navigation-item active"
                    : "settings-navigation-item"
                }
                onClick={() =>
                  setActiveSection(section.id)
                }
              >
                <span className="settings-navigation-icon">
                  {section.icon}
                </span>

                <span className="settings-navigation-text">
                  <strong>{section.title}</strong>
                  <small>{section.description}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="settings-content">
          {activeSection === "general" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <FiBriefcase />
                </div>

                <div>
                  <h2>General Settings</h2>
                  <p>
                    Update company and owner information.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="companyName">
                    Company Name
                  </label>

                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={settings.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="ownerName">
                    Owner Name
                  </label>

                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    value={settings.ownerName}
                    onChange={handleChange}
                    placeholder="Enter owner name"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="email">
                    Company Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={settings.email}
                    onChange={handleChange}
                    placeholder="Enter company email"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={settings.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="gstNumber">
                    GST Number
                  </label>

                  <input
                    id="gstNumber"
                    name="gstNumber"
                    type="text"
                    value={settings.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="companyLogo">
                    Company Logo URL
                  </label>

                  <input
                    id="companyLogo"
                    name="companyLogo"
                    type="text"
                    value={settings.companyLogo}
                    onChange={handleChange}
                    placeholder="Enter logo URL"
                  />
                </div>

                <div className="settings-field full-width">
                  <label htmlFor="address">
                    Company Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows="4"
                    value={settings.address}
                    onChange={handleChange}
                    placeholder="Enter company address"
                  />
                </div>
              </div>
            </section>
          )}

          {activeSection === "billing" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <FiFileText />
                </div>

                <div>
                  <h2>Billing Settings</h2>
                  <p>
                    Configure invoices, GST and payment
                    methods.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="invoicePrefix">
                    Invoice Prefix
                  </label>

                  <input
                    id="invoicePrefix"
                    name="invoicePrefix"
                    type="text"
                    value={settings.invoicePrefix}
                    onChange={handleChange}
                    placeholder="INV"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="nextInvoiceNumber">
                    Next Invoice Number
                  </label>

                  <input
                    id="nextInvoiceNumber"
                    name="nextInvoiceNumber"
                    type="number"
                    min="1"
                    value={settings.nextInvoiceNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="defaultGstRate">
                    Default GST Rate
                  </label>

                  <div className="settings-input-with-icon">
                    <input
                      id="defaultGstRate"
                      name="defaultGstRate"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.defaultGstRate}
                      onChange={handleChange}
                    />

                    <FiDollarSign />
                  </div>
                </div>

                <div className="settings-field">
                  <label htmlFor="currency">
                    Currency
                  </label>

                  <select
                    id="currency"
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                  >
                    <option value="INR">
                      Indian Rupee — INR
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="upiId">
                    UPI ID
                  </label>

                  <input
                    id="upiId"
                    name="upiId"
                    type="text"
                    value={settings.upiId}
                    onChange={handleChange}
                    placeholder="company@upi"
                  />
                </div>

                <div className="settings-field">
                  <label>Payment Methods</label>

                  <div className="settings-checkbox-group">
                    {[
                      ["cash", "Cash"],
                      ["upi", "UPI"],
                      ["card", "Card"],
                      ["credit", "Credit"],
                    ].map(([name, label]) => (
                      <label
                        className="settings-checkbox-card"
                        key={name}
                      >
                        <input
                          type="checkbox"
                          name={name}
                          checked={
                            settings.paymentMethods[name]
                          }
                          onChange={
                            handlePaymentMethodChange
                          }
                        />

                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="settings-field full-width">
                  <label htmlFor="invoiceFooter">
                    Invoice Footer
                  </label>

                  <textarea
                    id="invoiceFooter"
                    name="invoiceFooter"
                    rows="3"
                    value={settings.invoiceFooter}
                    onChange={handleChange}
                    placeholder="Thank you for your business."
                  />
                </div>

                <div className="settings-field full-width">
                  <label htmlFor="termsAndConditions">
                    Terms and Conditions
                  </label>

                  <textarea
                    id="termsAndConditions"
                    name="termsAndConditions"
                    rows="5"
                    value={settings.termsAndConditions}
                    onChange={handleChange}
                    placeholder="Enter invoice terms and conditions"
                  />
                </div>
              </div>
            </section>
          )}


          {activeSection === "printing" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <FiPrinter />
                </div>

                <div>
                  <h2>Print Settings</h2>

                  <p>
                    Configure printer type, paper size and
                    invoice print preferences.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="printerType">
                    Printer Type
                  </label>

                  <select
                    id="printerType"
                    name="printerType"
                    value={settings.printerType}
                    onChange={handleChange}
                  >
                    <option value="thermal">
                      Thermal Printer
                    </option>

                    <option value="regular">
                      Regular Printer
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="paperSize">
                    Paper Size
                  </label>

                  <select
                    id="paperSize"
                    name="paperSize"
                    value={settings.paperSize}
                    onChange={handleChange}
                  >
                    <option value="58mm">
                      58mm Thermal
                    </option>

                    <option value="80mm">
                      80mm Thermal
                    </option>

                    <option value="A4">
                      A4 Invoice
                    </option>

                    <option value="A5">
                      A5 Invoice
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="printLayout">
                    Print Layout
                  </label>

                  <select
                    id="printLayout"
                    name="printLayout"
                    value={settings.printLayout}
                    onChange={handleChange}
                  >
                    <option value="compact">
                      Compact
                    </option>

                    <option value="detailed">
                      Detailed
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="printFontSize">
                    Print Font Size
                  </label>

                  <select
                    id="printFontSize"
                    name="printFontSize"
                    value={settings.printFontSize}
                    onChange={handleChange}
                  >
                    <option value="small">
                      Small
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="large">
                      Large
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="printCopies">
                    Number of Copies
                  </label>

                  <input
                    id="printCopies"
                    name="printCopies"
                    type="number"
                    min="1"
                    max="5"
                    value={settings.printCopies}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-print-preview">
                  <span>Selected Format</span>

                  <strong>{settings.paperSize}</strong>

                  <small>
                    {settings.printerType === "thermal"
                      ? "Thermal receipt format"
                      : "Regular invoice format"}
                  </small>
                </div>

                <div className="settings-toggle-card full-width">
                  <div>
                    <strong>
                      Auto Print After Billing
                    </strong>

                    <span>
                      Automatically open the print dialog after
                      a bill is completed.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="autoPrintAfterBilling"
                      checked={
                        settings.autoPrintAfterBilling
                      }
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>

                <div className="settings-toggle-card full-width">
                  <div>
                    <strong>Show Company Logo</strong>

                    <span>
                      Display the company logo on printed
                      invoices.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="showLogoOnInvoice"
                      checked={
                        settings.showLogoOnInvoice
                      }
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>

                <div className="settings-toggle-card full-width">
                  <div>
                    <strong>Show GST Breakdown</strong>

                    <span>
                      Display taxable amount and GST details
                      separately.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="showGstBreakdown"
                      checked={
                        settings.showGstBreakdown
                      }
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>

                <div className="settings-toggle-card full-width">
                  <div>
                    <strong>
                      Show Customer Address
                    </strong>

                    <span>
                      Display customer address on the printed
                      invoice.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="showCustomerAddress"
                      checked={
                        settings.showCustomerAddress
                      }
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>

                <div className="settings-toggle-card full-width">
                  <div>
                    <strong>
                      Show Terms and Conditions
                    </strong>

                    <span>
                      Include saved terms and conditions on
                      invoices.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="showTermsOnInvoice"
                      checked={
                        settings.showTermsOnInvoice
                      }
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>
              </div>
            </section>
          )}

          {activeSection === "inventory" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <FiPackage />
                </div>

                <div>
                  <h2>Inventory Settings</h2>
                  <p>
                    Configure stock alerts and product
                    defaults.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="defaultLowStockAlert">
                    Default Low-Stock Alert
                  </label>

                  <input
                    id="defaultLowStockAlert"
                    name="defaultLowStockAlert"
                    type="number"
                    min="0"
                    value={settings.defaultLowStockAlert}
                    onChange={handleChange}
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="defaultProductUnit">
                    Default Product Unit
                  </label>

                  <select
                    id="defaultProductUnit"
                    name="defaultProductUnit"
                    value={settings.defaultProductUnit}
                    onChange={handleChange}
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilogram</option>
                    <option value="g">Gram</option>
                    <option value="litre">Litre</option>
                    <option value="ml">Millilitre</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>

                <div className="settings-toggle-card full-width">
                  <div>
                    <strong>Allow Negative Stock</strong>

                    <span>
                      Permit billing when available stock is
                      insufficient.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="allowNegativeStock"
                      checked={settings.allowNegativeStock}
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>
              </div>
            </section>
          )}

          {activeSection === "notifications" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <FiBell />
                </div>

                <div>
                  <h2>Notification Settings</h2>
                  <p>
                    Control alerts and business summaries.
                  </p>
                </div>
              </div>

              <div className="settings-toggle-list">
                <div className="settings-toggle-card">
                  <div>
                    <strong>Low-Stock Notifications</strong>

                    <span>
                      Receive alerts when products reach their
                      stock limit.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="lowStockNotifications"
                      checked={
                        settings.lowStockNotifications
                      }
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>

                <div className="settings-toggle-card">
                  <div>
                    <strong>Daily Sales Summary</strong>

                    <span>
                      Receive a daily business sales summary.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="dailySalesSummary"
                      checked={settings.dailySalesSummary}
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>

                <div className="settings-toggle-card">
                  <div>
                    <strong>Email Notifications</strong>

                    <span>
                      Allow BillFlow to send business
                      notifications through email.
                    </span>
                  </div>

                  <label className="settings-switch">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={
                        settings.emailNotifications
                      }
                      onChange={handleChange}
                    />

                    <span className="settings-switch-slider" />
                  </label>
                </div>
              </div>
            </section>
          )}

          {activeSection === "appearance" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <FiGlobe />
                </div>

                <div>
                  <h2>Application Settings</h2>
                  <p>
                    Configure appearance and regional
                    preferences.
                  </p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label htmlFor="theme">Theme</label>

                  <select
                    id="theme"
                    name="theme"
                    value={settings.theme}
                    onChange={handleChange}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">
                      System Default
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="language">
                    Language
                  </label>

                  <select
                    id="language"
                    name="language"
                    value={settings.language}
                    onChange={handleChange}
                  >
                    <option value="en-IN">
                      English — India
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="dateFormat">
                    Date Format
                  </label>

                  <select
                    id="dateFormat"
                    name="dateFormat"
                    value={settings.dateFormat}
                    onChange={handleChange}
                  >
                    <option value="DD/MM/YYYY">
                      DD/MM/YYYY
                    </option>

                    <option value="MM/DD/YYYY">
                      MM/DD/YYYY
                    </option>

                    <option value="YYYY-MM-DD">
                      YYYY-MM-DD
                    </option>
                  </select>
                </div>

                <div className="settings-field">
                  <label htmlFor="timezone">
                    Timezone
                  </label>

                  <select
                    id="timezone"
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                  >
                    <option value="Asia/Kolkata">
                      Asia/Kolkata
                    </option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {activeSection === "subscription" && (
            <section className="settings-section">
              <div className="settings-section-header">
                <div className="settings-section-icon">
                  <FiShield />
                </div>

                <div>
                  <h2>Subscription</h2>
                  <p>
                    View your current BillFlow subscription
                    details.
                  </p>
                </div>
              </div>

              <div className="subscription-card">
                <div className="subscription-card-top">
                  <div>
                    <span className="subscription-label">
                      Current Plan
                    </span>

                    <h3>
                      {settings.planName || "No Plan"}
                    </h3>
                  </div>

                  <span
                    className={`subscription-status ${
                      settings.subscriptionStatus ||
                      "inactive"
                    }`}
                  >
                    {settings.subscriptionStatus ||
                      "Inactive"}
                  </span>
                </div>

                <div className="subscription-price">
                  <strong>
                    {formatCurrency(settings.planAmount)}
                  </strong>

                  <span>Current subscription amount</span>
                </div>

                <div className="subscription-details">
                  <div>
                    <FiUser />

                    <span>
                      Owner: {settings.ownerName}
                    </span>
                  </div>

                  <div>
                    <FiCreditCard />

                    <span>
                      Status:{" "}
                      {settings.subscriptionStatus ||
                        "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <div className="settings-mobile-save">
        <button
          type="button"
          className="settings-save-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FiSave />

          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Settings;