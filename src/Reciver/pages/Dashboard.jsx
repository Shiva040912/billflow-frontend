import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiAlertTriangle,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    totalBills: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalStaff: 0,
    recentSales: [],
    lowStockProducts: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("billFlowAccessToken");

        const response = await axios.get(
          "http://localhost:3000/dashboard/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setDashboardData(response.data);
      } catch (error) {
        console.error("Dashboard summary fetch error:", error);

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
            "Unable to load dashboard summary.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [navigate]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const summaryCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(dashboardData.todaySales),
      description: "Total sales recorded today",
      icon: <FiDollarSign />,
    },
    {
      title: "Total Bills",
      value: dashboardData.totalBills ?? 0,
      description: "Bills generated today",
      icon: <FiShoppingBag />,
    },
    {
      title: "Total Products",
      value: dashboardData.totalProducts ?? 0,
      description: "Active products available",
      icon: <FiPackage />,
    },
    {
      title: "Total Customers",
      value: dashboardData.totalCustomers ?? 0,
      description: "Registered customers",
      icon: <FiUsers />,
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p>Welcome back. Here is your business summary.</p>
        </div>

        <button
          type="button"
          className="dashboard-primary-btn"
          onClick={() => navigate("/billing")}
        >
          <FiShoppingBag />
          Create New Bill
        </button>
      </section>

      {errorMessage && (
        <div className="dashboard-error-message">
          <FiAlertTriangle />
          <span>{errorMessage}</span>
        </div>
      )}

      <section className="dashboard-summary-grid">
        {summaryCards.map((card) => (
          <article className="dashboard-summary-card" key={card.title}>
            <div className="summary-card-top">
              <div className="summary-card-icon">{card.icon}</div>

              <span className="summary-card-growth">
                <FiTrendingUp />
                0%
              </span>
            </div>

            <p className="summary-card-title">{card.title}</p>

            <h2>{isLoading ? "..." : card.value}</h2>

            <span className="summary-card-description">
              {isLoading
                ? "Loading dashboard data..."
                : card.description}
            </span>
          </article>
        ))}
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Recent Sales</h3>
              <p>Latest bills and customer purchases</p>
            </div>

            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={() => navigate("/sales")}
            >
              View All
            </button>
          </div>

          {isLoading ? (
            <div className="dashboard-empty-state">
              <FiShoppingBag />
              <h4>Loading recent sales</h4>
              <p>Please wait while sales are being loaded.</p>
            </div>
          ) : dashboardData.recentSales?.length > 0 ? (
            <div className="dashboard-recent-sales">
              {dashboardData.recentSales.map((sale) => (
                <div
                  className="dashboard-sale-item"
                  key={sale.id || sale._id}
                >
                  <div>
                    <strong>
                      {sale.customerName || "Walk-in Customer"}
                    </strong>
                    <span>{sale.invoiceNumber || "Bill"}</span>
                  </div>

                  <strong>{formatCurrency(sale.totalAmount)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <FiShoppingBag />
              <h4>No sales available</h4>
              <p>Your latest sales will appear here.</p>
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Low Stock Alert</h3>
              <p>Products that need restocking</p>
            </div>

            <div className="dashboard-warning-icon">
              <FiAlertTriangle />
            </div>
          </div>

          {isLoading ? (
            <div className="dashboard-empty-state">
              <FiPackage />
              <h4>Loading stock details</h4>
              <p>Please wait while stock data is being loaded.</p>
            </div>
          ) : dashboardData.lowStockProducts?.length > 0 ? (
            <div className="dashboard-low-stock-list">
              {dashboardData.lowStockProducts.map((product) => (
                <div
                  className="dashboard-stock-item"
                  key={product.id || product._id}
                >
                  <div>
                    <strong>{product.name}</strong>
                    <span>Low stock warning</span>
                  </div>

                  <strong>{product.stock ?? 0} left</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <FiPackage />
              <h4>No low-stock products</h4>
              <p>Stock alerts will appear here.</p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default Dashboard;