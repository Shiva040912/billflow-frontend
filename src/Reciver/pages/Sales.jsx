import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiEye,
  FiFileText,
  FiPlus,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTrendingUp,
  FiUser,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../services/axios";
import "../styles/sales.css";

const Sales = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState("");
  const [printingInvoiceId, setPrintingInvoiceId] = useState("");

  const [collectPaymentInvoice, setCollectPaymentInvoice] = useState(null);
  const [collectionAmount, setCollectionAmount] = useState("");
  const [collectionMethod, setCollectionMethod] = useState("cash");
  const [collectionError, setCollectionError] = useState("");
  const [isCollectingPayment, setIsCollectingPayment] = useState(false);

  const printFrameRef = useRef(null);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("billFlowAccessToken");
    localStorage.removeItem("billFlowUser");
    localStorage.removeItem("billFlowCompany");
    window.location.href = "/login";
  }, []);

  const normalizeInvoices = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.invoices)) return data.invoices;
    return [];
  };

  const fetchInvoices = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        refresh ? setIsRefreshing(true) : setIsLoading(true);

        const response = await api.get("/invoices");
        setInvoices(normalizeInvoices(response.data));
      } catch (error) {
        console.error("Sales invoices fetch error:", error);

        if (error.response?.status === 401) {
          handleUnauthorized();
          return;
        }

        const responseMessage = error.response?.data?.message;

        toast.error(
          Array.isArray(responseMessage)
            ? responseMessage.join(", ")
            : responseMessage || "Sales data load panna mudiyala",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleUnauthorized],
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    if (!selectedInvoice && !collectPaymentInvoice) return undefined;

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (collectPaymentInvoice) {
        setCollectPaymentInvoice(null);
        setCollectionAmount("");
        setCollectionError("");
        return;
      }

      setSelectedInvoice(null);
    };

    document.addEventListener("keydown", handleEscape);
    document.body.classList.add("sales-detail-open");

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("sales-detail-open");
    };
  }, [selectedInvoice, collectPaymentInvoice]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatDate = (value, includeTime = false) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(includeTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
          }
        : {}),
    }).format(date);
  };

  const getInvoiceCustomerName = (invoice) =>
    invoice?.customerName ||
    invoice?.customerId?.name ||
    "Walk-in Customer";

  const getInvoiceCustomerPhone = (invoice) =>
    invoice?.customerPhone || invoice?.customerId?.phone || "";

  const getPendingAmount = (invoice) => {
    if (invoice?.pendingAmount !== undefined) {
      return Number(invoice.pendingAmount) || 0;
    }

    return Math.max(
      0,
      (Number(invoice?.grandTotal) || 0) - (Number(invoice?.paidAmount) || 0),
    );
  };

  const getPaymentStatus = (invoice) => {
    const status = String(invoice?.paymentStatus || "").toLowerCase();

    if (status === "pending" || status === "unpaid" || status === "due") {
      return "pending";
    }

    if (status === "partial") return "partial";
    if (status === "paid") return "paid";

    const grandTotal = Number(invoice?.grandTotal) || 0;
    const paidAmount = Number(invoice?.paidAmount) || 0;

    if (paidAmount <= 0 && grandTotal > 0) return "pending";
    if (paidAmount > 0 && paidAmount < grandTotal) return "partial";

    return "paid";
  };

  const getStatusLabel = (status) => {
    if (status === "partial") return "Partial";
    if (status === "pending") return "Due";
    return "Paid";
  };

  const getPaymentMethodLabel = (method) => {
    const value = String(method || "").toLowerCase();

    if (value === "upi") return "UPI";
    if (value === "card") return "Card";
    if (value === "credit") return "Credit";
    if (value === "bank_transfer") return "Bank Transfer";
    if (value === "cash") return "Cash";

    return value ? value.replaceAll("_", " ") : "—";
  };

  const canCollectPayment = (invoice) => {
    if (!invoice) return false;

    const status = getPaymentStatus(invoice);
    const pendingAmount = getPendingAmount(invoice);

    return (
      status !== "paid" &&
      (pendingAmount > 0 || status === "pending" || status === "partial")
    );
  };

  const closeCollectPaymentModal = () => {
    if (isCollectingPayment) return;

    setCollectPaymentInvoice(null);
    setCollectionAmount("");
    setCollectionMethod("cash");
    setCollectionError("");
  };

  const openCollectPaymentModal = (invoice) => {
    if (!invoice?._id || !canCollectPayment(invoice)) return;

    const pendingAmount = getPendingAmount(invoice);

    if (pendingAmount <= 0) {
      toast.error("No pending amount available for this invoice");
      return;
    }

    setCollectPaymentInvoice(invoice);
    setCollectionAmount("");
    setCollectionMethod("cash");
    setCollectionError("");
  };

  const isWithinDateRange = (createdAt) => {
    if (dateFilter === "all") return true;
    if (!createdAt) return false;

    const invoiceDate = new Date(createdAt);

    if (Number.isNaN(invoiceDate.getTime())) return false;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    if (dateFilter === "today") {
      return invoiceDate >= startOfToday;
    }

    const days = dateFilter === "7days" ? 7 : 30;
    const cutoff = new Date(startOfToday);
    cutoff.setDate(cutoff.getDate() - (days - 1));

    return invoiceDate >= cutoff;
  };

  const filteredInvoices = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const status = getPaymentStatus(invoice);
      const paymentMethod = String(invoice.paymentMethod || "").toLowerCase();

      const matchesSearch =
        !search ||
        String(invoice.invoiceNumber || "")
          .toLowerCase()
          .includes(search) ||
        getInvoiceCustomerName(invoice).toLowerCase().includes(search) ||
        getInvoiceCustomerPhone(invoice).toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      const matchesMethod =
        methodFilter === "all" || paymentMethod === methodFilter;

      const matchesDate = isWithinDateRange(invoice.createdAt);

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });
  }, [invoices, searchTerm, statusFilter, methodFilter, dateFilter]);

  const summary = useMemo(() => {
    return invoices.reduce(
      (result, invoice) => {
        const grandTotal = Number(invoice.grandTotal) || 0;
        const paidAmount = Number(invoice.paidAmount) || 0;
        const pendingAmount = getPendingAmount(invoice);

        result.totalInvoices += 1;
        result.totalSales += grandTotal;
        result.totalCollected += paidAmount;
        result.totalPending += pendingAmount;

        if (getPaymentStatus(invoice) === "paid") {
          result.paidInvoices += 1;
        }

        return result;
      },
      {
        totalInvoices: 0,
        totalSales: 0,
        totalCollected: 0,
        totalPending: 0,
        paidInvoices: 0,
      },
    );
  }, [invoices]);

  const hasFilters =
    searchTerm.trim() ||
    statusFilter !== "all" ||
    methodFilter !== "all" ||
    dateFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
    setDateFilter("all");
  };

  const openInvoiceDetails = async (invoice) => {
    setSelectedInvoice(invoice);

    if (!invoice?._id) return;

    try {
      setIsDetailLoading(true);

      const response = await api.get(`/invoices/${invoice._id}`);
      const invoiceData = response.data?.invoice || response.data;

      if (invoiceData?._id) {
        setSelectedInvoice(invoiceData);
      }
    } catch (error) {
      console.error("Invoice detail fetch error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      // List response already has useful invoice details, so keep modal usable.
    } finally {
      setIsDetailLoading(false);
    }
  };

  const collectionPendingAmount = collectPaymentInvoice
    ? getPendingAmount(collectPaymentInvoice)
    : 0;

  const numericCollectionAmount = Number(collectionAmount);
  const collectionAmountForPreview =
    Number.isFinite(numericCollectionAmount) && numericCollectionAmount > 0
      ? numericCollectionAmount
      : 0;
  const remainingDuePreview = Math.max(
    0,
    collectionPendingAmount - collectionAmountForPreview,
  );

  const handleCollectionAmountChange = (event) => {
    const value = event.target.value;

    setCollectionAmount(value);

    if (!value) {
      setCollectionError("");
      return;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      setCollectionError("Collection amount must be greater than 0");
      return;
    }

    if (amount > collectionPendingAmount) {
      setCollectionError("Collection amount cannot exceed current due amount");
      return;
    }

    setCollectionError("");
  };

  const handleCollectPayment = async (event) => {
    event.preventDefault();

    if (!collectPaymentInvoice?._id || isCollectingPayment) return;

    const amount = Number(collectionAmount);
    const currentPendingAmount = getPendingAmount(collectPaymentInvoice);

    if (!Number.isFinite(amount) || amount <= 0) {
      setCollectionError("Collection amount must be greater than 0");
      return;
    }

    if (amount > currentPendingAmount) {
      setCollectionError("Collection amount cannot exceed current due amount");
      return;
    }

    try {
      setIsCollectingPayment(true);
      setCollectionError("");

      const response = await api.patch(
        `/invoices/${collectPaymentInvoice._id}/collect-payment`,
        {
          amount,
          paymentMethod: collectionMethod,
        },
      );

      const responseInvoice =
        response.data?.invoice ||
        response.data?.updatedInvoice ||
        response.data?.data?.invoice ||
        response.data?.data ||
        response.data;

      const fallbackPaidAmount =
        (Number(collectPaymentInvoice.paidAmount) || 0) + amount;
      const fallbackPendingAmount = Math.max(0, currentPendingAmount - amount);
      const fallbackPaymentStatus =
        fallbackPendingAmount <= 0 ? "paid" : "partial";

      const updatedInvoice = {
        ...collectPaymentInvoice,
        ...(responseInvoice && typeof responseInvoice === "object"
          ? responseInvoice
          : {}),
        paidAmount:
          responseInvoice?.paidAmount !== undefined
            ? responseInvoice.paidAmount
            : fallbackPaidAmount,
        pendingAmount:
          responseInvoice?.pendingAmount !== undefined
            ? responseInvoice.pendingAmount
            : fallbackPendingAmount,
        paymentStatus:
          responseInvoice?.paymentStatus || fallbackPaymentStatus,
        paymentMethod:
          responseInvoice?.paymentMethod ||
          collectPaymentInvoice.paymentMethod ||
          collectionMethod,
      };

      const finalPendingAmount = getPendingAmount(updatedInvoice);
      updatedInvoice.paymentStatus =
        finalPendingAmount <= 0 ? "paid" : "partial";

      setInvoices((currentInvoices) =>
        currentInvoices.map((invoice) =>
          invoice._id === updatedInvoice._id
            ? { ...invoice, ...updatedInvoice }
            : invoice,
        ),
      );

      setSelectedInvoice((currentInvoice) =>
        currentInvoice?._id === updatedInvoice._id
          ? { ...currentInvoice, ...updatedInvoice }
          : currentInvoice,
      );

      setCollectPaymentInvoice(null);
      setCollectionAmount("");
      setCollectionMethod("cash");
      setCollectionError("");

      if (finalPendingAmount <= 0) {
        toast.success("Payment collected. Bill closed successfully.");
      } else {
        toast.success(
          `Payment collected successfully. Remaining due: ${formatPrice(
            finalPendingAmount,
          )}`,
        );
      }
    } catch (error) {
      console.error("Collect payment error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const responseMessage = error.response?.data?.message;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(", ")
        : responseMessage || "Payment collect panna mudiyala";

      setCollectionError(message);
      toast.error(message);
    } finally {
      setIsCollectingPayment(false);
    }
  };

  const getInvoicePdfBlob = async (invoiceId) => {
    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });

    return new Blob([response.data], {
      type: "application/pdf",
    });
  };

  const handleDownloadInvoice = async (invoice) => {
    if (!invoice?._id) {
      toast.error("Invoice details unavailable");
      return;
    }

    try {
      setDownloadingInvoiceId(invoice._id);

      const pdfBlob = await getInvoicePdfBlob(invoice._id);
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = `${invoice.invoiceNumber || "invoice"}.pdf`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("Invoice PDF download error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const responseMessage = error.response?.data?.message;

      toast.error(
        Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage || "Invoice PDF download panna mudiyala",
      );
    } finally {
      setDownloadingInvoiceId("");
    }
  };

  const handlePrintInvoice = async (invoice) => {
    if (!invoice?._id) {
      toast.error("Invoice details unavailable");
      return;
    }

    try {
      setPrintingInvoiceId(invoice._id);

      const pdfBlob = await getInvoicePdfBlob(invoice._id);
      const printUrl = window.URL.createObjectURL(pdfBlob);
      const frame = printFrameRef.current;

      if (!frame) {
        throw new Error("Print frame unavailable");
      }

      frame.onload = () => {
        window.setTimeout(() => {
          try {
            frame.contentWindow?.focus();
            frame.contentWindow?.print();
          } finally {
            window.setTimeout(() => {
              window.URL.revokeObjectURL(printUrl);
            }, 2000);
          }
        }, 250);
      };

      frame.src = printUrl;
    } catch (error) {
      console.error("Invoice print error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        error.response?.data?.message || "Invoice print panna mudiyala",
      );
    } finally {
      window.setTimeout(() => setPrintingInvoiceId(""), 500);
    }
  };

  if (isLoading) {
    return (
      <main className="sales-page">
        <div className="sales-loading-state">
          <span className="sales-loader" />
          <strong>Sales workspace loading...</strong>
          <p>Billing invoices fetch aaguthu.</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="sales-page">
        <section className="sales-page-header">
          <div className="sales-header-copy">
            <span className="sales-eyebrow">Sales Command Center</span>
            <h1>Sales & Collections</h1>
            <p>
              Invoices, paid collections, credit sales and pending balances-ah
              ore clean workspace-la monitor pannunga.
            </p>
          </div>

          <div className="sales-header-actions">
            <button
              type="button"
              className="sales-refresh-btn"
              onClick={() => fetchInvoices({ refresh: true })}
              disabled={isRefreshing}
            >
              <FiRefreshCw className={isRefreshing ? "is-spinning" : ""} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              type="button"
              className="sales-new-bill-btn"
              onClick={() => navigate("/billing")}
            >
              <FiPlus />
              <span>New Bill</span>
              <FiArrowRight />
            </button>
          </div>
        </section>

        <section className="sales-summary-grid">
          <article className="sales-summary-card sales-summary-sales">
            <div className="sales-summary-icon">
              <FiShoppingBag />
            </div>
            <div>
              <span>Total Sales</span>
              <strong>{formatPrice(summary.totalSales)}</strong>
              <small>{summary.totalInvoices} invoices generated</small>
            </div>
          </article>

          <article className="sales-summary-card sales-summary-collected">
            <div className="sales-summary-icon">
              <FiCheckCircle />
            </div>
            <div>
              <span>Collected</span>
              <strong>{formatPrice(summary.totalCollected)}</strong>
              <small>{summary.paidInvoices} fully paid invoices</small>
            </div>
          </article>

          <article className="sales-summary-card sales-summary-due">
            <div className="sales-summary-icon">
              <FiClock />
            </div>
            <div>
              <span>Pending Amount</span>
              <strong>{formatPrice(summary.totalPending)}</strong>
              <small>Partial + credit balance</small>
            </div>
          </article>

          <article className="sales-summary-card sales-summary-average">
            <div className="sales-summary-icon">
              <FiTrendingUp />
            </div>
            <div>
              <span>Average Bill</span>
              <strong>
                {formatPrice(
                  summary.totalInvoices
                    ? summary.totalSales / summary.totalInvoices
                    : 0,
                )}
              </strong>
              <small>Average invoice value</small>
            </div>
          </article>
        </section>

        <section className="sales-performance-strip">
          <div className="sales-performance-item">
            <span>Paid Invoices</span>
            <strong>{summary.paidInvoices}</strong>
          </div>

          <div className="sales-performance-item">
            <span>Outstanding</span>
            <strong className="is-due">{formatPrice(summary.totalPending)}</strong>
          </div>

          <div className="sales-performance-item">
            <span>Collection Rate</span>
            <strong>
              {summary.totalSales > 0
                ? `${Math.round(
                    (summary.totalCollected / summary.totalSales) * 100,
                  )}%`
                : "0%"}
            </strong>
          </div>

          <div className="sales-performance-action">
            <FiDollarSign />
            <span>Pending invoice-la Collect action use panni balance close pannalam.</span>
          </div>
        </section>

        <section className="sales-workspace">
          <div className="sales-workspace-head">
            <div>
              <span className="sales-workspace-kicker">Transaction Register</span>
              <h2>Invoice Activity</h2>
              <p>
                Search invoices, review collection status, close dues and access documents.
              </p>
            </div>

            <div className="sales-result-count">
              <FiActivity />
              <span>
                <strong>{filteredInvoices.length}</strong> of {invoices.length}
              </span>
            </div>
          </div>

          <div className="sales-toolbar">
            <div className="sales-search">
              <FiSearch />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Invoice no, customer name or phone..."
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear sales search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="sales-filter-group">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter payment status"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Due</option>
              </select>

              <select
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
                aria-label="Filter payment method"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
              </select>

              <div className="sales-date-filter">
                <FiCalendar />
                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  aria-label="Filter invoice date"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                </select>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  className="sales-clear-filters"
                  onClick={clearFilters}
                >
                  <FiX />
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="sales-empty-state">
              <div className="sales-empty-icon">
                <FiFileText />
              </div>
              <h3>No sales found</h3>
              <p>
                {invoices.length === 0
                  ? "Billing page-la first sale create pannunga."
                  : "Current search or filter-ku invoice match aagala."}
              </p>

              {invoices.length === 0 ? (
                <button type="button" onClick={() => navigate("/billing")}>
                  <FiPlus />
                  Create New Bill
                </button>
              ) : (
                <button type="button" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="sales-desktop-table">
                <div className="sales-table-scroll">
                  <table className="sales-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th className="sales-text-right">Paid</th>
                        <th className="sales-text-right">Due</th>
                        <th className="sales-text-right">Total</th>
                        <th className="sales-actions-head">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredInvoices.map((invoice) => {
                        const paymentStatus = getPaymentStatus(invoice);
                        const pendingAmount = getPendingAmount(invoice);
                        const isDownloading =
                          downloadingInvoiceId === invoice._id;
                        const isPrinting = printingInvoiceId === invoice._id;

                        return (
                          <tr key={invoice._id}>
                            <td>
                              <button
                                type="button"
                                className="sales-invoice-link"
                                onClick={() => openInvoiceDetails(invoice)}
                              >
                                <span className="sales-invoice-icon">
                                  <FiFileText />
                                </span>
                                <span>
                                  <strong>
                                    {invoice.invoiceNumber || "Invoice"}
                                  </strong>
                                  <small>
                                    {Array.isArray(invoice.items)
                                      ? `${invoice.items.length} item${
                                          invoice.items.length === 1 ? "" : "s"
                                        }`
                                      : "Invoice"}
                                  </small>
                                </span>
                              </button>
                            </td>

                            <td>
                              <div className="sales-customer-cell">
                                <strong>{getInvoiceCustomerName(invoice)}</strong>
                                <span>
                                  {getInvoiceCustomerPhone(invoice) ||
                                    "No phone"}
                                </span>
                              </div>
                            </td>

                            <td>
                              <div className="sales-date-cell">
                                <strong>{formatDate(invoice.createdAt)}</strong>
                                <span>
                                  {invoice.createdAt
                                    ? new Date(
                                        invoice.createdAt,
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`sales-method sales-method-${String(
                                  invoice.paymentMethod || "unknown",
                                ).toLowerCase()}`}
                              >
                                <FiCreditCard />
                                {getPaymentMethodLabel(invoice.paymentMethod)}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`sales-status sales-status-${paymentStatus}`}
                              >
                                <span />
                                {getStatusLabel(paymentStatus)}
                              </span>
                            </td>

                            <td className="sales-text-right sales-money-muted">
                              {formatPrice(invoice.paidAmount)}
                            </td>

                            <td
                              className={`sales-text-right ${
                                pendingAmount > 0
                                  ? "sales-money-due"
                                  : "sales-money-muted"
                              }`}
                            >
                              {formatPrice(pendingAmount)}
                            </td>

                            <td className="sales-text-right sales-total-cell">
                              {formatPrice(invoice.grandTotal)}
                            </td>

                            <td>
                              <div className="sales-row-actions">
                                {canCollectPayment(invoice) && (
                                  <button
                                    type="button"
                                    className="sales-collect-icon-btn"
                                    onClick={() => openCollectPaymentModal(invoice)}
                                    title="Collect payment"
                                    aria-label={`Collect payment for ${
                                      invoice.invoiceNumber || "invoice"
                                    }`}
                                  >
                                    <FiDollarSign />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => openInvoiceDetails(invoice)}
                                  title="View invoice"
                                  aria-label={`View ${
                                    invoice.invoiceNumber || "invoice"
                                  }`}
                                >
                                  <FiEye />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePrintInvoice(invoice)}
                                  disabled={isPrinting}
                                  title="Print invoice"
                                  aria-label={`Print ${
                                    invoice.invoiceNumber || "invoice"
                                  }`}
                                >
                                  <FiPrinter />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadInvoice(invoice)}
                                  disabled={isDownloading}
                                  title="Download PDF"
                                  aria-label={`Download ${
                                    invoice.invoiceNumber || "invoice"
                                  }`}
                                >
                                  <FiDownload />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sales-mobile-list">
                {filteredInvoices.map((invoice) => {
                  const paymentStatus = getPaymentStatus(invoice);
                  const pendingAmount = getPendingAmount(invoice);
                  const isDownloading = downloadingInvoiceId === invoice._id;
                  const isPrinting = printingInvoiceId === invoice._id;

                  return (
                    <article className="sales-mobile-card" key={invoice._id}>
                      <div className="sales-mobile-card-head">
                        <div>
                          <span>Invoice</span>
                          <strong>{invoice.invoiceNumber || "Invoice"}</strong>
                        </div>

                        <span
                          className={`sales-status sales-status-${paymentStatus}`}
                        >
                          <span />
                          {getStatusLabel(paymentStatus)}
                        </span>
                      </div>

                      <div className="sales-mobile-customer">
                        <span className="sales-mobile-avatar">
                          <FiUser />
                        </span>
                        <div>
                          <strong>{getInvoiceCustomerName(invoice)}</strong>
                          <span>
                            {getInvoiceCustomerPhone(invoice) || "No phone"}
                          </span>
                        </div>
                      </div>

                      <div className="sales-mobile-meta">
                        <div>
                          <span>Date</span>
                          <strong>{formatDate(invoice.createdAt)}</strong>
                        </div>
                        <div>
                          <span>Payment</span>
                          <strong>
                            {getPaymentMethodLabel(invoice.paymentMethod)}
                          </strong>
                        </div>
                      </div>

                      <div className="sales-mobile-money">
                        <div>
                          <span>Paid</span>
                          <strong>{formatPrice(invoice.paidAmount)}</strong>
                        </div>
                        <div>
                          <span>Due</span>
                          <strong className={pendingAmount > 0 ? "is-due" : ""}>
                            {formatPrice(pendingAmount)}
                          </strong>
                        </div>
                        <div className="sales-mobile-grand-total">
                          <span>Total</span>
                          <strong>{formatPrice(invoice.grandTotal)}</strong>
                        </div>
                      </div>

                      <div
                        className={`sales-mobile-actions ${
                          canCollectPayment(invoice) ? "has-collect" : ""
                        }`}
                      >
                        {canCollectPayment(invoice) && (
                          <button
                            type="button"
                            className="sales-mobile-collect-btn"
                            onClick={() => openCollectPaymentModal(invoice)}
                          >
                            <FiDollarSign />
                            Collect
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openInvoiceDetails(invoice)}
                        >
                          <FiEye />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintInvoice(invoice)}
                          disabled={isPrinting}
                        >
                          <FiPrinter />
                          {isPrinting ? "Opening..." : "Print"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={isDownloading}
                        >
                          <FiDownload />
                          {isDownloading ? "Loading..." : "PDF"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <iframe
          ref={printFrameRef}
          title="Sales invoice print frame"
          className="sales-print-frame"
        />
      </main>

      {selectedInvoice && (
        <div
          className="sales-detail-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedInvoice(null);
            }
          }}
        >
          <aside className="sales-detail-panel">
            <div className="sales-detail-header">
              <div>
                <span>Invoice Details</span>
                <h2>{selectedInvoice.invoiceNumber || "Invoice"}</h2>
                <p>{formatDate(selectedInvoice.createdAt, true)}</p>
              </div>

              <button
                type="button"
                className="sales-detail-close"
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close invoice details"
              >
                <FiX />
              </button>
            </div>

            {isDetailLoading && (
              <div className="sales-detail-loading">
                <span className="sales-loader" />
                Refreshing invoice details...
              </div>
            )}

            <div className="sales-detail-content">
              <section className="sales-detail-customer-card">
                <span className="sales-detail-avatar">
                  <FiUser />
                </span>
                <div>
                  <span>Customer</span>
                  <strong>{getInvoiceCustomerName(selectedInvoice)}</strong>
                  <p>
                    {getInvoiceCustomerPhone(selectedInvoice) || "No phone"}
                  </p>
                  {selectedInvoice.customerAddress && (
                    <small>{selectedInvoice.customerAddress}</small>
                  )}
                </div>
              </section>

              <section className="sales-detail-payment-grid">
                <div>
                  <span>Payment Method</span>
                  <strong>
                    {getPaymentMethodLabel(selectedInvoice.paymentMethod)}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {getStatusLabel(getPaymentStatus(selectedInvoice))}
                  </strong>
                </div>
              </section>

              <section className="sales-detail-section">
                <div className="sales-detail-section-head">
                  <h3>Items</h3>
                  <span>
                    {Array.isArray(selectedInvoice.items)
                      ? selectedInvoice.items.length
                      : 0}{" "}
                    products
                  </span>
                </div>

                <div className="sales-detail-items">
                  {Array.isArray(selectedInvoice.items) &&
                  selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, index) => {
                      const rate = Number(item.price ?? item.unitPrice) || 0;
                      const quantity = Number(item.quantity) || 0;
                      const gstRate = Number(item.gstRate) || 0;
                      const itemTotal =
                        Number(item.total ?? item.totalAmount) ||
                        rate * quantity * (1 + gstRate / 100);

                      return (
                        <article
                          className="sales-detail-item"
                          key={item._id || item.productId || index}
                        >
                          <div className="sales-detail-item-number">
                            {index + 1}
                          </div>

                          <div className="sales-detail-item-info">
                            <strong>
                              {item.productName || item.name || "Product"}
                            </strong>
                            <span>{item.sku || "No SKU"}</span>
                            <small>
                              {formatPrice(rate)} × {quantity} · GST {gstRate}%
                            </small>
                          </div>

                          <strong className="sales-detail-item-total">
                            {formatPrice(itemTotal)}
                          </strong>
                        </article>
                      );
                    })
                  ) : (
                    <div className="sales-detail-no-items">
                      Item details unavailable.
                    </div>
                  )}
                </div>
              </section>

              <section className="sales-detail-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatPrice(selectedInvoice.subtotal)}</strong>
                </div>

                <div>
                  <span>GST</span>
                  <strong>
                    {formatPrice(
                      selectedInvoice.totalGst ?? selectedInvoice.gstAmount,
                    )}
                  </strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>
                    {formatPrice(
                      selectedInvoice.discount ??
                        selectedInvoice.discountAmount ??
                        0,
                    )}
                  </strong>
                </div>

                <div className="sales-detail-total-divider" />

                <div className="sales-detail-grand-total">
                  <span>Grand Total</span>
                  <strong>{formatPrice(selectedInvoice.grandTotal)}</strong>
                </div>

                <div>
                  <span>Paid Amount</span>
                  <strong>{formatPrice(selectedInvoice.paidAmount)}</strong>
                </div>

                <div
                  className={
                    getPendingAmount(selectedInvoice) > 0
                      ? "sales-detail-due-row"
                      : ""
                  }
                >
                  <span>Amount Due</span>
                  <strong>
                    {formatPrice(getPendingAmount(selectedInvoice))}
                  </strong>
                </div>
              </section>
            </div>

            <div
              className={`sales-detail-actions ${
                canCollectPayment(selectedInvoice) ? "has-collect" : ""
              }`}
            >
              {canCollectPayment(selectedInvoice) && (
                <button
                  type="button"
                  className="sales-detail-collect"
                  onClick={() => openCollectPaymentModal(selectedInvoice)}
                >
                  <FiDollarSign />
                  Collect Payment
                </button>
              )}

              <button
                type="button"
                className="sales-detail-secondary"
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                disabled={downloadingInvoiceId === selectedInvoice._id}
              >
                <FiDownload />
                {downloadingInvoiceId === selectedInvoice._id
                  ? "Downloading..."
                  : "Download PDF"}
              </button>

              <button
                type="button"
                className="sales-detail-primary"
                onClick={() => handlePrintInvoice(selectedInvoice)}
                disabled={printingInvoiceId === selectedInvoice._id}
              >
                <FiPrinter />
                {printingInvoiceId === selectedInvoice._id
                  ? "Opening Print..."
                  : "Reprint Invoice"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {collectPaymentInvoice && (
        <div
          className="sales-collect-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCollectPaymentModal();
            }
          }}
        >
          <div
            className="sales-collect-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sales-collect-title"
          >
            <div className="sales-collect-header">
              <div className="sales-collect-header-icon">
                <FiDollarSign />
              </div>

              <div className="sales-collect-header-copy">
                <span>Payment Collection</span>
                <h2 id="sales-collect-title">Collect Payment / Close Bill</h2>
                <p>{collectPaymentInvoice.invoiceNumber || "Invoice"}</p>
              </div>

              <button
                type="button"
                className="sales-collect-close"
                onClick={closeCollectPaymentModal}
                disabled={isCollectingPayment}
                aria-label="Close collect payment modal"
              >
                <FiX />
              </button>
            </div>

            <form className="sales-collect-form" onSubmit={handleCollectPayment}>
              <section className="sales-collect-customer">
                <div>
                  <span>Customer</span>
                  <strong>{getInvoiceCustomerName(collectPaymentInvoice)}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>
                    {getInvoiceCustomerPhone(collectPaymentInvoice) || "No phone"}
                  </strong>
                </div>
              </section>

              <section className="sales-collect-summary">
                <div>
                  <span>Grand Total</span>
                  <strong>{formatPrice(collectPaymentInvoice.grandTotal)}</strong>
                </div>
                <div>
                  <span>Already Paid</span>
                  <strong>{formatPrice(collectPaymentInvoice.paidAmount)}</strong>
                </div>
                <div className="sales-collect-due-card">
                  <span>Current Due</span>
                  <strong>{formatPrice(collectionPendingAmount)}</strong>
                </div>
              </section>

              <div className="sales-collect-field">
                <div className="sales-collect-label-row">
                  <label htmlFor="sales-collection-amount">
                    Collection Amount
                  </label>
                  <button
                    type="button"
                    className="sales-pay-full-btn"
                    onClick={() => {
                      setCollectionAmount(String(collectionPendingAmount));
                      setCollectionError("");
                    }}
                    disabled={isCollectingPayment}
                  >
                    Pay Full Due
                  </button>
                </div>

                <div
                  className={`sales-collect-amount-input ${
                    collectionError ? "has-error" : ""
                  }`}
                >
                  <span>₹</span>
                  <input
                    id="sales-collection-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={collectionAmount}
                    onChange={handleCollectionAmountChange}
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isCollectingPayment}
                  />
                </div>

                {collectionError && (
                  <p className="sales-collect-error">{collectionError}</p>
                )}
              </div>

              <fieldset
                className="sales-collect-methods"
                disabled={isCollectingPayment}
              >
                <legend>Payment Method</legend>

                <div className="sales-collect-method-grid">
                  {[
                    { value: "cash", label: "Cash" },
                    { value: "upi", label: "UPI" },
                    { value: "card", label: "Card" },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`sales-collect-method-option ${
                        collectionMethod === method.value ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="collectionMethod"
                        value={method.value}
                        checked={collectionMethod === method.value}
                        onChange={(event) =>
                          setCollectionMethod(event.target.value)
                        }
                      />
                      <FiCreditCard />
                      <span>{method.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <section className="sales-collect-remaining">
                <div>
                  <span>Remaining Due After Collection</span>
                  <strong
                    className={remainingDuePreview <= 0 ? "is-closed" : ""}
                  >
                    {formatPrice(remainingDuePreview)}
                  </strong>
                </div>

                <small>
                  {remainingDuePreview <= 0 && collectionAmountForPreview > 0
                    ? "This payment will close the bill."
                    : "The invoice will remain Partial until the due becomes zero."}
                </small>
              </section>

              <div className="sales-collect-actions">
                <button
                  type="button"
                  className="sales-collect-cancel"
                  onClick={closeCollectPaymentModal}
                  disabled={isCollectingPayment}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sales-collect-submit"
                  disabled={isCollectingPayment}
                >
                  {isCollectingPayment ? (
                    <>
                      <FiRefreshCw className="is-spinning" />
                      Collecting...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle />
                      Collect Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sales;