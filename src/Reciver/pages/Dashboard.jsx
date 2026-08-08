import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiAlertTriangle,
  FiArrowRight,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import api from "../services/axios";

import "../styles/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] =
    useState({
      todaySales: 0,
      totalBills: 0,
      totalProducts: 0,
      totalCustomers: 0,
      totalStaff: 0,
      recentSales: [],
      lowStockProducts: [],
    });

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const fetchDashboardSummary =
      async () => {
        try {
          setIsLoading(true);
          setErrorMessage("");

          const response =
            await api.get(
              "/dashboard/summary"
            );

          setDashboardData(
            response.data
          );
        } catch (error) {
          console.error(
            "Dashboard summary fetch error:",
            error
          );

          if (
            error.response?.status ===
            401
          ) {
            localStorage.removeItem(
              "billFlowAccessToken"
            );

            localStorage.removeItem(
              "billFlowUser"
            );

            localStorage.removeItem(
              "billFlowCompany"
            );

            navigate("/login", {
              replace: true,
            });

            return;
          }

          setErrorMessage(
            error.response?.data
              ?.message ||
              "Unable to load dashboard summary."
          );
        } finally {
          setIsLoading(false);
        }
      };

    fetchDashboardSummary();
  }, [navigate]);

  const formatCurrency = (
    amount
  ) =>
    new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount || 0)
    );

  const summaryCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(
        dashboardData.todaySales
      ),
      description:
        "Revenue recorded today",
      icon: <FiDollarSign />,
      className: "sales",
    },
    {
      title: "Total Bills",
      value:
        dashboardData.totalBills ??
        0,
      description:
        "Bills generated today",
      icon: <FiShoppingBag />,
      className: "bills",
    },
    {
      title: "Products",
      value:
        dashboardData.totalProducts ??
        0,
      description:
        "Active products",
      icon: <FiPackage />,
      className: "products",
    },
    {
      title: "Customers",
      value:
        dashboardData.totalCustomers ??
        0,
      description:
        "Registered customers",
      icon: <FiUsers />,
      className: "customers",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div className="dashboard-header-content">
          <span className="dashboard-eyebrow">
            Business Overview
          </span>

          <h1>Dashboard</h1>

          <p className="dashboard-header-description">
            Your sales, billing,
            customers and stock at a
            glance.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-primary-btn"
          onClick={() =>
            navigate("/billing")
          }
        >
          <FiShoppingBag />

          <span>
            Create New Bill
          </span>

          <FiArrowRight />
        </button>
      </section>

      {errorMessage && (
        <div
          className="dashboard-error-message"
          role="alert"
        >
          <FiAlertTriangle />

          <span>
            {errorMessage}
          </span>
        </div>
      )}

      <section className="dashboard-summary-grid">
        {summaryCards.map(
          (card) => (
            <article
              className={`dashboard-summary-card ${card.className}`}
              key={card.title}
            >
              <div className="summary-card-top">
                <div className="summary-card-icon">
                  {card.icon}
                </div>

                <span className="summary-card-growth">
                  <FiTrendingUp />
                  Live
                </span>
              </div>

              <div className="summary-card-content">
                <p className="summary-card-title">
                  {card.title}
                </p>

                <h2>
                  {isLoading
                    ? "..."
                    : card.value}
                </h2>

                <span className="summary-card-description">
                  {isLoading
                    ? "Loading data..."
                    : card.description}
                </span>
              </div>
            </article>
          )
        )}
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-panel dashboard-sales-panel">
          <div className="dashboard-panel-header">
            <div className="dashboard-panel-heading">
              <span>
                Latest Activity
              </span>

              <h3>
                Recent Sales
              </h3>

              <p>
                Latest customer bills
                and purchases.
              </p>
            </div>

            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={() =>
                navigate("/sales")
              }
            >
              View All
              <FiArrowRight />
            </button>
          </div>

          {isLoading ? (
            <div className="dashboard-empty-state">
              <span className="dashboard-loader" />

              <h4>
                Loading sales
              </h4>

              <p>
                Fetching your latest
                business activity.
              </p>
            </div>
          ) : dashboardData
              .recentSales?.length >
            0 ? (
            <div className="dashboard-recent-sales">
              {dashboardData.recentSales.map(
                (sale) => (
                  <div
                    className="dashboard-sale-item"
                    key={
                      sale.id ||
                      sale._id
                    }
                  >
                    <div className="dashboard-sale-avatar">
                      <FiShoppingBag />
                    </div>

                    <div className="dashboard-item-details">
                      <strong>
                        {sale.customerName ||
                          "Walk-in Customer"}
                      </strong>

                      <span>
                        {sale.invoiceNumber ||
                          "Bill"}
                      </span>
                    </div>

                    <strong className="dashboard-sale-amount">
                      {formatCurrency(
                        sale.totalAmount
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-icon sales">
                <FiShoppingBag />
              </div>

              <h4>
                No sales yet
              </h4>

              <p>
                New bills and sales
                will appear here.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/billing"
                  )
                }
              >
                Create First Bill
              </button>
            </div>
          )}
        </article>

        <article className="dashboard-panel dashboard-stock-panel">
          <div className="dashboard-panel-header">
            <div className="dashboard-panel-heading">
              <span>
                Inventory
              </span>

              <h3>
                Low Stock
              </h3>

              <p>
                Products that need
                attention.
              </p>
            </div>

            <div className="dashboard-warning-icon">
              <FiAlertTriangle />
            </div>
          </div>

          {isLoading ? (
            <div className="dashboard-empty-state">
              <span className="dashboard-loader" />

              <h4>
                Checking stock
              </h4>

              <p>
                Loading inventory
                status.
              </p>
            </div>
          ) : dashboardData
              .lowStockProducts
              ?.length > 0 ? (
            <div className="dashboard-low-stock-list">
              {dashboardData.lowStockProducts.map(
                (product) => (
                  <div
                    className="dashboard-stock-item"
                    key={
                      product.id ||
                      product._id
                    }
                  >
                    <div className="dashboard-stock-avatar">
                      <FiPackage />
                    </div>

                    <div className="dashboard-item-details">
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        Restock required
                      </span>
                    </div>

                    <strong className="dashboard-stock-count">
                      {product.stock ??
                        0}{" "}
                      left
                    </strong>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <div className="dashboard-empty-icon stock">
                <FiPackage />
              </div>

              <h4>
                Stock looks healthy
              </h4>

              <p>
                There are no low-stock
                products right now.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default Dashboard;