import {
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiEdit2,
  FiPackage,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  createProviderPlan,
  deleteProviderPlan,
  getProviderPlans,
  updateProviderPlan,
  updateProviderPlanPopularStatus,
  updateProviderPlanStatus,
} from "../services/plan";

import "../styles/plan.css";

const INITIAL_FORM = {
  name: "",
  description: "",
  monthlyPrice: "",
  yearlyPrice: "",
  trialDays: "0",
  employeeLimit: "",
  productLimit: "",
  customerLimit: "",
  invoiceLimit: "",
  featuresText: "",
  isActive: true,
  isPopular: false,
  sortOrder: "0",
};

const INITIAL_SUMMARY = {
  total: 0,
  active: 0,
  inactive: 0,
  popular: 0,
  totalMonthlyValue: 0,
  totalYearlyValue: 0,
};

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [summary, setSummary] =
    useState(INITIAL_SUMMARY);

  const [searchTerm, setSearchTerm] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [popularFilter, setPopularFilter] =
    useState("all");

  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [selectedPlan, setSelectedPlan] =
    useState(null);
  const [formData, setFormData] =
    useState(INITIAL_FORM);
  const [isSaving, setIsSaving] =
    useState(false);

  const [
    updatingStatusPlanId,
    setUpdatingStatusPlanId,
  ] = useState("");

  const [
    updatingPopularPlanId,
    setUpdatingPopularPlanId,
  ] = useState("");

  const [
    deletingPlanId,
    setDeletingPlanId,
  ] = useState("");

  const handleUnauthorized = () => {
    localStorage.removeItem(
      "providerAccessToken",
    );
    localStorage.removeItem("providerUser");

    window.location.href =
      "/provider/login";
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

    return (
      responseMessage || fallbackMessage
    );
  };

  const fetchPlans = async ({
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

      if (popularFilter !== "all") {
        params.popular =
          popularFilter === "popular"
            ? "true"
            : "false";
      }

      const response =
        await getProviderPlans(params);

      setPlans(
        Array.isArray(response?.plans)
          ? response.plans
          : [],
      );

      setSummary({
        ...INITIAL_SUMMARY,
        ...(response?.summary || {}),
      });
    } catch (error) {
      console.error(
        "Provider plans fetch error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Plans load panna mudiyala",
        ),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchPlans();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    searchTerm,
    statusFilter,
    popularFilter,
  ]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    statusFilter !== "all" ||
    popularFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPopularFilter("all");
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const formatLimit = (value) => {
    const numberValue = Number(value || 0);

    return numberValue.toLocaleString(
      "en-IN",
    );
  };

  const openAddModal = () => {
    setSelectedPlan(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);

    setFormData({
      name: plan.name || "",
      description:
        plan.description || "",
      monthlyPrice: String(
        plan.monthlyPrice ?? "",
      ),
      yearlyPrice: String(
        plan.yearlyPrice ?? "",
      ),
      trialDays: String(
        plan.trialDays ?? 0,
      ),
      employeeLimit: String(
        plan.employeeLimit ?? "",
      ),
      productLimit: String(
        plan.productLimit ?? "",
      ),
      customerLimit: String(
        plan.customerLimit ?? "",
      ),
      invoiceLimit: String(
        plan.invoiceLimit ?? "",
      ),
      featuresText: Array.isArray(
        plan.features,
      )
        ? plan.features.join("\n")
        : "",
      isActive:
        plan.isActive ?? true,
      isPopular:
        plan.isPopular ?? false,
      sortOrder: String(
        plan.sortOrder ?? 0,
      ),
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setSelectedPlan(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(false);
  };

  const handleFormChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Plan name enter pannu");
      return false;
    }

    if (
      Number(formData.monthlyPrice) < 0
    ) {
      toast.error(
        "Monthly price valid-ah enter pannu",
      );
      return false;
    }

    if (
      Number(formData.yearlyPrice) < 0
    ) {
      toast.error(
        "Yearly price valid-ah enter pannu",
      );
      return false;
    }

    const limitFields = [
      {
        value: formData.employeeLimit,
        label: "Employee limit",
      },
      {
        value: formData.productLimit,
        label: "Product limit",
      },
      {
        value: formData.customerLimit,
        label: "Customer limit",
      },
      {
        value: formData.invoiceLimit,
        label: "Invoice limit",
      },
    ];

    for (const field of limitFields) {
      if (Number(field.value) < 1) {
        toast.error(
          `${field.label} minimum 1-ah irukanum`,
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const features = formData.featuresText
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      description:
        formData.description.trim(),
      monthlyPrice: Number(
        formData.monthlyPrice,
      ),
      yearlyPrice: Number(
        formData.yearlyPrice,
      ),
      trialDays: Number(
        formData.trialDays || 0,
      ),
      employeeLimit: Number(
        formData.employeeLimit,
      ),
      productLimit: Number(
        formData.productLimit,
      ),
      customerLimit: Number(
        formData.customerLimit,
      ),
      invoiceLimit: Number(
        formData.invoiceLimit,
      ),
      features,
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      sortOrder: Number(
        formData.sortOrder || 0,
      ),
    };

    try {
      setIsSaving(true);

      const response = selectedPlan
        ? await updateProviderPlan(
            selectedPlan._id,
            payload,
          )
        : await createProviderPlan(
            payload,
          );

      toast.success(
        response?.message ||
          (selectedPlan
            ? "Plan updated successfully"
            : "Plan created successfully"),
      );

      closeModal();

      await fetchPlans({
        showRefreshLoader: true,
      });
    } catch (error) {
      console.error(
        "Provider plan save error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          selectedPlan
            ? "Plan update panna mudiyala"
            : "Plan create panna mudiyala",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    plan,
  ) => {
    const nextStatus = !plan.isActive;

    const isConfirmed = window.confirm(
      `"${plan.name}" plan-ah ${
        nextStatus
          ? "activate"
          : "deactivate"
      } panna confirm ah?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setUpdatingStatusPlanId(plan._id);

      const response =
        await updateProviderPlanStatus(
          plan._id,
          nextStatus,
        );

      toast.success(
        response?.message ||
          "Plan status updated successfully",
      );

      await fetchPlans({
        showRefreshLoader: true,
      });
    } catch (error) {
      console.error(
        "Plan status update error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Plan status update panna mudiyala",
        ),
      );
    } finally {
      setUpdatingStatusPlanId("");
    }
  };

  const handlePopularChange = async (
    plan,
  ) => {
    const nextPopular =
      !plan.isPopular;

    try {
      setUpdatingPopularPlanId(
        plan._id,
      );

      const response =
        await updateProviderPlanPopularStatus(
          plan._id,
          nextPopular,
        );

      toast.success(
        response?.message ||
          "Popular status updated successfully",
      );

      await fetchPlans({
        showRefreshLoader: true,
      });
    } catch (error) {
      console.error(
        "Popular status update error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Popular status update panna mudiyala",
        ),
      );
    } finally {
      setUpdatingPopularPlanId("");
    }
  };

  const handleDeletePlan = async (
    plan,
  ) => {
    const isConfirmed = window.confirm(
      `"${plan.name}" plan-ah delete panna confirm ah?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingPlanId(plan._id);

      const response =
        await deleteProviderPlan(plan._id);

      toast.success(
        response?.message ||
          "Plan deleted successfully",
      );

      await fetchPlans({
        showRefreshLoader: true,
      });
    } catch (error) {
      console.error(
        "Delete plan error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          "Plan delete panna mudiyala",
        ),
      );
    } finally {
      setDeletingPlanId("");
    }
  };

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Plans",
        value: summary.total,
        description:
          "Available subscription plans",
        icon: <FiPackage />,
        className: "total",
      },
      {
        title: "Active Plans",
        value: summary.active,
        description:
          "Customer selection enabled",
        icon: <FiCheck />,
        className: "active",
      },
      {
        title: "Popular Plans",
        value: summary.popular,
        description:
          "Highlighted plans",
        icon: <FiStar />,
        className: "popular",
      },
      {
        title: "Monthly Value",
        value: formatCurrency(
          summary.totalMonthlyValue,
        ),
        description:
          "Combined monthly plan value",
        icon: <FiUsers />,
        className: "revenue",
      },
    ],
    [summary],
  );

  return (
    <>
      <main className="provider-plans-page">
        <section className="provider-plans-header">
          <div>
            <p className="provider-plans-eyebrow">
              Subscription Management
            </p>

            <h1>Plans</h1>

            <p>
              BillFlow subscription plans,
              pricing, limits and features-ah
              manage pannu.
            </p>
          </div>

          <div className="provider-plans-header-actions">
            <button
              type="button"
              className="provider-plans-refresh-btn"
              disabled={isRefreshing}
              onClick={() =>
                fetchPlans({
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

              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              className="provider-plans-add-btn"
              onClick={openAddModal}
            >
              <FiPlus />
              Add Plan
            </button>
          </div>
        </section>

        <section className="provider-plans-summary-grid">
          {summaryCards.map((card) => (
            <article
              className="provider-plan-summary-card"
              key={card.title}
            >
              <span
                className={`provider-plan-summary-icon ${card.className}`}
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

        <section className="provider-plans-workspace">
          <div className="provider-plans-toolbar">
            <div className="provider-plans-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search plan name or description..."
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
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <select
              value={popularFilter}
              onChange={(event) =>
                setPopularFilter(
                  event.target.value,
                )
              }
            >
              <option value="all">
                All Plans
              </option>

              <option value="popular">
                Popular
              </option>

              <option value="regular">
                Regular
              </option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="provider-plans-clear-btn"
                onClick={clearFilters}
              >
                <FiX />
                Clear
              </button>
            )}
          </div>

          <div className="provider-plans-result-bar">
            <strong>
              {plans.length} Plan
              {plans.length === 1
                ? ""
                : "s"}
            </strong>

            <span>
              {hasActiveFilters
                ? "Matching current filters"
                : "Showing available plans"}
            </span>
          </div>

          <section className="provider-plans-content">
            {isLoading ? (
              <div className="provider-plans-state">
                <span className="provider-plans-loader" />

                <h3>Loading plans...</h3>

                <p>
                  Subscription plans load
                  aaguthu.
                </p>
              </div>
            ) : plans.length === 0 ? (
              <div className="provider-plans-state">
                <FiPackage />

                <h3>No plans available</h3>

                <p>
                  {hasActiveFilters
                    ? "Current search or filter-ku plan match aagala."
                    : "First subscription plan create pannu."}
                </p>

                <button
                  type="button"
                  onClick={
                    hasActiveFilters
                      ? clearFilters
                      : openAddModal
                  }
                >
                  {hasActiveFilters
                    ? "Clear Filters"
                    : "Add First Plan"}
                </button>
              </div>
            ) : (
              <div className="provider-plans-grid">
                {plans.map((plan) => (
                  <article
                    className={`provider-plan-card ${
                      plan.isPopular
                        ? "popular"
                        : ""
                    }`}
                    key={plan._id}
                  >
                    {plan.isPopular && (
                      <div className="provider-plan-popular-label">
                        <FiStar />
                        Popular
                      </div>
                    )}

                    <div className="provider-plan-card-head">
                      <div>
                        <h2>{plan.name}</h2>

                        <p>
                          {plan.description ||
                            "No description added"}
                        </p>
                      </div>

                      <span
                        className={
                          plan.isActive
                            ? "provider-plan-status active"
                            : "provider-plan-status inactive"
                        }
                      >
                        {plan.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="provider-plan-pricing">
                      <div>
                        <span>Monthly</span>

                        <strong>
                          {formatCurrency(
                            plan.monthlyPrice,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Yearly</span>

                        <strong>
                          {formatCurrency(
                            plan.yearlyPrice,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="provider-plan-limits">
                      <div>
                        <span>Employees</span>

                        <strong>
                          {formatLimit(
                            plan.employeeLimit,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Products</span>

                        <strong>
                          {formatLimit(
                            plan.productLimit,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Customers</span>

                        <strong>
                          {formatLimit(
                            plan.customerLimit,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Invoices</span>

                        <strong>
                          {formatLimit(
                            plan.invoiceLimit,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="provider-plan-trial">
                      Trial Days

                      <strong>
                        {plan.trialDays || 0}
                      </strong>
                    </div>

                    <div className="provider-plan-features">
                      <h3>Features</h3>

                      {plan.features?.length >
                      0 ? (
                        <ul>
                          {plan.features.map(
                            (
                              feature,
                              index,
                            ) => (
                              <li
                                key={`${plan._id}-${index}`}
                              >
                                <FiCheck />
                                {feature}
                              </li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p>
                          No features added
                        </p>
                      )}
                    </div>

                    <div className="provider-plan-card-actions">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(plan)
                        }
                      >
                        <FiEdit2 />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="popular"
                        disabled={
                          updatingPopularPlanId ===
                          plan._id
                        }
                        onClick={() =>
                          handlePopularChange(
                            plan,
                          )
                        }
                      >
                        <FiStar />

                        {plan.isPopular
                          ? "Remove Popular"
                          : "Mark Popular"}
                      </button>

                      <button
                        type="button"
                        className={
                          plan.isActive
                            ? "warning"
                            : "success"
                        }
                        disabled={
                          updatingStatusPlanId ===
                          plan._id
                        }
                        onClick={() =>
                          handleStatusChange(
                            plan,
                          )
                        }
                      >
                        <FiCheck />

                        {plan.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        className="delete"
                        disabled={
                          deletingPlanId ===
                          plan._id
                        }
                        onClick={() =>
                          handleDeletePlan(plan)
                        }
                      >
                        <FiTrash2 />

                        {deletingPlanId ===
                        plan._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>

      {isModalOpen && (
        <div
          className="provider-plan-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="provider-plan-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="provider-plan-modal-header">
              <div>
                <p>
                  {selectedPlan
                    ? "Edit Plan"
                    : "Create Plan"}
                </p>

                <h2>
                  {selectedPlan
                    ? selectedPlan.name
                    : "New Subscription Plan"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
              >
                <FiX />
              </button>
            </div>

            <form
              className="provider-plan-form"
              onSubmit={handleSubmit}
            >
              <div className="provider-plan-form-row">
                <div className="provider-plan-form-group">
                  <label htmlFor="plan-name">
                    Plan Name
                  </label>

                  <input
                    id="plan-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={
                      handleFormChange
                    }
                    placeholder="Example: Premium"
                    disabled={isSaving}
                  />
                </div>

                <div className="provider-plan-form-group">
                  <label htmlFor="sort-order">
                    Sort Order
                  </label>

                  <input
                    id="sort-order"
                    name="sortOrder"
                    type="number"
                    min="0"
                    value={
                      formData.sortOrder
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="provider-plan-form-group">
                <label htmlFor="plan-description">
                  Description
                </label>

                <textarea
                  id="plan-description"
                  name="description"
                  rows="3"
                  value={
                    formData.description
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Plan short description"
                  disabled={isSaving}
                />
              </div>

              <div className="provider-plan-form-row">
                <div className="provider-plan-form-group">
                  <label htmlFor="monthly-price">
                    Monthly Price
                  </label>

                  <input
                    id="monthly-price"
                    name="monthlyPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      formData.monthlyPrice
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="provider-plan-form-group">
                  <label htmlFor="yearly-price">
                    Yearly Price
                  </label>

                  <input
                    id="yearly-price"
                    name="yearlyPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      formData.yearlyPrice
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="provider-plan-form-group">
                  <label htmlFor="trial-days">
                    Trial Days
                  </label>

                  <input
                    id="trial-days"
                    name="trialDays"
                    type="number"
                    min="0"
                    max="365"
                    value={
                      formData.trialDays
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="provider-plan-form-grid">
                <div className="provider-plan-form-group">
                  <label>
                    Employee Limit
                  </label>

                  <input
                    name="employeeLimit"
                    type="number"
                    min="1"
                    value={
                      formData.employeeLimit
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="provider-plan-form-group">
                  <label>
                    Product Limit
                  </label>

                  <input
                    name="productLimit"
                    type="number"
                    min="1"
                    value={
                      formData.productLimit
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="provider-plan-form-group">
                  <label>
                    Customer Limit
                  </label>

                  <input
                    name="customerLimit"
                    type="number"
                    min="1"
                    value={
                      formData.customerLimit
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="provider-plan-form-group">
                  <label>
                    Invoice Limit
                  </label>

                  <input
                    name="invoiceLimit"
                    type="number"
                    min="1"
                    value={
                      formData.invoiceLimit
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="provider-plan-form-group">
                <label htmlFor="features">
                  Features
                </label>

                <textarea
                  id="features"
                  name="featuresText"
                  rows="6"
                  value={
                    formData.featuresText
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder={
                    "One feature per line\nUnlimited billing\nStock reports\nPriority support"
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="provider-plan-checkbox-row">
                <label>
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={
                      formData.isActive
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />

                  <span>
                    Active Plan
                  </span>
                </label>

                <label>
                  <input
                    name="isPopular"
                    type="checkbox"
                    checked={
                      formData.isPopular
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={isSaving}
                  />

                  <span>
                    Popular Plan
                  </span>
                </label>
              </div>

              <div className="provider-plan-modal-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : selectedPlan
                      ? "Update Plan"
                      : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Plans;