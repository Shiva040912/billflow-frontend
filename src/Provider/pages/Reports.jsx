// Reports.jsx

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  FiActivity,
  FiCheckCircle,
  FiDollarSign,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { getProviderReportsSummary } from "../services/providerReports";

import "../styles/reports.css";

const INITIAL_SUMMARY = {
  totalRevenue: 0,
  monthlyRevenue: 0,
  successfulPayments: 0,
  failedPayments: 0,
  refundedAmount: 0,
  totalCompanies: 0,
  activeCompanies: 0,
  activeSubscriptions: 0,
};

const Reports = () => {
  const [summary, setSummary] =
    useState(INITIAL_SUMMARY);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const handleUnauthorized = () => {
    localStorage.removeItem(
      "providerAccessToken"
    );

    localStorage.removeItem(
      "providerUser"
    );

    window.location.href =
      "/provider/login";
  };

  const getErrorMessage = (
    error,
    fallbackMessage
  ) => {
    const responseMessage =
      error.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage[0];
    }

    return (
      responseMessage ||
      error.message ||
      fallbackMessage
    );
  };

  const fetchReports = async ({
    showRefreshLoader = false,
  } = {}) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response =
        await getProviderReportsSummary();

      setSummary({
        ...INITIAL_SUMMARY,
        ...(response?.data || {}),
      });
    } catch (error) {
      console.error(
        "Provider reports fetch error:",
        error
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Reports load panna mudiyala"
        )
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(
        summary.totalRevenue
      ),
      description:
        "All successful payment revenue",
      icon: <FiDollarSign />,
      className: "revenue",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(
        summary.monthlyRevenue
      ),
      description:
        "Current month revenue",
      icon: <FiTrendingUp />,
      className: "monthly",
    },
    {
      title: "Successful Payments",
      value:
        summary.successfulPayments,
      description:
        "Completed transactions",
      icon: <FiCheckCircle />,
      className: "success",
    },
    {
      title: "Failed Payments",
      value: summary.failedPayments,
      description:
        "Failed transactions",
      icon: <FiXCircle />,
      className: "failed",
    },
    {
      title: "Refunded Amount",
      value: formatCurrency(
        summary.refundedAmount
      ),
      description:
        "Total refunded payment value",
      icon: <FiRefreshCw />,
      className: "refunded",
    },
    {
      title: "Total Companies",
      value: summary.totalCompanies,
      description:
        "Registered BillFlow companies",
      icon: <FiUsers />,
      className: "companies",
    },
    {
      title: "Active Companies",
      value: summary.activeCompanies,
      description:
        "Currently active companies",
      icon: <FiActivity />,
      className: "active",
    },
    {
      title: "Active Subscriptions",
      value:
        summary.activeSubscriptions,
      description:
        "Running subscriptions",
      icon: <FiCheckCircle />,
      className: "subscriptions",
    },
  ];

  return (
    <main className="provider-reports-page">
      <section className="provider-reports-header">
        <div>
          <p className="provider-reports-eyebrow">
            Business Analytics
          </p>

          <h1>Reports</h1>

          <p>
            Revenue, companies,
            subscriptions and payment
            performance-ah monitor pannu.
          </p>
        </div>

        <button
          type="button"
          className="provider-reports-refresh-btn"
          disabled={isRefreshing}
          onClick={() =>
            fetchReports({
              showRefreshLoader: true,
            })
          }
        >
          <FiRefreshCw
            className={
              isRefreshing
                ? "spinning"
                : ""
            }
          />

          <span>
            {isRefreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </section>

      <section className="provider-reports-summary-grid">
        {summaryCards.map((card) => (
          <article
            className="provider-report-summary-card"
            key={card.title}
          >
            <span
              className={`provider-report-summary-icon ${card.className}`}
            >
              {card.icon}
            </span>

            <div>
              <p>{card.title}</p>

              <strong>
                {isLoading
                  ? "..."
                  : card.value}
              </strong>

              <small>
                {card.description}
              </small>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Reports;