import {
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  FiAlertCircle,
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  deleteProviderCompany,
  extendProviderCompanySubscription,
  getProviderCompanies,
  getProviderCompanyById,
  updateProviderCompanyStatus,
} from "../services/companies";

import "../styles/companies.css";

const INITIAL_SUMMARY = {
  total: 0,
  active: 0,
  suspended: 0,
  inactive: 0,
  trial: 0,
  expired: 0,
  monthlyRevenue: 0,
};

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [summary, setSummary] =
    useState(INITIAL_SUMMARY);

  const [searchTerm, setSearchTerm] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [
    subscriptionFilter,
    setSubscriptionFilter,
  ] = useState("all");
  const [planFilter, setPlanFilter] =
    useState("all");

  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [
    selectedCompany,
    setSelectedCompany,
  ] = useState(null);
  const [
    isDetailsLoading,
    setIsDetailsLoading,
  ] = useState(false);

  const [
    statusUpdatingCompanyId,
    setStatusUpdatingCompanyId,
  ] = useState("");

  const [
    deletingCompanyId,
    setDeletingCompanyId,
  ] = useState("");

  const [
    extendSubscriptionCompany,
    setExtendSubscriptionCompany,
  ] = useState(null);

  const [
    subscriptionEndDate,
    setSubscriptionEndDate,
  ] = useState("");

  const [
    isExtendingSubscription,
    setIsExtendingSubscription,
  ] = useState(false);

  const handleUnauthorized = () => {
    localStorage.removeItem(
      "providerAccessToken",
    );
    localStorage.removeItem("providerUser");

    window.location.href = "/provider/login";
  };

  const getErrorMessage = (
    error,
    fallbackMessage,
  ) => {
    const responseMessage =
      error.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage[0];
    }

    return responseMessage || fallbackMessage;
  };

  const fetchCompanies = async ({
    showRefreshLoader = false,
  } = {}) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const params = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (subscriptionFilter !== "all") {
        params.subscriptionStatus =
          subscriptionFilter;
      }

      if (planFilter !== "all") {
        params.planName = planFilter;
      }

      const response =
        await getProviderCompanies(params);

      setCompanies(
        Array.isArray(response?.companies)
          ? response.companies
          : [],
      );

      setSummary({
        ...INITIAL_SUMMARY,
        ...(response?.summary || {}),
      });
    } catch (error) {
      console.error(
        "Provider companies fetch error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Companies load panna mudiyala",
        ),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchCompanies();
    }, 350);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    searchTerm,
    statusFilter,
    subscriptionFilter,
    planFilter,
  ]);

  const planOptions = useMemo(() => {
    const uniquePlans = new Set();

    companies.forEach((company) => {
      if (company.planName?.trim()) {
        uniquePlans.add(company.planName.trim());
      }
    });

    return Array.from(uniquePlans).sort(
      (firstPlan, secondPlan) =>
        firstPlan.localeCompare(secondPlan),
    );
  }, [companies]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "all" ||
    subscriptionFilter !== "all" ||
    planFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSubscriptionFilter("all");
    setPlanFilter("all");
  };

  const handleViewCompany = async (
    companyId,
  ) => {
    try {
      setIsDetailsLoading(true);

      const response =
        await getProviderCompanyById(
          companyId,
        );

      setSelectedCompany(response);
    } catch (error) {
      console.error(
        "Provider company details error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Company details load panna mudiyala",
        ),
      );
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    company,
    nextStatus,
  ) => {
    const actionLabel =
      nextStatus === "active"
        ? "activate"
        : nextStatus === "suspended"
          ? "suspend"
          : "deactivate";

    const isConfirmed = window.confirm(
      `"${company.companyName}" company-ah ${actionLabel} panna confirm ah?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setStatusUpdatingCompanyId(
        company._id,
      );

      const response =
        await updateProviderCompanyStatus(
          company._id,
          nextStatus,
        );

      toast.success(
        response?.message ||
          "Company status updated successfully",
      );

      await fetchCompanies({
        showRefreshLoader: true,
      });

      if (
        selectedCompany?._id === company._id
      ) {
        setSelectedCompany(
          response?.company || null,
        );
      }
    } catch (error) {
      console.error(
        "Provider company status error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Company status update panna mudiyala",
        ),
      );
    } finally {
      setStatusUpdatingCompanyId("");
    }
  };

  const openExtendSubscription = (
    company,
  ) => {
    const currentEndDate =
      company.subscriptionEndDate
        ? new Date(
            company.subscriptionEndDate,
          )
            .toISOString()
            .split("T")[0]
        : "";

    setExtendSubscriptionCompany(company);
    setSubscriptionEndDate(currentEndDate);
  };

  const closeExtendSubscription = () => {
    if (isExtendingSubscription) {
      return;
    }

    setExtendSubscriptionCompany(null);
    setSubscriptionEndDate("");
  };

  const handleExtendSubscription = async (
    event,
  ) => {
    event.preventDefault();

    if (!extendSubscriptionCompany?._id) {
      return;
    }

    if (!subscriptionEndDate) {
      toast.error(
        "Subscription end date select pannu",
      );
      return;
    }

    try {
      setIsExtendingSubscription(true);

      const response =
        await extendProviderCompanySubscription(
          extendSubscriptionCompany._id,
          subscriptionEndDate,
        );

      toast.success(
        response?.message ||
          "Subscription extended successfully",
      );

      closeExtendSubscription();

      await fetchCompanies({
        showRefreshLoader: true,
      });

      if (
        selectedCompany?._id ===
        extendSubscriptionCompany._id
      ) {
        setSelectedCompany(
          response?.company || null,
        );
      }
    } catch (error) {
      console.error(
        "Extend subscription error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Subscription extend panna mudiyala",
        ),
      );
    } finally {
      setIsExtendingSubscription(false);
    }
  };

  const handleDeleteCompany = async (
    company,
  ) => {
    const isConfirmed = window.confirm(
      `"${company.companyName}" company-ah delete panna confirm ah?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingCompanyId(company._id);

      const response =
        await deleteProviderCompany(
          company._id,
        );

      toast.success(
        response?.message ||
          "Company deleted successfully",
      );

      if (
        selectedCompany?._id === company._id
      ) {
        setSelectedCompany(null);
      }

      await fetchCompanies({
        showRefreshLoader: true,
      });
    } catch (error) {
      console.error(
        "Delete provider company error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Company delete panna mudiyala",
        ),
      );
    } finally {
      setDeletingCompanyId("");
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(date);
  };

  const getCompanyInitial = (company) =>
    company.companyName
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "C";

  const getCompanyStatusClass = (
    status,
  ) => {
    if (status === "active") {
      return "active";
    }

    if (status === "suspended") {
      return "suspended";
    }

    return "inactive";
  };

  const getSubscriptionStatusClass = (
    status,
  ) => {
    if (status === "active") {
      return "active";
    }

    if (status === "trial") {
      return "trial";
    }

    if (status === "expired") {
      return "expired";
    }

    return "cancelled";
  };

  const summaryCards = [
    {
      title: "Total Companies",
      value: summary.total,
      description: "Registered companies",
      icon: <FiHome />,
      className: "total",
    },
    {
      title: "Active",
      value: summary.active,
      description: "Currently active",
      icon: <FiShield />,
      className: "active",
    },
    {
      title: "Suspended",
      value: summary.suspended,
      description: "Access restricted",
      icon: <FiAlertCircle />,
      className: "suspended",
    },
    {
      title: "Expired",
      value: summary.expired,
      description: "Subscription expired",
      icon: <FiCalendar />,
      className: "expired",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(
        summary.monthlyRevenue,
      ),
      description: "Current plan value",
      icon: <FiDollarSign />,
      className: "revenue",
    },
  ];

  return (
    <>
      <main className="provider-companies-page">
        <section className="provider-companies-header">
          <div>
            <p className="provider-companies-eyebrow">
              Company Management
            </p>

            <h1>Companies</h1>

            <p>
              Registered BillFlow companies,
              plans and subscriptions-ah manage
              pannu.
            </p>
          </div>

          <button
            type="button"
            className="provider-companies-refresh-btn"
            disabled={isRefreshing}
            onClick={() =>
              fetchCompanies({
                showRefreshLoader: true,
              })
            }
          >
            <FiRefreshCw
              className={
                isRefreshing ? "spinning" : ""
              }
            />

            {isRefreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </section>

        <section className="provider-companies-summary-grid">
          {summaryCards.map((card) => (
            <article
              className="provider-company-summary-card"
              key={card.title}
            >
              <span
                className={`provider-company-summary-icon ${card.className}`}
              >
                {card.icon}
              </span>

              <div>
                <p>{card.title}</p>

                <strong>
                  {isLoading ? "..." : card.value}
                </strong>

                <small>
                  {card.description}
                </small>
              </div>
            </article>
          ))}
        </section>

        <section className="provider-companies-workspace">
          <div className="provider-companies-toolbar">
            <div className="provider-companies-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search company, owner, email or phone..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value,
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
                  event.target.value,
                )
              }
              aria-label="Filter company status"
            >
              <option value="all">
                All Company Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="suspended">
                Suspended
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <select
              value={subscriptionFilter}
              onChange={(event) =>
                setSubscriptionFilter(
                  event.target.value,
                )
              }
              aria-label="Filter subscription status"
            >
              <option value="all">
                All Subscriptions
              </option>

              <option value="trial">
                Trial
              </option>

              <option value="active">
                Active
              </option>

              <option value="expired">
                Expired
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

            <select
              value={planFilter}
              onChange={(event) =>
                setPlanFilter(
                  event.target.value,
                )
              }
              aria-label="Filter company plan"
            >
              <option value="all">
                All Plans
              </option>

              {planOptions.map((planName) => (
                <option
                  value={planName}
                  key={planName}
                >
                  {planName}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="provider-companies-clear-btn"
                onClick={clearFilters}
              >
                <FiX />
                Clear
              </button>
            )}
          </div>

          <div className="provider-companies-result-bar">
            <div>
              <strong>
                {companies.length} Compan
                {companies.length === 1
                  ? "y"
                  : "ies"}
              </strong>

              <span>
                {hasActiveFilters
                  ? "Matching current filters"
                  : "Showing registered companies"}
              </span>
            </div>
          </div>

          <section className="provider-companies-content">
            {isLoading ? (
              <div className="provider-companies-state">
                <span className="provider-companies-loader" />

                <h3>Loading companies...</h3>

                <p>
                  Company details load aaguthu.
                </p>
              </div>
            ) : companies.length === 0 ? (
              <div className="provider-companies-state">
                <FiHome />

                <h3>
                  No companies available
                </h3>

                <p>
                  {hasActiveFilters
                    ? "Current search or filter-ku company match aagala."
                    : "Receiver side-la registered companies inga varum."}
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
                <div className="provider-companies-desktop-table">
                  <div className="provider-companies-table-wrapper">
                    <table className="provider-companies-table">
                      <thead>
                        <tr>
                          <th>Company</th>
                          <th>Plan</th>
                          <th>Subscription</th>
                          <th>Company Status</th>
                          <th>Expiry</th>
                          <th>Plan Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {companies.map(
                          (company) => (
                            <tr
                              key={company._id}
                            >
                              <td>
                                <div className="provider-company-info">
                                  <span className="provider-company-avatar">
                                    {getCompanyInitial(
                                      company,
                                    )}
                                  </span>

                                  <div>
                                    <strong>
                                      {
                                        company.companyName
                                      }
                                    </strong>

                                    <span>
                                      {company.ownerName}
                                    </span>

                                    <small>
                                      {company.email}
                                    </small>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="provider-company-plan">
                                  <strong>
                                    {company.planName ||
                                      "No Plan"}
                                  </strong>

                                  <span>
                                    {formatCurrency(
                                      company.planAmount,
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <span
                                  className={`provider-subscription-badge ${getSubscriptionStatusClass(
                                    company.subscriptionStatus,
                                  )}`}
                                >
                                  {company.subscriptionStatus ||
                                    "Unknown"}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`provider-company-status-badge ${getCompanyStatusClass(
                                    company.companyStatus,
                                  )}`}
                                >
                                  {company.companyStatus ||
                                    "Inactive"}
                                </span>
                              </td>

                              <td>
                                {formatDate(
                                  company.subscriptionEndDate,
                                )}
                              </td>

                              <td>
                                <strong className="provider-company-amount">
                                  {formatCurrency(
                                    company.planAmount,
                                  )}
                                </strong>
                              </td>

                              <td>
                                <div className="provider-company-actions">
                                  <button
                                    type="button"
                                    title="View company"
                                    onClick={() =>
                                      handleViewCompany(
                                        company._id,
                                      )
                                    }
                                  >
                                    <FiEye />
                                  </button>

                                  <button
                                    type="button"
                                    title="Extend subscription"
                                    onClick={() =>
                                      openExtendSubscription(
                                        company,
                                      )
                                    }
                                  >
                                    <FiCalendar />
                                  </button>

                                  {company.companyStatus ===
                                  "active" ? (
                                    <button
                                      type="button"
                                      className="warning"
                                      title="Suspend company"
                                      disabled={
                                        statusUpdatingCompanyId ===
                                        company._id
                                      }
                                      onClick={() =>
                                        handleUpdateStatus(
                                          company,
                                          "suspended",
                                        )
                                      }
                                    >
                                      <FiShield />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="success"
                                      title="Activate company"
                                      disabled={
                                        statusUpdatingCompanyId ===
                                        company._id
                                      }
                                      onClick={() =>
                                        handleUpdateStatus(
                                          company,
                                          "active",
                                        )
                                      }
                                    >
                                      <FiShield />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    className="delete"
                                    title="Delete company"
                                    disabled={
                                      deletingCompanyId ===
                                      company._id
                                    }
                                    onClick={() =>
                                      handleDeleteCompany(
                                        company,
                                      )
                                    }
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
                </div>

                <div className="provider-companies-mobile-list">
                  {companies.map((company) => (
                    <article
                      className="provider-company-mobile-card"
                      key={company._id}
                    >
                      <div className="provider-company-mobile-head">
                        <div className="provider-company-info">
                          <span className="provider-company-avatar">
                            {getCompanyInitial(
                              company,
                            )}
                          </span>

                          <div>
                            <strong>
                              {company.companyName}
                            </strong>

                            <span>
                              {company.ownerName}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`provider-company-status-badge ${getCompanyStatusClass(
                            company.companyStatus,
                          )}`}
                        >
                          {company.companyStatus ||
                            "Inactive"}
                        </span>
                      </div>

                      <div className="provider-company-mobile-grid">
                        <div>
                          <span>Plan</span>

                          <strong>
                            {company.planName ||
                              "No Plan"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Subscription
                          </span>

                          <strong>
                            {company.subscriptionStatus ||
                              "Unknown"}
                          </strong>
                        </div>

                        <div>
                          <span>Expiry</span>

                          <strong>
                            {formatDate(
                              company.subscriptionEndDate,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Amount</span>

                          <strong>
                            {formatCurrency(
                              company.planAmount,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="provider-company-mobile-contact">
                        <span>
                          <FiMail />
                          {company.email}
                        </span>

                        <span>
                          <FiPhone />
                          {company.phone}
                        </span>
                      </div>

                      <div className="provider-company-mobile-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewCompany(
                              company._id,
                            )
                          }
                        >
                          <FiEye />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openExtendSubscription(
                              company,
                            )
                          }
                        >
                          <FiCalendar />
                          Extend
                        </button>

                        <button
                          type="button"
                          className={
                            company.companyStatus ===
                            "active"
                              ? "warning"
                              : "success"
                          }
                          disabled={
                            statusUpdatingCompanyId ===
                            company._id
                          }
                          onClick={() =>
                            handleUpdateStatus(
                              company,
                              company.companyStatus ===
                                "active"
                                ? "suspended"
                                : "active",
                            )
                          }
                        >
                          <FiShield />

                          {company.companyStatus ===
                          "active"
                            ? "Suspend"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="delete"
                          disabled={
                            deletingCompanyId ===
                            company._id
                          }
                          onClick={() =>
                            handleDeleteCompany(
                              company,
                            )
                          }
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </section>
      </main>

      {(selectedCompany ||
        isDetailsLoading) && (
        <div
          className="provider-company-drawer-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedCompany(null);
            }
          }}
        >
          <aside className="provider-company-drawer">
            <div className="provider-company-drawer-header">
              <div>
                <p>Company Details</p>

                <h2>
                  {selectedCompany?.companyName ||
                    "Loading..."}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCompany(null)
                }
                aria-label="Close company details"
              >
                <FiX />
              </button>
            </div>

            {isDetailsLoading ? (
              <div className="provider-company-drawer-loading">
                <span className="provider-companies-loader" />
                Loading details...
              </div>
            ) : (
              selectedCompany && (
                <div className="provider-company-drawer-body">
                  <div className="provider-company-drawer-profile">
                    <span>
                      {getCompanyInitial(
                        selectedCompany,
                      )}
                    </span>

                    <div>
                      <h3>
                        {
                          selectedCompany.companyName
                        }
                      </h3>

                      <p>
                        {selectedCompany.businessType ||
                          "Business type not added"}
                      </p>
                    </div>
                  </div>

                  <div className="provider-company-details-list">
                    <div>
                      <FiUser />

                      <span>
                        <small>Owner</small>
                        <strong>
                          {
                            selectedCompany.ownerName
                          }
                        </strong>
                      </span>
                    </div>

                    <div>
                      <FiMail />

                      <span>
                        <small>Email</small>
                        <strong>
                          {selectedCompany.email}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <FiPhone />

                      <span>
                        <small>Phone</small>
                        <strong>
                          {selectedCompany.phone}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <FiMapPin />

                      <span>
                        <small>Address</small>
                        <strong>
                          {selectedCompany.address ||
                            "Not available"}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <FiHome />

                      <span>
                        <small>GST Number</small>
                        <strong>
                          {selectedCompany.gstNumber ||
                            "Not available"}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <FiUsers />

                      <span>
                        <small>Plan</small>
                        <strong>
                          {selectedCompany.planName ||
                            "No Plan"}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <FiDollarSign />

                      <span>
                        <small>Plan Amount</small>
                        <strong>
                          {formatCurrency(
                            selectedCompany.planAmount,
                          )}
                        </strong>
                      </span>
                    </div>

                    <div>
                      <FiCalendar />

                      <span>
                        <small>
                          Subscription Expiry
                        </small>
                        <strong>
                          {formatDate(
                            selectedCompany.subscriptionEndDate,
                          )}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="provider-company-drawer-actions">
                    <button
                      type="button"
                      onClick={() =>
                        openExtendSubscription(
                          selectedCompany,
                        )
                      }
                    >
                      <FiCalendar />
                      Extend Subscription
                    </button>

                    <button
                      type="button"
                      className={
                        selectedCompany.companyStatus ===
                        "active"
                          ? "warning"
                          : "success"
                      }
                      onClick={() =>
                        handleUpdateStatus(
                          selectedCompany,
                          selectedCompany.companyStatus ===
                            "active"
                            ? "suspended"
                            : "active",
                        )
                      }
                    >
                      <FiShield />

                      {selectedCompany.companyStatus ===
                      "active"
                        ? "Suspend Company"
                        : "Activate Company"}
                    </button>
                  </div>
                </div>
              )
            )}
          </aside>
        </div>
      )}

      {extendSubscriptionCompany && (
        <div
          className="provider-company-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeExtendSubscription();
            }
          }}
        >
          <div
            className="provider-company-subscription-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="provider-company-modal-header">
              <div>
                <p>Subscription Management</p>

                <h2>Extend Subscription</h2>

                <span>
                  {
                    extendSubscriptionCompany.companyName
                  }
                </span>
              </div>

              <button
                type="button"
                onClick={
                  closeExtendSubscription
                }
                disabled={
                  isExtendingSubscription
                }
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={
                handleExtendSubscription
              }
            >
              <label
                htmlFor="subscription-end-date"
              >
                New Subscription End Date
              </label>

              <input
                id="subscription-end-date"
                type="date"
                value={subscriptionEndDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) =>
                  setSubscriptionEndDate(
                    event.target.value,
                  )
                }
                disabled={
                  isExtendingSubscription
                }
              />

              <div className="provider-company-modal-actions">
                <button
                  type="button"
                  onClick={
                    closeExtendSubscription
                  }
                  disabled={
                    isExtendingSubscription
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isExtendingSubscription
                  }
                >
                  {isExtendingSubscription
                    ? "Extending..."
                    : "Extend Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Companies;