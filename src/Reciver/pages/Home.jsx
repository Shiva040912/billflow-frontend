import { useNavigate } from "react-router-dom";
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
          <span className="home-brand-logo">BF</span>
          <span className="home-brand-content">
            <strong>BillFlow</strong>
            <small>Smart Billing Software</small>
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
            Get Started
          </button>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-hero-badge">
            ✨ Simple. Secure. Built for your business growth.
          </span>

          <h1>
            Manage your billing & business with <br />
            <span>BillFlow Pro</span>
          </h1>

          <p>
            Create professional bills instantly, manage products effortlessly,
            track stock levels, handle customers, and monitor your
            complete business performance from one smart dashboard.
          </p>

          <div className="home-hero-actions">
            <button
              type="button"
              className="home-primary-button"
              onClick={handleGetStarted}
            >
              Start Your Business Free
            </button>

            <button
              type="button"
              className="home-secondary-button"
              onClick={handleLogin}
            >
              Login to Dashboard
            </button>
          </div>

          <div className="home-hero-points">
            <span>No complicated setup</span>
            <span>Razorpay Secure</span>
            <span>Lightning Fast Billing</span>
          </div>
        </div>

        <div className="home-dashboard-preview">
          <div className="home-preview-window">
            <div className="home-preview-header">
              <div>
                <span className="preview-dot" />
                <span className="preview-dot" />
                <span className="preview-dot" />
              </div>
              <span>BillFlow Secure Workspace</span>
            </div>

            <div className="home-preview-body">
              <aside className="home-preview-sidebar">
                <div className="preview-logo-block" />
                <div className="preview-menu active" />
                <div className="preview-menu" />
                <div className="preview-menu" />
                <div className="preview-menu" />
              </aside>

              <div className="home-preview-main">
                <div className="preview-heading">
                  <div>
                    <span />
                    <small />
                  </div>
                  <button type="button">Create Bill</button>
                </div>

                <div className="preview-stat-grid">
                  <article>
                    <span>Total Sales</span>
                    <strong>₹48,250</strong>
                    <small>+12.5%</small>
                  </article>
                  <article>
                    <span>Total Orders</span>
                    <strong>126</strong>
                    <small>+8.2%</small>
                  </article>
                  <article>
                    <span>Products</span>
                    <strong>84</strong>
                    <small>Active</small>
                  </article>
                </div>

                <div className="preview-chart-card">
                  <div className="preview-chart-heading">
                    <span />
                    <small />
                  </div>
                  <div className="preview-chart">
                    <span style={{ height: "36%" }} />
                    <span style={{ height: "52%" }} />
                    <span style={{ height: "44%" }} />
                    <span style={{ height: "70%" }} />
                    <span style={{ height: "62%" }} />
                    <span style={{ height: "86%" }} />
                    <span style={{ height: "74%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="home-floating-card home-floating-sales">
            <span>Today&apos;s Sales</span>
            <strong>₹8,640</strong>
          </div>

          <div className="home-floating-card home-floating-stock">
            <span>Stock Status</span>
            <strong>All Good 🚀</strong>
          </div>
        </div>
      </section>

      <section id="features" className="home-features-section">
        <div className="home-section-heading">
          <span>Everything in one place</span>
          <h2>Features designed for modern business owners</h2>
          <p>
            Daily billing work simple-ah manage panna thevaiyana important tools ellame BillFlow-la irukkum.
          </p>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <div className="home-feature-icon">01</div>
            <h3>Smart Billing</h3>
            <p>Fast-ah professional bills create panni customers-ku provide pannalam.</p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">02</div>
            <h3>Stock Management</h3>
            <p>Products stock, availability and low-stock details easy-ah monitor pannalam.</p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">03</div>
            <h3>Sales Dashboard</h3>
            <p>Sales, orders and business performance complete overview paarkalam.</p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">04</div>
            <h3>Customer Management</h3>
            <p>Customer details and purchase records organized-ah maintain pannalam.</p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">05</div>
            <h3>Employee Access</h3>
            <p>Employees create panni avangalukku required access mattum provide pannalam.</p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">06</div>
            <h3>Secure Payments</h3>
            <p>Razorpay payment complete pannitu company account secure-ah activate pannalam.</p>
          </article>
        </div>
      </section>

      <section id="pricing" className="home-pricing-section">
        <div className="home-pricing-content">
          <span className="home-pricing-label">Simple pricing</span>
          <h2>Choose a plan that matches your business</h2>
          <p>
            First company details register pannunga. Adhukku apram suitable plan select panni payment complete pannalam.
          </p>
          <button type="button" onClick={handleGetStarted}>
            View Plans & Pricing
          </button>
        </div>
      </section>

      <section id="about" className="home-cta-section">
        <div>
          <span>Ready to get started?</span>
          <h2>Take control of your business with BillFlow</h2>
          <p>Company account create panni billing management-ah simple-ah start pannunga.</p>
        </div>

        <div className="home-cta-actions">
          <button
            type="button"
            className="home-primary-button"
            onClick={handleGetStarted}
          >
            Create Company
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
          <span className="home-brand-logo">BF</span>
          <div>
            <strong>BillFlow</strong>
            <p>Smart billing for growing businesses.</p>
          </div>
        </div>

        <p>
          © {new Date().getFullYear()} BillFlow. All rights reserved.
        </p>
      </footer>
    </main>
  );
};

export default Home;