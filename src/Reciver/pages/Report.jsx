import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiPackage,
  FiPercent,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import api from "../services/axios";

import "../styles/report.css";

const Report = () => {
  const navigate = useNavigate();

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
          "billFlowAccessToken"
        );

        const response = await api.get(
          "/reports/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setReportData(response.data);
      } catch (error) {
        console.error(
          "Reports summary fetch error:",
          error
        );

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load reports summary."
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
    ]
  );

  const getPercentage = (value) => {
    if (!billStatusTotal) {
      return 0;
    }

    return Math.round(
      (Number(value || 0) / billStatusTotal) * 100
    );
  };

  const reportCards = [
    {
      title: "Total Sales",
      value: formatCurrency(
        reportData.totalSales
      ),
      description:
        "Overall billing revenue",
      icon: <FiDollarSign />,
      className: "sales",
      badge: "Revenue",
    },
    {
      title: "Total Bills",
      value:
        reportData.totalBills ?? 0,
      description:
        "Invoices generated",
      icon: <FiFileText />,
      className: "bills",
      badge: "Invoices",
    },
    {
      title: "GST Collected",
      value: formatCurrency(
        reportData.totalGst
      ),
      description:
        "GST collected from bills",
      icon: <FiPercent />,
      className: "gst",
      badge: "Tax",
    },
    {
      title: "Average Bill",
      value: formatCurrency(
        reportData.averageBillValue
      ),
      description:
        "Average revenue per bill",
      icon: <FiTrendingUp />,
      className: "average",
      badge: "Average",
    },
  ];

  return (
    <section className="reports-page">
      <header className="reports-header">
        <div>
          <span className="reports-eyebrow">
            Business Analytics
          </span>

          <h1>Reports</h1>

          <p>
            Track sales, collections,
            invoices and your overall
            business performance.
          </p>
        </div>

        <div className="reports-header-actions">
          <button
            type="button"
            className="reports-sales-btn"
            onClick={() => navigate("/sales")}
          >
            <FiFileText />

            <span>View Sales</span>

            <FiArrowRight />
          </button>

          <div className="reports-header-badge">
            <FiTrendingUp />

            <div>
              <span>Business Status</span>
              <strong>
                Live Overview
              </strong>
            </div>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div
          className="reports-error-message"
          role="alert"
        >
          <FiAlertTriangle />

          <span>
            {errorMessage}
          </span>
        </div>
      )}

      <section className="reports-summary-grid">
        {reportCards.map(
          (card) => (
            <article
              className={`reports-summary-card ${card.className}`}
              key={card.title}
            >
              <div className="reports-card-top">
                <span className="reports-card-icon">
                  {card.icon}
                </span>

                <span className="reports-card-badge">
                  {card.badge}
                </span>
              </div>

              <div className="reports-card-content">
                <p className="reports-card-title">
                  {card.title}
                </p>

                <h2>
                  {isLoading
                    ? "..."
                    : card.value}
                </h2>

                <span className="reports-card-description">
                  {isLoading
                    ? "Loading report data..."
                    : card.description}
                </span>
              </div>
            </article>
          )
        )}
      </section>

      <section className="reports-content-grid">
        <article className="reports-panel payment-panel">
          <div className="reports-panel-header">
            <div>
              <span>
                Collections
              </span>

              <h3>
                Payment Summary
              </h3>

              <p>
                Paid, pending and
                partially paid invoices.
              </p>
            </div>

            <span className="reports-panel-icon">
              <FiFileText />
            </span>
          </div>

          <div className="payment-summary-list">
            <div className="payment-summary-block">
              <div className="payment-summary-item">
                <div className="payment-summary-details">
                  <span className="payment-status-icon paid">
                    <FiCheckCircle />
                  </span>

                  <div>
                    <strong>
                      Paid Bills
                    </strong>

                    <span>
                      {reportData.paidBills}{" "}
                      invoices
                    </span>
                  </div>
                </div>

                <div className="payment-summary-value">
                  <strong>
                    {getPercentage(
                      reportData.paidBills
                    )}
                    %
                  </strong>

                  <span>
                    {formatCurrency(
                      reportData.totalPaidAmount
                    )}
                  </span>
                </div>
              </div>

              <div className="payment-progress-track">
                <span
                  className="payment-progress-fill paid"
                  style={{
                    width: `${getPercentage(
                      reportData.paidBills
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="payment-summary-block">
              <div className="payment-summary-item">
                <div className="payment-summary-details">
                  <span className="payment-status-icon pending">
                    <FiClock />
                  </span>

                  <div>
                    <strong>
                      Pending Bills
                    </strong>

                    <span>
                      {
                        reportData.pendingBills
                      }{" "}
                      invoices
                    </span>
                  </div>
                </div>

                <div className="payment-summary-value">
                  <strong>
                    {getPercentage(
                      reportData.pendingBills
                    )}
                    %
                  </strong>

                  <span>
                    {formatCurrency(
                      reportData.totalPendingAmount
                    )}
                  </span>
                </div>
              </div>

              <div className="payment-progress-track">
                <span
                  className="payment-progress-fill pending"
                  style={{
                    width: `${getPercentage(
                      reportData.pendingBills
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="payment-summary-block">
              <div className="payment-summary-item">
                <div className="payment-summary-details">
                  <span className="payment-status-icon partial">
                    <FiAlertTriangle />
                  </span>

                  <div>
                    <strong>
                      Partial Bills
                    </strong>

                    <span>
                      {
                        reportData.partialBills
                      }{" "}
                      invoices
                    </span>
                  </div>
                </div>

                <div className="payment-summary-value">
                  <strong>
                    {getPercentage(
                      reportData.partialBills
                    )}
                    %
                  </strong>

                  <span>
                    Partially settled
                  </span>
                </div>
              </div>

              <div className="payment-progress-track">
                <span
                  className="payment-progress-fill partial"
                  style={{
                    width: `${getPercentage(
                      reportData.partialBills
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        <article className="reports-panel business-panel">
          <div className="reports-panel-header">
            <div>
              <span>
                Workspace
              </span>

              <h3>
                Business Overview
              </h3>

              <p>
                Products, customers and
                total discounts.
              </p>
            </div>

            <span className="reports-panel-icon">
              <FiTrendingUp />
            </span>
          </div>

          <div className="business-overview-grid">
            <div className="business-overview-card products">
              <span className="business-overview-icon products">
                <FiPackage />
              </span>

              <div>
                <span>
                  Total Products
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : reportData.totalProducts}
                </strong>

                <small>
                  Products in catalogue
                </small>
              </div>
            </div>

            <div className="business-overview-card customers">
              <span className="business-overview-icon customers">
                <FiUsers />
              </span>

              <div>
                <span>
                  Total Customers
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : reportData.totalCustomers}
                </strong>

                <small>
                  Registered customers
                </small>
              </div>
            </div>

            <div className="business-overview-card wide discount">
              <span className="business-overview-icon discount">
                <FiPercent />
              </span>

              <div>
                <span>
                  Total Discount Given
                </span>

                <strong>
                  {isLoading
                    ? "..."
                    : formatCurrency(
                        reportData.totalDiscount
                      )}
                </strong>

                <small>
                  Discount value across
                  generated bills
                </small>
              </div>
            </div>
          </div>

          <div className="reports-business-footer">
            <span>
              Total invoice activity
            </span>

            <strong>
              {isLoading
                ? "..."
                : billStatusTotal}
            </strong>
          </div>
        </article>
      </section>
    </section>
  );
};

export default Report;