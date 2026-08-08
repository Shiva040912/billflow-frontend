import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiBarChart2,
  FiBox,
  FiCheck,
  FiCreditCard,
  FiFileText,
  FiPackage,
  FiShield,
  FiShoppingBag,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import "../styles/home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/create-company");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <main className="home-page">
      <header className="home-navbar">
        <button
          type="button"
          className="home-brand"
          onClick={() => navigate("/")}
        >
          <span className="home-brand-logo">
            <FiZap />
          </span>

          <span className="home-brand-content">
            <strong>
              Bill<span>Flow</span>
            </strong>

            <small>Smart Business Billing</small>
          </span>
        </button>

        <nav className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
        </nav>

        <div className="home-nav-actions">
          <button
            type="button"
            className="home-login-button"
            onClick={handleLogin}
          >
            Login
          </button>

          <button
            type="button"
            className="home-start-button"
            onClick={handleGetStarted}
          >
            Start Free
            <FiArrowRight />
          </button>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <span className="home-hero-badge-dot" />
            Built for growing businesses
          </div>

          <h1>
            Billing that keeps your
            <span> business moving.</span>
          </h1>

          <p>
            Create invoices, manage products, track stock,
            maintain customers and understand your sales —
            all from one simple workspace built for everyday
            business.
          </p>

          <div className="home-hero-actions">
            <button
              type="button"
              className="home-primary-button"
              onClick={handleGetStarted}
            >
              Start your business
              <FiArrowRight />
            </button>

            <button
              type="button"
              className="home-secondary-button"
              onClick={handleLogin}
            >
              Login to dashboard
            </button>
          </div>

          <div className="home-hero-points">
            <span>
              <FiCheck />
              Quick setup
            </span>

            <span>
              <FiCheck />
              Secure payments
            </span>

            <span>
              <FiCheck />
              Easy billing
            </span>
          </div>
        </div>

        <div className="home-dashboard-preview">
          <div className="home-preview-window">
            <div className="home-preview-topbar">
              <div className="home-preview-brand">
                <span>
                  <FiZap />
                </span>

                <strong>BillFlow</strong>
              </div>

              <button type="button">
                Create Bill
              </button>
            </div>

            <div className="home-preview-layout">
              <aside className="home-preview-sidebar">
                <span className="home-preview-menu active">
                  <FiBarChart2 />
                </span>

                <span className="home-preview-menu">
                  <FiFileText />
                </span>

                <span className="home-preview-menu">
                  <FiPackage />
                </span>

                <span className="home-preview-menu">
                  <FiUsers />
                </span>
              </aside>

              <div className="home-preview-main">
                <div className="home-preview-heading">
                  <div>
                    <small>Business Overview</small>
                    <strong>Good morning 👋</strong>
                  </div>

                  <span>Today</span>
                </div>

                <div className="home-preview-stats">
                  <article>
                    <div className="home-preview-stat-icon sales">
                      <FiCreditCard />
                    </div>

                    <span>Today Sales</span>
                    <strong>₹8,640</strong>
                    <small>+12.4%</small>
                  </article>

                  <article>
                    <div className="home-preview-stat-icon orders">
                      <FiShoppingBag />
                    </div>

                    <span>Invoices</span>
                    <strong>24</strong>
                    <small>Today</small>
                  </article>

                  <article>
                    <div className="home-preview-stat-icon stock">
                      <FiBox />
                    </div>

                    <span>Low Stock</span>
                    <strong>3</strong>
                    <small>Products</small>
                  </article>
                </div>

                <div className="home-preview-bottom">
                  <div className="home-preview-chart-card">
                    <div className="home-preview-chart-header">
                      <div>
                        <strong>Sales Overview</strong>
                        <span>Last 7 days</span>
                      </div>

                      <small>₹48.2K</small>
                    </div>

                    <div className="home-preview-chart">
                      <span style={{ height: "36%" }} />
                      <span style={{ height: "52%" }} />
                      <span style={{ height: "45%" }} />
                      <span style={{ height: "68%" }} />
                      <span style={{ height: "58%" }} />
                      <span style={{ height: "84%" }} />
                      <span style={{ height: "72%" }} />
                    </div>
                  </div>

                  <div className="home-preview-stock-card">
                    <strong>Stock Status</strong>

                    <div>
                      <span>Available</span>
                      <b>81</b>
                    </div>

                    <div>
                      <span>Low Stock</span>
                      <b>3</b>
                    </div>

                    <div>
                      <span>Out of Stock</span>
                      <b>0</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="home-floating-card home-floating-sales">
            <span className="home-floating-icon">
              <FiCreditCard />
            </span>

            <div>
              <small>Today&apos;s Sales</small>
              <strong>₹8,640</strong>
            </div>
          </div>

          <div className="home-floating-card home-floating-stock">
            <span className="home-floating-icon stock">
              <FiCheck />
            </span>

            <div>
              <small>Inventory</small>
              <strong>Stock healthy</strong>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="home-features-section"
      >
        <div className="home-section-heading">
          <span>Everything you need</span>

          <h2>
            One workspace for your daily business
          </h2>

          <p>
            BillFlow brings billing, inventory, customers and
            business insights together without making your
            daily work complicated.
          </p>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <div className="home-feature-icon billing">
              <FiFileText />
            </div>

            <h3>Fast Billing</h3>

            <p>
              Create clean professional invoices quickly
              without unnecessary steps.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon inventory">
              <FiPackage />
            </div>

            <h3>Inventory Control</h3>

            <p>
              Keep track of available stock and identify
              low-stock products before they become a problem.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon sales">
              <FiBarChart2 />
            </div>

            <h3>Sales Insights</h3>

            <p>
              Understand sales performance using clear
              business metrics from one dashboard.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon customers">
              <FiUsers />
            </div>

            <h3>Customer Records</h3>

            <p>
              Maintain customer details and purchase history
              in one organized place.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon employees">
              <FiShoppingBag />
            </div>

            <h3>Business Operations</h3>

            <p>
              Manage products, suppliers and daily operations
              without jumping between multiple tools.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon secure">
              <FiShield />
            </div>

            <h3>Secure Platform</h3>

            <p>
              Business access and subscription payments are
              handled through a secure workflow.
            </p>
          </article>
        </div>
      </section>

      <section
        id="pricing"
        className="home-pricing-section"
      >
        <div className="home-pricing-panel">
          <div className="home-pricing-content">
            <span className="home-pricing-label">
              Flexible plans
            </span>

            <h2>
              Start simple. Grow when your business grows.
            </h2>

            <p>
              Create your company, choose the plan that fits
              your business and start managing your daily
              operations with BillFlow.
            </p>
          </div>

          <div className="home-pricing-action">
            <button
              type="button"
              onClick={handleGetStarted}
            >
              Explore plans
              <FiArrowRight />
            </button>

            <span>
              Choose monthly or yearly billing
            </span>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="home-cta-section"
      >
        <div className="home-cta-content">
          <span>Get started today</span>

          <h2>
            Your business deserves simpler software.
          </h2>

          <p>
            Set up your company and bring billing, stock,
            customers and sales into one clean workspace.
          </p>
        </div>

        <div className="home-cta-actions">
          <button
            type="button"
            className="home-primary-button"
            onClick={handleGetStarted}
          >
            Create Company
            <FiArrowRight />
          </button>

          <button
            type="button"
            className="home-secondary-button"
            onClick={handleLogin}
          >
            Existing User Login
          </button>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-brand">
          <span className="home-footer-logo">
            <FiZap />
          </span>

          <div>
            <strong>
              Bill<span>Flow</span>
            </strong>

            <p>
              Smart billing for growing businesses.
            </p>
          </div>
        </div>

        <p>
          © {new Date().getFullYear()} BillFlow. All rights
          reserved.
        </p>
      </footer>
    </main>
  );
};

export default Home;