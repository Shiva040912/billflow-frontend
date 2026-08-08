// Payments.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEye,
  FiFileText,
  FiHome,
  FiRefreshCw,
  FiSearch,
  FiSmartphone,
  FiUser,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import {
  getProviderPayments,
  getProviderPaymentsSummary,
} from "../services/providerPaymentsApi";

import "../styles/payments.css";

const INITIAL_SUMMARY = {
  totalRevenue: 0,
  successfulPayments: 0,
  pendingPayments: 0,
  failedPayments: 0,
  refundedAmount: 0,
};

const Payments = () => {
  const [payments, setPayments] =
    useState([]);

  const [summary, setSummary] =
    useState(INITIAL_SUMMARY);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [methodFilter, setMethodFilter] =
    useState("all");

  const [planFilter, setPlanFilter] =
    useState("all");

  const [selectedPayment, setSelectedPayment] =
    useState(null);

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

  const fetchPayments = async ({
    showRefreshLoader = false,
  } = {}) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [
        paymentsResponse,
        summaryResponse,
      ] = await Promise.all([
        getProviderPayments(),
        getProviderPaymentsSummary(),
      ]);

      setPayments(
        Array.isArray(
          paymentsResponse?.data
        )
          ? paymentsResponse.data
          : []
      );

      setSummary({
        ...INITIAL_SUMMARY,
        ...(summaryResponse?.data || {}),
      });
    } catch (error) {
      console.error(
        "Provider payments fetch error:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Payments load panna mudiyala"
        )
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const planOptions = useMemo(() => {
    const uniquePlans = new Set();

    payments.forEach((payment) => {
      if (payment.planName?.trim()) {
        uniquePlans.add(
          payment.planName.trim()
        );
      }
    });

    return Array.from(
      uniquePlans
    ).sort(
      (firstPlan, secondPlan) =>
        firstPlan.localeCompare(
          secondPlan
        )
    );
  }, [payments]);

  const filteredPayments =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return payments.filter(
        (payment) => {
          const matchesSearch =
            !normalizedSearch ||
            payment.companyName
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            payment.ownerName
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            payment.ownerEmail
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            payment.ownerPhone
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            payment.razorpayOrderId
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            payment.razorpayPaymentId
              ?.toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesStatus =
            statusFilter === "all" ||
            payment.paymentStatus ===
              statusFilter;

          const matchesMethod =
            methodFilter === "all" ||
            payment.paymentMethod ===
              methodFilter;

          const matchesPlan =
            planFilter === "all" ||
            payment.planName ===
              planFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesMethod &&
            matchesPlan
          );
        }
      );
    }, [
      payments,
      searchTerm,
      statusFilter,
      methodFilter,
      planFilter,
    ]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "all" ||
    methodFilter !== "all" ||
    planFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
    setPlanFilter("all");
  };

  const formatCurrency = (
    value,
    currency = "INR"
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency:
          currency || "INR",
        maximumFractionDigits: 2,
      }
    ).format(Number(value || 0));
  };

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "Not available";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "Not available";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(date);
  };

  const formatText = (value) => {
    if (!value) {
      return "Not available";
    }

    return value
      .toString()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getCompanyInitial = (
    payment
  ) =>
    payment.companyName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "C";

  const getPaymentStatusClass = (
    status
  ) => {
    if (status === "success") {
      return "success";
    }

    if (
      status === "created" ||
      status === "pending"
    ) {
      return "pending";
    }

    if (status === "failed") {
      return "failed";
    }

    if (
      status === "refunded" ||
      status === "partially_refunded"
    ) {
      return "refunded";
    }

    return "unknown";
  };

  const getPaymentMethodIcon = (
    method
  ) => {
    if (method === "card") {
      return <FiCreditCard />;
    }

    if (method === "upi") {
      return <FiSmartphone />;
    }

    if (
      method === "netbanking"
    ) {
      return <FiHome />;
    }

    return <FiDollarSign />;
  };

  const getPaymentMethodDetails = (
    payment
  ) => {
    if (
      payment.paymentMethod === "card"
    ) {
      const cardParts = [
        payment.cardNetwork,
        payment.cardType,
        payment.cardLastFour
          ? `•••• ${payment.cardLastFour}`
          : "",
      ].filter(Boolean);

      return (
        cardParts.join(" · ") ||
        "Card"
      );
    }

    if (
      payment.paymentMethod === "upi"
    ) {
      return (
        payment.vpa ||
        "UPI payment"
      );
    }

    if (
      payment.paymentMethod ===
      "netbanking"
    ) {
      return (
        payment.bank ||
        "Net Banking"
      );
    }

    if (
      payment.paymentMethod ===
      "wallet"
    ) {
      return (
        payment.wallet ||
        "Wallet"
      );
    }

    return formatText(
      payment.paymentMethod
    );
  };

  const summaryCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(
        summary.totalRevenue
      ),
      description:
        "Successful payment revenue",
      icon: <FiDollarSign />,
      className: "revenue",
    },
    {
      title: "Successful",
      value:
        summary.successfulPayments,
      description:
        "Completed transactions",
      icon: <FiCheckCircle />,
      className: "success",
    },
    {
      title: "Pending",
      value:
        summary.pendingPayments,
      description:
        "Waiting for confirmation",
      icon: <FiClock />,
      className: "pending",
    },
    {
      title: "Failed",
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
        "Total refunded value",
      icon: <FiRefreshCw />,
      className: "refunded",
    },
  ];

  return (
    <>
      <main className="provider-payments-page">
        <section className="provider-payments-header">
          <div>
            <p className="provider-payments-eyebrow">
              Revenue Management
            </p>

            <h1>Payments</h1>

            <p>
              Track subscription payments,
              transaction activity and revenue
              across BillFlow.
            </p>
          </div>

          <button
            type="button"
            className="provider-payments-refresh-btn"
            disabled={isRefreshing}
            onClick={() =>
              fetchPayments({
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

        <section className="provider-payments-summary-grid">
          {summaryCards.map(
            (card) => (
              <article
                className="provider-payment-summary-card"
                key={card.title}
              >
                <span
                  className={`provider-payment-summary-icon ${card.className}`}
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
            )
          )}
        </section>

        <section className="provider-payments-workspace">
          <div className="provider-payments-toolbar">
            <div className="provider-payments-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search company, owner, email or transaction ID..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              aria-label="Filter payment status"
            >
              <option value="all">
                All Status
              </option>

              <option value="success">
                Success
              </option>

              <option value="created">
                Created
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="refunded">
                Refunded
              </option>

              <option value="partially_refunded">
                Partially Refunded
              </option>
            </select>

            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(
                  event.target.value
                )
              }
              aria-label="Filter payment method"
            >
              <option value="all">
                All Methods
              </option>

              <option value="card">
                Card
              </option>

              <option value="upi">
                UPI
              </option>

              <option value="netbanking">
                Net Banking
              </option>

              <option value="wallet">
                Wallet
              </option>

              <option value="emi">
                EMI
              </option>

              <option value="paylater">
                Pay Later
              </option>

              <option value="unknown">
                Unknown
              </option>
            </select>

            <select
              value={planFilter}
              onChange={(event) =>
                setPlanFilter(
                  event.target.value
                )
              }
              aria-label="Filter payment plan"
            >
              <option value="all">
                All Plans
              </option>

              {planOptions.map(
                (planName) => (
                  <option
                    value={planName}
                    key={planName}
                  >
                    {planName}
                  </option>
                )
              )}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="provider-payments-clear-btn"
                onClick={clearFilters}
              >
                <FiX />
                Clear
              </button>
            )}
          </div>

          <div className="provider-payments-result-bar">
            <div>
              <strong>
                {filteredPayments.length}{" "}
                Payment
                {filteredPayments.length ===
                1
                  ? ""
                  : "s"}
              </strong>

              <span>
                {hasActiveFilters
                  ? "Matching current filters"
                  : "Showing all subscription payments"}
              </span>
            </div>
          </div>

          <section className="provider-payments-content">
            {isLoading ? (
              <div className="provider-payments-state">
                <span className="provider-payments-loader" />

                <h3>
                  Loading payments...
                </h3>

                <p>
                  Payment transactions are
                  being loaded.
                </p>
              </div>
            ) : filteredPayments.length ===
              0 ? (
              <div className="provider-payments-state">
                <FiFileText />

                <h3>
                  No payments available
                </h3>

                <p>
                  {hasActiveFilters
                    ? "No payments match the current filters."
                    : "Subscription payments will appear here."}
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="provider-payments-desktop-table">
                  <div className="provider-payments-table-wrapper">
                    <table className="provider-payments-table">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Plan</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Paid Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredPayments.map(
                          (payment) => (
                            <tr
                              key={
                                payment._id
                              }
                            >
                              <td>
                                <div className="provider-payment-company-info">
                                  <span className="provider-payment-company-avatar">
                                    {getCompanyInitial(
                                      payment
                                    )}
                                  </span>

                                  <div>
                                    <strong>
                                      {
                                        payment.companyName
                                      }
                                    </strong>

                                    <span>
                                      {
                                        payment.ownerName
                                      }
                                    </span>

                                    <small>
                                      {
                                        payment.ownerEmail
                                      }
                                    </small>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="provider-payment-plan-info">
                                  <strong>
                                    {payment.planName ||
                                      "No Plan"}
                                  </strong>

                                  <span>
                                    {payment
                                      .planId
                                      ?.monthlyPrice
                                      ? `${formatCurrency(
                                          payment
                                            .planId
                                            .monthlyPrice
                                        )} / month`
                                      : "Plan details unavailable"}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="provider-payment-amount">
                                  <strong>
                                    {formatCurrency(
                                      payment.totalAmount,
                                      payment.currency
                                    )}
                                  </strong>

                                  <span>
                                    Base{" "}
                                    {formatCurrency(
                                      payment.amount,
                                      payment.currency
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="provider-payment-method">
                                  <span>
                                    {getPaymentMethodIcon(
                                      payment.paymentMethod
                                    )}
                                  </span>

                                  <div>
                                    <strong>
                                      {formatText(
                                        payment.paymentMethod
                                      )}
                                    </strong>

                                    <small>
                                      {getPaymentMethodDetails(
                                        payment
                                      )}
                                    </small>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span
                                  className={`provider-payment-status-badge ${getPaymentStatusClass(
                                    payment.paymentStatus
                                  )}`}
                                >
                                  {formatText(
                                    payment.paymentStatus
                                  )}
                                </span>
                              </td>

                              <td>
                                <div className="provider-payment-date">
                                  <strong>
                                    {formatDate(
                                      payment.paidAt ||
                                        payment.createdAt
                                    )}
                                  </strong>

                                  <span>
                                    {formatDateTime(
                                      payment.paidAt ||
                                        payment.createdAt
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="provider-payment-actions">
                                  <button
                                    type="button"
                                    title="View payment"
                                    onClick={() =>
                                      setSelectedPayment(
                                        payment
                                      )
                                    }
                                  >
                                    <FiEye />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="provider-payments-mobile-list">
                  {filteredPayments.map(
                    (payment) => (
                      <article
                        className="provider-payment-mobile-card"
                        key={payment._id}
                      >
                        <div className="provider-payment-mobile-head">
                          <div className="provider-payment-company-info">
                            <span className="provider-payment-company-avatar">
                              {getCompanyInitial(
                                payment
                              )}
                            </span>

                            <div>
                              <strong>
                                {
                                  payment.companyName
                                }
                              </strong>

                              <span>
                                {
                                  payment.ownerName
                                }
                              </span>
                            </div>
                          </div>

                          <span
                            className={`provider-payment-status-badge ${getPaymentStatusClass(
                              payment.paymentStatus
                            )}`}
                          >
                            {formatText(
                              payment.paymentStatus
                            )}
                          </span>
                        </div>

                        <div className="provider-payment-mobile-grid">
                          <div>
                            <span>Plan</span>

                            <strong>
                              {payment.planName ||
                                "No Plan"}
                            </strong>
                          </div>

                          <div>
                            <span>Amount</span>

                            <strong>
                              {formatCurrency(
                                payment.totalAmount,
                                payment.currency
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Method
                            </span>

                            <strong>
                              {formatText(
                                payment.paymentMethod
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Paid Date
                            </span>

                            <strong>
                              {formatDate(
                                payment.paidAt ||
                                  payment.createdAt
                              )}
                            </strong>
                          </div>
                        </div>

                        <div className="provider-payment-mobile-reference">
                          <span>
                            Order ID
                          </span>

                          <strong>
                            {
                              payment.razorpayOrderId
                            }
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="provider-payment-mobile-view-btn"
                          onClick={() =>
                            setSelectedPayment(
                              payment
                            )
                          }
                        >
                          <FiEye />
                          View Details
                        </button>
                      </article>
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      {selectedPayment && (
        <div
          className="provider-payment-drawer-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedPayment(null);
            }
          }}
        >
          <aside className="provider-payment-drawer">
            <div className="provider-payment-drawer-header">
              <div>
                <p>
                  Payment Details
                </p>

                <h2>
                  {selectedPayment.companyName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPayment(null)
                }
                aria-label="Close payment details"
              >
                <FiX />
              </button>
            </div>

            <div className="provider-payment-drawer-body">
              <div className="provider-payment-drawer-amount-card">
                <span>
                  Total Amount
                </span>

                <strong>
                  {formatCurrency(
                    selectedPayment.totalAmount,
                    selectedPayment.currency
                  )}
                </strong>

                <small>
                  Paid through{" "}
                  {formatText(
                    selectedPayment.paymentMethod
                  )}
                </small>
              </div>

              <div className="provider-payment-drawer-section">
                <h3>
                  Company Details
                </h3>

                <div className="provider-payment-details-list">
                  <div>
                    <FiHome />

                    <span>
                      <small>
                        Company
                      </small>

                      <strong>
                        {
                          selectedPayment.companyName
                        }
                      </strong>
                    </span>
                  </div>

                  <div>
                    <FiUser />

                    <span>
                      <small>
                        Owner
                      </small>

                      <strong>
                        {
                          selectedPayment.ownerName
                        }
                      </strong>
                    </span>
                  </div>

                  <div>
                    <FiFileText />

                    <span>
                      <small>
                        Email
                      </small>

                      <strong>
                        {
                          selectedPayment.ownerEmail
                        }
                      </strong>
                    </span>
                  </div>

                  <div>
                    <FiSmartphone />

                    <span>
                      <small>
                        Phone
                      </small>

                      <strong>
                        {
                          selectedPayment.ownerPhone
                        }
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="provider-payment-drawer-section">
                <h3>
                  Plan and Amount
                </h3>

                <div className="provider-payment-details-list">
                  <div>
                    <FiFileText />

                    <span>
                      <small>
                        Plan
                      </small>

                      <strong>
                        {
                          selectedPayment.planName
                        }
                      </strong>
                    </span>
                  </div>

                  <div>
                    <FiDollarSign />

                    <span>
                      <small>
                        Base Amount
                      </small>

                      <strong>
                        {formatCurrency(
                          selectedPayment.amount,
                          selectedPayment.currency
                        )}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <FiDollarSign />

                    <span>
                      <small>
                        Tax Amount
                      </small>

                      <strong>
                        {formatCurrency(
                          selectedPayment.taxAmount,
                          selectedPayment.currency
                        )}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <FiDollarSign />

                    <span>
                      <small>
                        Total Amount
                      </small>

                      <strong>
                        {formatCurrency(
                          selectedPayment.totalAmount,
                          selectedPayment.currency
                        )}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="provider-payment-drawer-section">
                <h3>
                  Payment Method
                </h3>

                <div className="provider-payment-details-list">
                  <div>
                    {getPaymentMethodIcon(
                      selectedPayment.paymentMethod
                    )}

                    <span>
                      <small>
                        Method
                      </small>

                      <strong>
                        {formatText(
                          selectedPayment.paymentMethod
                        )}
                      </strong>
                    </span>
                  </div>

                  {selectedPayment.bank && (
                    <div>
                      <FiHome />

                      <span>
                        <small>
                          Bank
                        </small>

                        <strong>
                          {
                            selectedPayment.bank
                          }
                        </strong>
                      </span>
                    </div>
                  )}

                  {selectedPayment.vpa && (
                    <div>
                      <FiSmartphone />

                      <span>
                        <small>
                          UPI ID
                        </small>

                        <strong>
                          {
                            selectedPayment.vpa
                          }
                        </strong>
                      </span>
                    </div>
                  )}

                  {selectedPayment.wallet && (
                    <div>
                      <FiDollarSign />

                      <span>
                        <small>
                          Wallet
                        </small>

                        <strong>
                          {
                            selectedPayment.wallet
                          }
                        </strong>
                      </span>
                    </div>
                  )}

                  {selectedPayment.cardNetwork && (
                    <div>
                      <FiCreditCard />

                      <span>
                        <small>
                          Card
                        </small>

                        <strong>
                          {[
                            selectedPayment.cardNetwork,
                            selectedPayment.cardType,
                            selectedPayment.cardLastFour
                              ? `•••• ${selectedPayment.cardLastFour}`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="provider-payment-drawer-section">
                <h3>
                  Transaction Details
                </h3>

                <div className="provider-payment-transaction-box">
                  <div>
                    <span>
                      Payment Status
                    </span>

                    <strong>
                      {formatText(
                        selectedPayment.paymentStatus
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Razorpay Order ID
                    </span>

                    <strong>
                      {
                        selectedPayment.razorpayOrderId
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Razorpay Payment ID
                    </span>

                    <strong>
                      {
                        selectedPayment.razorpayPaymentId
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Payment Provider
                    </span>

                    <strong>
                      {formatText(
                        selectedPayment.paymentProvider
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Paid At
                    </span>

                    <strong>
                      {formatDateTime(
                        selectedPayment.paidAt
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Payments;