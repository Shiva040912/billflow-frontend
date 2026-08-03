import { useEffect, useState } from "react";
import {
  FiActivity,
  FiBriefcase,
  FiCheckCircle,
  FiDollarSign,
  FiRefreshCw,
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
        toast.success("Dashboard refreshed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to fetch provider dashboard",
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
    if (!dateValue) {
      return "Not available";
    }

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
      description: "Registered businesses",
      icon: <FiBriefcase />,
      className: "total",
    },
    {
      title: "Active Companies",
      value: dashboardData.summary.activeCompanies,
      description: "Currently using BillFlow",
      icon: <FiCheckCircle />,
      className: "active",
    },
    {
      title: "Active Subscriptions",
      value: dashboardData.summary.activeSubscriptions,
      description: "Running subscriptions",
      icon: <FiActivity />,
      className: "subscription",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(dashboardData.summary.monthlyRevenue),
      description: "Revenue received this month",
      icon: <FiDollarSign />,
      className: "revenue",
    },
  ];

  return (
    <section className="provider-dashboard-page">
      <header className="provider-dashboard-header">
        <div className="provider-dashboard-heading">
          <span>Platform Overview</span>

          <h1>Provider Dashboard</h1>

          <p>
            Monitor BillFlow companies, subscriptions and monthly revenue.
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

          {isRefreshing ? "Refreshing..." : "Refresh"}
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
                <div className="provider-stat-card-header">
                  <div className="provider-stat-icon">{card.icon}</div>

                  <span className="provider-live-badge">Live</span>
                </div>

                <div className="provider-stat-card-body">
                  <p>{card.title}</p>
                  <h2>{card.value}</h2>
                  <span>{card.description}</span>
                </div>
              </article>
            ))}
          </div>

          <section className="provider-recent-companies">
            <div className="provider-section-header">
              <div>
                <span>Latest Registrations</span>
                <h2>Recent Companies</h2>
                <p>Recently registered businesses using BillFlow.</p>
              </div>

              <div className="provider-company-count">
                <strong>{dashboardData.recentCompanies.length}</strong>
                <span>Companies</span>
              </div>
            </div>

            {dashboardData.recentCompanies.length === 0 ? (
              <div className="provider-empty-state">
                <div className="provider-empty-icon">
                  <FiBriefcase />
                </div>

                <h3>No companies found</h3>
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
                      <th>Registered Date</th>
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

                            <div>
                              <strong>
                                {company.companyName || "Not available"}
                              </strong>

                              <span>
                                {company.email || "Email not available"}
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
                          <span className="provider-table-primary-text">
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