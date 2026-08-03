import { useEffect, useMemo, useState } from "react";
import api from "../services/axios";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiPackage,
  FiPercent,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import "../styles/report.css";

const Report = () => {
  const [reportData, setReportData] = useState({
    totalSales: 0,
    totalBills: 0,
    totalGst: 0,
    totalDiscount: 0,
    totalPaidAmount: 0,
    totalPendingAmount: 0,
    averageBillValue: 0,
    paidBills: 0,
    pendingBills: 0,
    partialBills: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchReportsSummary = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem(
          "billFlowAccessToken",
        );

        const response = await api.get(
          "/reports/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setReportData(response.data);
      } catch (error) {
        console.error(
          "Reports summary fetch error:",
          error,
        );

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load reports summary.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportsSummary();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const billStatusTotal = useMemo(
    () =>
      Number(reportData.paidBills || 0) +
      Number(reportData.pendingBills || 0) +
      Number(reportData.partialBills || 0),
    [
      reportData.paidBills,
      reportData.pendingBills,
      reportData.partialBills,
    ],
  );

  const getPercentage = (value) => {
    if (!billStatusTotal) {
      return 0;
    }

    return Math.round(
      (Number(value || 0) / billStatusTotal) * 100,
    );
  };

  const reportCards = [
    {
      title: "Total Sales",
      value: formatCurrency(reportData.totalSales),
      description: "Overall billing revenue",
      icon: <FiDollarSign />,
      className: "sales",
    },
    {
      title: "Total Bills",
      value: reportData.totalBills,
      description: "Invoices generated",
      icon: <FiFileText />,
      className: "bills",
    },
    {
      title: "GST Collected",
      value: formatCurrency(reportData.totalGst),
      description: "Total GST from invoices",
      icon: <FiPercent />,
      className: "gst",
    },
    {
      title: "Average Bill Value",
      value: formatCurrency(
        reportData.averageBillValue,
      ),
      description: "Average revenue per bill",
      icon: <FiTrendingUp />,
      className: "average",
    },
  ];

  return (
    <div className="reports-page">
      <section className="reports-header">
        <div>
          <p className="reports-eyebrow">
            Business Analytics
          </p>

          <h1>Reports</h1>

          <p>
            Track sales, collections, invoices and
            business performance.
          </p>
        </div>
      </section>

      {errorMessage && (
        <div className="reports-error-message">
          <FiAlertTriangle />

          <span>{errorMessage}</span>
        </div>
      )}

      <section className="reports-summary-grid">
        {reportCards.map((card) => (
          <article
            className={`reports-summary-card ${card.className}`}
            key={card.title}
          >
            <div className="reports-card-top">
              <div className="reports-card-icon">
                {card.icon}
              </div>
            </div>

            <p className="reports-card-title">
              {card.title}
            </p>

            <h2>
              {isLoading ? "..." : card.value}
            </h2>

            <span className="reports-card-description">
              {isLoading
                ? "Loading report data..."
                : card.description}
            </span>
          </article>
        ))}
      </section>

      <section className="reports-content-grid">
        <article className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <h3>Payment Summary</h3>

              <p>
                Paid, pending and partial invoice
                status
              </p>
            </div>

            <FiFileText />
          </div>

          <div className="payment-summary-list">
            <div className="payment-summary-item">
              <div className="payment-summary-details">
                <span className="payment-status-icon paid">
                  <FiCheckCircle />
                </span>

                <div>
                  <strong>Paid Bills</strong>

                  <span>
                    {reportData.paidBills} invoices
                  </span>
                </div>
              </div>

              <div className="payment-summary-value">
                <strong>
                  {getPercentage(
                    reportData.paidBills,
                  )}
                  %
                </strong>

                <span>
                  {formatCurrency(
                    reportData.totalPaidAmount,
                  )}
                </span>
              </div>
            </div>

            <div className="payment-progress-track">
              <span
                className="payment-progress-fill paid"
                style={{
                  width: `${getPercentage(
                    reportData.paidBills,
                  )}%`,
                }}
              />
            </div>

            <div className="payment-summary-item">
              <div className="payment-summary-details">
                <span className="payment-status-icon pending">
                  <FiClock />
                </span>

                <div>
                  <strong>Pending Bills</strong>

                  <span>
                    {reportData.pendingBills} invoices
                  </span>
                </div>
              </div>

              <div className="payment-summary-value">
                <strong>
                  {getPercentage(
                    reportData.pendingBills,
                  )}
                  %
                </strong>

                <span>
                  {formatCurrency(
                    reportData.totalPendingAmount,
                  )}
                </span>
              </div>
            </div>

            <div className="payment-progress-track">
              <span
                className="payment-progress-fill pending"
                style={{
                  width: `${getPercentage(
                    reportData.pendingBills,
                  )}%`,
                }}
              />
            </div>

            <div className="payment-summary-item">
              <div className="payment-summary-details">
                <span className="payment-status-icon partial">
                  <FiAlertTriangle />
                </span>

                <div>
                  <strong>Partial Bills</strong>

                  <span>
                    {reportData.partialBills} invoices
                  </span>
                </div>
              </div>

              <div className="payment-summary-value">
                <strong>
                  {getPercentage(
                    reportData.partialBills,
                  )}
                  %
                </strong>
              </div>
            </div>

            <div className="payment-progress-track">
              <span
                className="payment-progress-fill partial"
                style={{
                  width: `${getPercentage(
                    reportData.partialBills,
                  )}%`,
                }}
              />
            </div>
          </div>
        </article>

        <article className="reports-panel">
          <div className="reports-panel-header">
            <div>
              <h3>Business Overview</h3>

              <p>
                Products, customers and discounts
              </p>
            </div>

            <FiTrendingUp />
          </div>

          <div className="business-overview-grid">
            <div className="business-overview-card">
              <span className="business-overview-icon products">
                <FiPackage />
              </span>

              <div>
                <span>Total Products</span>

                <strong>
                  {isLoading
                    ? "..."
                    : reportData.totalProducts}
                </strong>
              </div>
            </div>

            <div className="business-overview-card">
              <span className="business-overview-icon customers">
                <FiUsers />
              </span>

              <div>
                <span>Total Customers</span>

                <strong>
                  {isLoading
                    ? "..."
                    : reportData.totalCustomers}
                </strong>
              </div>
            </div>

            <div className="business-overview-card wide">
              <span className="business-overview-icon discount">
                <FiPercent />
              </span>

              <div>
                <span>Total Discount Given</span>

                <strong>
                  {isLoading
                    ? "..."
                    : formatCurrency(
                        reportData.totalDiscount,
                      )}
                </strong>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Report;