import { useEffect, useState } from "react";
import {
  FiActivity,
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { getProviderDashboardSummary } from "../services/dashboard";
import "../styles/dashboard.css";

const initialDashboardData = {
  summary: {
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
  },
  recentCompanies: [],
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(initialDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardSummary = async (showRefreshToast = false) => {
    try {
      const response = await getProviderDashboardSummary();

      setDashboardData({
        summary: {
          ...initialDashboardData.summary,
          ...(response.summary || {}),
        },
        recentCompanies: response.recentCompanies || [],
      });

      if (showRefreshToast) {
        toast.success("Dashboard refreshed successfully");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to fetch provider dashboard"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardSummary(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const summaryCards = [
    {
      title: "Total Companies",
      value: dashboardData.summary.totalCompanies,
      description: "Registered platform businesses",
      icon: <FiBriefcase />,
      className: "total",
      trend: "+12.5%",
      isPositive: true,
    },
    {
      title: "Active Companies",
      value: dashboardData.summary.activeCompanies,
      description: "Currently active on BillFlow",
      icon: <FiCheckCircle />,
      className: "active",
      trend: "+8.2%",
      isPositive: true,
    },
    {
      title: "Active Subscriptions",
      value: dashboardData.summary.activeSubscriptions,
      description: "Running monthly/yearly plans",
      icon: <FiActivity />,
      className: "subscription",
      trend: "+5.4%",
      isPositive: true,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(dashboardData.summary.monthlyRevenue),
      description: "Gross revenue recorded this month",
      icon: <FiDollarSign />,
      className: "revenue",
      trend: "+18.9%",
      isPositive: true,
    },
  ];

  return (
    <section className="provider-dashboard-page">
      <header className="provider-dashboard-header">
        <div className="provider-dashboard-heading">
          <span className="provider-dashboard-kicker">Platform Overview</span>

          <h1>Provider Dashboard</h1>

          <p>
            Monitor companies, subscriptions and revenue across the BillFlow
            platform.
          </p>
        </div>

        <button
          type="button"
          className="provider-dashboard-refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <FiRefreshCw
            className={isRefreshing ? "provider-refresh-spinning" : ""}
          />

          <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
        </button>
      </header>

      {isLoading ? (
        <div className="provider-dashboard-loading">
          <div className="provider-dashboard-loader" />
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="provider-dashboard-stats">
            {summaryCards.map((card) => (
              <article
                key={card.title}
                className={`provider-stat-card ${card.className}`}
              >
                <div className="provider-stat-card-top">
                  <div className="provider-stat-icon">{card.icon}</div>

                  <div
                    className={`provider-trend-badge ${
                      card.isPositive ? "trend-up" : "trend-down"
                    }`}
                  >
                    {card.isPositive ? (
                      <FiTrendingUp />
                    ) : (
                      <FiTrendingDown />
                    )}

                    <span>{card.trend}</span>
                  </div>
                </div>

                <div className="provider-stat-card-content">
                  <span className="provider-stat-title">{card.title}</span>

                  <h2>{card.value}</h2>

                  <p>{card.description}</p>
                </div>
              </article>
            ))}
          </div>

          <section className="provider-recent-companies">
            <div className="provider-section-header">
              <div className="provider-section-heading">
                <span>Recent activity</span>
                <h2>Recent Companies</h2>
                <p>Latest businesses registered on your platform.</p>
              </div>

              <div className="provider-company-count">
                <span>Recent</span>
                <strong>{dashboardData.recentCompanies.length}</strong>
              </div>
            </div>

            {dashboardData.recentCompanies.length === 0 ? (
              <div className="provider-empty-state">
                <div className="provider-empty-icon">
                  <FiBriefcase />
                </div>

                <h3>No recent companies</h3>

                <p>New company registrations will appear here.</p>
              </div>
            ) : (
              <div className="provider-table-wrapper">
                <table className="provider-companies-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Owner</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboardData.recentCompanies.map((company) => (
                      <tr key={company._id}>
                        <td>
                          <div className="provider-company-details">
                            <div className="provider-company-avatar">
                              {company.companyName
                                ?.charAt(0)
                                ?.toUpperCase() || "B"}
                            </div>

                            <div className="provider-company-info">
                              <strong>
                                {company.companyName || "N/A Business"}
                              </strong>

                              <span>
                                {company.email || "No email registered"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="provider-table-primary-text">
                            {company.ownerName || "Not available"}
                          </span>
                        </td>

                        <td>
                          <span className="provider-table-secondary-text">
                            {company.phone || "Not available"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`provider-status-badge ${
                              company.isActive
                                ? "provider-status-active"
                                : "provider-status-inactive"
                            }`}
                          >
                            <span className="provider-status-dot" />

                            {company.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <span className="provider-table-date">
                            <FiClock />
                            {formatDate(company.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
};

export default Dashboard;