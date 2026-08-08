import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiClock,
  FiDollarSign,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFileText,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSearch,
  FiShoppingBag,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";


import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
  getCustomerInvoices,
  downloadInvoicePdf,
} from "../services/customer";
import "../styles/customers.css";

const initialFormData = {
  name: "",
  phone: "",
  address: "",
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] =
    useState("");

  const [isCustomerModalOpen, setIsCustomerModalOpen] =
    useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [formData, setFormData] = useState(
    initialFormData,
  );

  const [formErrors, setFormErrors] = useState({});

  const [isHistoryModalOpen, setIsHistoryModalOpen] =
    useState(false);

  const [historyCustomer, setHistoryCustomer] =
    useState(null);

  const [customerInvoices, setCustomerInvoices] =
    useState([]);

  const [isHistoryLoading, setIsHistoryLoading] =
    useState(false);

  const [downloadingInvoiceId, setDownloadingInvoiceId] =
    useState("");

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);

      const response = await getCustomers();

      const customerData = Array.isArray(response)
        ? response
        : response?.customers || [];

      setCustomers(customerData);
    } catch (error) {
      console.error("Fetch customers error:", error);

      toast.error(
        error.response?.data?.message ||
          "Customers load panna mudiyala",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (isCustomerModalOpen && !isSubmitting) {
        handleCloseCustomerModal();
      }

      if (isHistoryModalOpen && !isHistoryLoading) {
        handleCloseHistoryModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [
    isCustomerModalOpen,
    isHistoryModalOpen,
    isSubmitting,
    isHistoryLoading,
  ]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      const customerName =
        customer.name?.toLowerCase() || "";

      const customerPhone =
        customer.phone?.toLowerCase() || "";

      const customerAddress =
        customer.address?.toLowerCase() || "";

      return (
        customerName.includes(normalizedSearch) ||
        customerPhone.includes(normalizedSearch) ||
        customerAddress.includes(normalizedSearch)
      );
    });
  }, [customers, searchTerm]);

  const customerHistorySummary = useMemo(() => {
    return customerInvoices.reduce(
      (summary, invoice) => {
        summary.totalPurchases += Number(
          invoice.grandTotal || 0,
        );

        summary.totalPaid += Number(
          invoice.paidAmount || 0,
        );

        summary.totalPending += Number(
          invoice.pendingAmount || 0,
        );

        return summary;
      },
      {
        totalPurchases: 0,
        totalPaid: 0,
        totalPending: 0,
      },
    );
  }, [customerInvoices]);

  const handleOpenAddCustomer = () => {
    setSelectedCustomer(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (customer) => {
    setSelectedCustomer(customer);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setFormErrors({});
    setIsCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsCustomerModalOpen(false);
    setSelectedCustomer(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    let updatedValue = value;

    if (name === "phone") {
      updatedValue = value
        .replace(/\D/g, "")
        .slice(0, 15);
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: updatedValue,
    }));

    if (formErrors[name]) {
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedName) {
      errors.name = "Customer name required";
    } else if (trimmedName.length > 100) {
      errors.name =
        "Customer name 100 characters-ku mela irukka koodathu";
    }

    if (!trimmedPhone) {
      errors.phone = "Phone number required";
    } else if (!/^\d{10,15}$/.test(trimmedPhone)) {
      errors.phone =
        "Phone number 10 to 15 digits irukkanum";
    }

    if (trimmedAddress.length > 300) {
      errors.address =
        "Address 300 characters-ku mela irukka koodathu";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmitCustomer = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const customerPayload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    try {
      setIsSubmitting(true);

      if (selectedCustomer?._id) {
        const updatedCustomer = await updateCustomer(
          selectedCustomer._id,
          customerPayload,
        );

        setCustomers((currentCustomers) =>
          currentCustomers.map((customer) =>
            customer._id === selectedCustomer._id
              ? updatedCustomer
              : customer,
          ),
        );

        if (
          historyCustomer?._id ===
          selectedCustomer._id
        ) {
          setHistoryCustomer(updatedCustomer);
        }

        toast.success(
          "Customer updated successfully",
        );
      } else {
        const newCustomer = await createCustomer(
          customerPayload,
        );

        setCustomers((currentCustomers) => [
          newCustomer,
          ...currentCustomers,
        ]);

        toast.success(
          "Customer created successfully",
        );
      }

      handleCloseCustomerModal();
    } catch (error) {
      console.error("Save customer error:", error);

      const errorMessage =
        error.response?.data?.message;

      if (Array.isArray(errorMessage)) {
        toast.error(errorMessage[0]);
      } else {
        toast.error(
          errorMessage ||
            "Customer save panna mudiyala",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    const isConfirmed = window.confirm(
      `"${customer.name}" customer-ah delete panna confirm ah? Purchase invoice records delete aagathu.`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingCustomerId(customer._id);

      await deleteCustomer(customer._id);

      setCustomers((currentCustomers) =>
        currentCustomers.filter(
          (currentCustomer) =>
            currentCustomer._id !== customer._id,
        ),
      );

      if (historyCustomer?._id === customer._id) {
        handleCloseHistoryModal();
      }

      toast.success(
        "Customer deleted successfully",
      );
    } catch (error) {
      console.error("Delete customer error:", error);

      toast.error(
        error.response?.data?.message ||
          "Customer delete panna mudiyala",
      );
    } finally {
      setDeletingCustomerId("");
    }
  };

  const handleOpenCustomerHistory = async (customer) => {
    try {
      setHistoryCustomer(customer);
      setCustomerInvoices([]);
      setIsHistoryModalOpen(true);
      setIsHistoryLoading(true);

      const response = await getCustomerInvoices(
        customer._id,
      );

      const invoiceData = Array.isArray(response)
        ? response
        : response?.invoices || [];

      setCustomerInvoices(invoiceData);
    } catch (error) {
      console.error(
        "Customer invoice history fetch error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          "Customer purchase history load panna mudiyala",
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleCloseHistoryModal = () => {
    if (isHistoryLoading) {
      return;
    }

    setIsHistoryModalOpen(false);
    setHistoryCustomer(null);
    setCustomerInvoices([]);
    setDownloadingInvoiceId("");
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      setDownloadingInvoiceId(invoice._id);

      const pdfData = await downloadInvoicePdf(
        invoice._id,
      );

      const pdfBlob =
        pdfData instanceof Blob
          ? pdfData
          : new Blob([pdfData], {
              type: "application/pdf",
            });

      const pdfUrl = window.URL.createObjectURL(
        pdfBlob,
      );

      const downloadLink =
        document.createElement("a");

      downloadLink.href = pdfUrl;
      downloadLink.download = `${
        invoice.invoiceNumber || "invoice"
      }.pdf`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.URL.revokeObjectURL(pdfUrl);

      toast.success("Invoice downloaded");
    } catch (error) {
      console.error(
        "Invoice PDF download error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          "Invoice download panna mudiyala",
      );
    } finally {
      setDownloadingInvoiceId("");
    }
  };

  const formatCreatedDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatInvoiceDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));

  const getPaymentStatusClass = (status) => {
    if (status === "paid") {
      return "paid";
    }

    if (status === "partial") {
      return "partial";
    }

    return "pending";
  };

  const getPaymentStatusLabel = (status) => {
    if (status === "paid") {
      return "Paid";
    }

    if (status === "partial") {
      return "Partially Paid";
    }

    return "Pending";
  };

  return (
    <>
      <div className="customers-page">
        <section className="customers-header">
          <div>
            <p className="customers-eyebrow">
              Customer Management
            </p>

            <h1>Customers</h1>

            <p>
              Manage customer details and view complete
              purchase history.
            </p>
          </div>

          <button
            type="button"
            className="customers-add-btn"
            onClick={handleOpenAddCustomer}
          >
            <FiPlus />

            Add Customer
          </button>
        </section>

        <section className="customers-summary-grid">
          <article className="customers-summary-card">
            <div className="customers-summary-icon">
              <FiUsers />
            </div>

            <div>
              <span>Total Customers</span>

              <strong>{customers.length}</strong>
            </div>
          </article>
        </section>

        <section className="customers-toolbar">
          <div className="customers-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search by name, phone or address..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>
        </section>

        <section className="customers-table-card">
          {isLoading ? (
            <div className="customers-empty-state">
              <h3>Loading customers...</h3>

              <p>Please wait for a moment.</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="customers-empty-state">
              <FiUsers />

              <h3>No customers available</h3>

              <p>
                {customers.length === 0
                  ? "Add your first customer to start billing."
                  : "No customers match your search."}
              </p>
            </div>
          ) : (
            <div className="customers-table-wrapper">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Added Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={customer._id}
                        className="customers-clickable-row"
                        onClick={() =>
                          handleOpenCustomerHistory(
                            customer,
                          )
                        }
                      >
                        <td>
                          <div className="customers-customer-info">
                            <div className="customers-avatar">
                              <FiUser />
                            </div>

                            <div>
                              <strong>
                                {customer.name}
                              </strong>

                              <span>
                                Click to view purchases
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="customers-contact-info">
                            <FiPhone />

                            <span>
                              {customer.phone}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="customers-address-info">
                            <FiMapPin />

                            <span>
                              {customer.address ||
                                "No address"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {formatCreatedDate(
                            customer.createdAt,
                          )}
                        </td>

                        <td>
                          <div className="customers-actions">
                            <button
                              type="button"
                              className="customers-action-btn view"
                              title="View purchase history"
                              onClick={(event) => {
                                event.stopPropagation();

                                handleOpenCustomerHistory(
                                  customer,
                                );
                              }}
                            >
                              <FiEye />
                            </button>

                            <button
                              type="button"
                              className="customers-action-btn"
                              title="Edit customer"
                              onClick={(event) => {
                                event.stopPropagation();

                                handleOpenEditCustomer(
                                  customer,
                                );
                              }}
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className="customers-action-btn delete"
                              title="Delete customer"
                              disabled={
                                deletingCustomerId ===
                                customer._id
                              }
                              onClick={(event) => {
                                event.stopPropagation();

                                handleDeleteCustomer(
                                  customer,
                                );
                              }}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {isHistoryModalOpen && historyCustomer && (
        <div
          className="customer-history-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseHistoryModal();
            }
          }}
        >
          <section
            className="customer-history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-history-title"
          >
            <header className="customer-history-header">
              <div className="customer-history-profile">
                <div className="customer-history-avatar">
                  <FiUser />
                </div>

                <div>
                  <p>Customer Profile</p>

                  <h2 id="customer-history-title">
                    {historyCustomer.name}
                  </h2>

                  <div className="customer-history-contact">
                    <span>
                      <FiPhone />
                      {historyCustomer.phone}
                    </span>

                    <span>
                      <FiMapPin />
                      {historyCustomer.address ||
                        "No address"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="customer-history-header-actions">
                <button
                  type="button"
                  className="customer-history-edit-btn"
                  onClick={() =>
                    handleOpenEditCustomer(
                      historyCustomer,
                    )
                  }
                >
                  <FiEdit2 />
                  Edit
                </button>

                <button
                  type="button"
                  className="customer-history-delete-btn"
                  disabled={
                    deletingCustomerId ===
                    historyCustomer._id
                  }
                  onClick={() =>
                    handleDeleteCustomer(
                      historyCustomer,
                    )
                  }
                >
                  <FiTrash2 />
                  Delete
                </button>

                <button
                  type="button"
                  className="customer-history-close-btn"
                  onClick={handleCloseHistoryModal}
                  disabled={isHistoryLoading}
                  aria-label="Close customer history"
                >
                  <FiX />
                </button>
              </div>
            </header>

            <div className="customer-history-body">
              {isHistoryLoading ? (
                <div className="customer-history-loading">
                  <div className="customer-history-spinner" />

                  <h3>Loading purchase history</h3>

                  <p>
                    Customer invoices load aaguthu.
                  </p>
                </div>
              ) : (
                <>
                  <section className="customer-history-summary">
                    <article>
                      <span className="customer-history-summary-icon">
                        <FiFileText />
                      </span>

                      <div>
                        <span>Total Bills</span>

                        <strong>
                          {customerInvoices.length}
                        </strong>
                      </div>
                    </article>

                    <article>
                      <span className="customer-history-summary-icon purchases">
                        <FiShoppingBag />
                      </span>

                      <div>
                        <span>Total Purchases</span>

                        <strong>
                          {formatCurrency(
                            customerHistorySummary.totalPurchases,
                          )}
                        </strong>
                      </div>
                    </article>

                    <article>
                      <span className="customer-history-summary-icon paid">
                        <FiDollarSign />
                      </span>

                      <div>
                        <span>Total Paid</span>

                        <strong>
                          {formatCurrency(
                            customerHistorySummary.totalPaid,
                          )}
                        </strong>
                      </div>
                    </article>

                    <article>
                      <span className="customer-history-summary-icon pending">
                        <FiClock />
                      </span>

                      <div>
                        <span>Pending Amount</span>

                        <strong>
                          {formatCurrency(
                            customerHistorySummary.totalPending,
                          )}
                        </strong>
                      </div>
                    </article>
                  </section>

                  <section className="customer-purchase-section">
                    <div className="customer-purchase-heading">
                      <div>
                        <h3>Purchase History</h3>

                        <p>
                          Customer oda complete invoice
                          details.
                        </p>
                      </div>
                    </div>

                    {customerInvoices.length === 0 ? (
                      <div className="customer-history-empty">
                        <FiShoppingBag />

                        <h4>No purchases available</h4>

                        <p>
                          Intha customer-ku invoice
                          create pannumbodhu inga varum.
                        </p>
                      </div>
                    ) : (
                      <div className="customer-invoice-list">
                        {customerInvoices.map(
                          (invoice) => (
                            <article
                              className="customer-invoice-card"
                              key={invoice._id}
                            >
                              <div className="customer-invoice-main">
                                <div className="customer-invoice-icon">
                                  <FiFileText />
                                </div>

                                <div className="customer-invoice-details">
                                  <div className="customer-invoice-title-row">
                                    <strong>
                                      {invoice.invoiceNumber ||
                                        "Invoice"}
                                    </strong>

                                    <span
                                      className={`customer-payment-status ${getPaymentStatusClass(
                                        invoice.paymentStatus,
                                      )}`}
                                    >
                                      {getPaymentStatusLabel(
                                        invoice.paymentStatus,
                                      )}
                                    </span>
                                  </div>

                                  <div className="customer-invoice-meta">
                                    <span>
                                      <FiClock />
                                      {formatInvoiceDate(
                                        invoice.createdAt,
                                      )}
                                    </span>

                                    <span>
                                      <FiShoppingBag />
                                      {invoice.items?.length ||
                                        0}{" "}
                                      items
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="customer-invoice-amount">
                                <span>Bill Amount</span>

                                <strong>
                                  {formatCurrency(
                                    invoice.grandTotal,
                                  )}
                                </strong>

                                {Number(
                                  invoice.pendingAmount ||
                                    0,
                                ) > 0 && (
                                  <small>
                                    Pending:{" "}
                                    {formatCurrency(
                                      invoice.pendingAmount,
                                    )}
                                  </small>
                                )}
                              </div>

                              <button
                                type="button"
                                className="customer-invoice-download-btn"
                                disabled={
                                  downloadingInvoiceId ===
                                  invoice._id
                                }
                                onClick={() =>
                                  handleDownloadInvoice(
                                    invoice,
                                  )
                                }
                              >
                                <FiDownload />

                                {downloadingInvoiceId ===
                                invoice._id
                                  ? "Downloading..."
                                  : "Download PDF"}
                              </button>
                            </article>
                          ),
                        )}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {isCustomerModalOpen && (
        <div
          className="customer-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseCustomerModal();
            }
          }}
        >
          <div
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
          >
            <div className="customer-modal-header">
              <div>
                <p>Customer Details</p>

                <h2 id="customer-modal-title">
                  {selectedCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>
              </div>

              <button
                type="button"
                className="customer-modal-close-btn"
                onClick={handleCloseCustomerModal}
                disabled={isSubmitting}
                aria-label="Close customer modal"
              >
                <FiX />
              </button>
            </div>

            <form
              className="customer-form"
              onSubmit={handleSubmitCustomer}
              noValidate
            >
              <div className="customer-form-group">
                <label htmlFor="customer-name">
                  Customer Name
                </label>

                <div
                  className={`customer-input-wrapper ${
                    formErrors.name
                      ? "has-error"
                      : ""
                  }`}
                >
                  <FiUser />

                  <input
                    id="customer-name"
                    type="text"
                    name="name"
                    placeholder="Enter customer name"
                    value={formData.name}
                    onChange={handleFormChange}
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>

                {formErrors.name && (
                  <span className="customer-error-message">
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div className="customer-form-group">
                <label htmlFor="customer-phone">
                  Phone Number
                </label>

                <div
                  className={`customer-input-wrapper ${
                    formErrors.phone
                      ? "has-error"
                      : ""
                  }`}
                >
                  <FiPhone />

                  <input
                    id="customer-phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleFormChange}
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </div>

                {formErrors.phone && (
                  <span className="customer-error-message">
                    {formErrors.phone}
                  </span>
                )}
              </div>

              <div className="customer-form-group">
                <label htmlFor="customer-address">
                  Address
                  <span>Optional</span>
                </label>

                <textarea
                  id="customer-address"
                  name="address"
                  placeholder="Enter customer address"
                  value={formData.address}
                  onChange={handleFormChange}
                  maxLength={300}
                  rows={4}
                />

                <div className="customer-address-footer">
                  {formErrors.address ? (
                    <span className="customer-error-message">
                      {formErrors.address}
                    </span>
                  ) : (
                    <span />
                  )}

                  <small>
                    {formData.address.length}/300
                  </small>
                </div>
              </div>

              <div className="customer-form-actions">
                <button
                  type="button"
                  className="customer-cancel-btn"
                  onClick={handleCloseCustomerModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? selectedCustomer
                      ? "Updating..."
                      : "Creating..."
                    : selectedCustomer
                      ? "Update Customer"
                      : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;