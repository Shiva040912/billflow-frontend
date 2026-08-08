import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";

import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
  updateEmployeeStatus,
} from "../services/employeeApi";

import {
  showErrorToast,
  showSuccessToast,
} from "../utils/toast";

import "../styles/employee.css";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  role: "cashier",
  password: "",
};

const employeeRoles = [
  {
    value: "cashier",
    label: "Cashier",
  },
  {
    value: "inventory_manager",
    label: "Inventory Manager",
  },
  {
    value: "sales_manager",
    label: "Sales Manager",
  },
  {
    value: "accountant",
    label: "Accountant",
  },
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);

  const [planMeta, setPlanMeta] = useState({
    planName: "",
    employeeLimit: 0,
    activeEmployeeCount: 0,
    remainingEmployeeSlots: 0,
  });

  const [formData, setFormData] = useState(
    initialFormData,
  );

  const [formErrors, setFormErrors] = useState(
    {},
  );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    processingEmployeeId,
    setProcessingEmployeeId,
  ] = useState("");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);

      const response =
        await getEmployees();

      setEmployees(
        Array.isArray(response?.data)
          ? response.data
          : [],
      );

      setPlanMeta({
        planName:
          response?.meta?.planName || "",

        employeeLimit:
          Number(
            response?.meta?.employeeLimit,
          ) || 0,

        activeEmployeeCount:
          Number(
            response?.meta
              ?.activeEmployeeCount,
          ) || 0,

        remainingEmployeeSlots:
          Number(
            response?.meta
              ?.remainingEmployeeSlots,
          ) || 0,
      });
    } catch (error) {
      console.error(
        "Employees fetch error:",
        error,
      );

      showErrorToast(
        error,
        "Employees load panna mudiyala.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !normalizedSearch ||
        employee.name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        employee.email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        employee.phone
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        employee.role
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          employee.isActive) ||
        (statusFilter === "inactive" &&
          !employee.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    employees,
    searchTerm,
    statusFilter,
  ]);

  const resetForm = () => {
    setFormData(
      initialFormData,
    );

    setFormErrors({});

    setEditingEmployee(
      null,
    );

    setShowPassword(false);
  };

  const openCreateForm = () => {
    if (
      planMeta.remainingEmployeeSlots <= 0
    ) {
      showErrorToast(
        null,
        `Your ${planMeta.planName} plan employee limit reached.`,
      );

      return;
    }

    resetForm();

    setIsFormOpen(true);
  };

  const openEditForm = (
    employee,
  ) => {
    setEditingEmployee(
      employee,
    );

    setFormData({
      name:
        employee.name || "",

      email:
        employee.email || "",

      phone:
        employee.phone || "",

      role:
        employee.role ||
        "cashier",

      password: "",
    });

    setFormErrors({});

    setShowPassword(false);

    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);

    resetForm();
  };

  const handleInputChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (currentData) => ({
        ...currentData,

        [name]: value,
      }),
    );

    if (formErrors[name]) {
      setFormErrors(
        (currentErrors) => ({
          ...currentErrors,

          [name]: "",
        }),
      );
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name =
        "Employee name is required";
    }

    if (!formData.email.trim()) {
      errors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim(),
      )
    ) {
      errors.email =
        "Enter a valid email";
    }

    if (!formData.phone.trim()) {
      errors.phone =
        "Phone number is required";
    } else if (
      !/^[0-9]{10}$/.test(
        formData.phone.trim(),
      )
    ) {
      errors.phone =
        "Enter a valid 10 digit phone number";
    }

    if (!formData.role) {
      errors.role =
        "Employee role is required";
    }

    if (
      !editingEmployee &&
      !formData.password
    ) {
      errors.password =
        "Password is required";
    } else if (
      formData.password &&
      formData.password.length < 6
    ) {
      errors.password =
        "Password must contain at least 6 characters";
    }

    setFormErrors(errors);

    return (
      Object.keys(errors)
        .length === 0
    );
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const employeePayload = {
      name:
        formData.name.trim(),

      email:
        formData.email
          .trim()
          .toLowerCase(),

      phone:
        formData.phone.trim(),

      role:
        formData.role,
    };

    if (formData.password) {
      employeePayload.password =
        formData.password;
    }

    try {
      setIsSubmitting(true);

      if (editingEmployee) {
        const response =
          await updateEmployee(
            editingEmployee._id,
            employeePayload,
          );

        showSuccessToast(
          response?.message ||
            "Employee updated successfully",
        );
      } else {
        const response =
          await createEmployee(
            employeePayload,
          );

        showSuccessToast(
          response?.message ||
            "Employee created successfully",
        );
      }

      setIsFormOpen(false);

      resetForm();

      await fetchEmployees();
    } catch (error) {
      console.error(
        "Employee submit error:",
        error,
      );

      showErrorToast(
        error,
        editingEmployee
          ? "Employee update panna mudiyala."
          : "Employee create panna mudiyala.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange =
    async (employee) => {
      const nextStatus =
        !employee.isActive;

      if (
        nextStatus &&
        planMeta.remainingEmployeeSlots <=
          0
      ) {
        showErrorToast(
          null,
          `Your ${planMeta.planName} plan employee limit reached.`,
        );

        return;
      }

      const confirmationMessage =
        nextStatus
          ? `Activate ${employee.name}?`
          : `Deactivate ${employee.name}?`;

      const isConfirmed =
        window.confirm(
          confirmationMessage,
        );

      if (!isConfirmed) {
        return;
      }

      try {
        setProcessingEmployeeId(
          employee._id,
        );

        const response =
          await updateEmployeeStatus(
            employee._id,
            nextStatus,
          );

        showSuccessToast(
          response?.message ||
            "Employee status updated successfully",
        );

        await fetchEmployees();
      } catch (error) {
        console.error(
          "Employee status update error:",
          error,
        );

        showErrorToast(
          error,
          "Employee status update panna mudiyala.",
        );
      } finally {
        setProcessingEmployeeId(
          "",
        );
      }
    };

  const handleDelete =
    async (employee) => {
      const isConfirmed =
        window.confirm(
          `Delete ${employee.name}? This action cannot be undone.`,
        );

      if (!isConfirmed) {
        return;
      }

      try {
        setProcessingEmployeeId(
          employee._id,
        );

        const response =
          await deleteEmployee(
            employee._id,
          );

        showSuccessToast(
          response?.message ||
            "Employee deleted successfully",
        );

        await fetchEmployees();
      } catch (error) {
        console.error(
          "Employee delete error:",
          error,
        );

        showErrorToast(
          error,
          "Employee delete panna mudiyala.",
        );
      } finally {
        setProcessingEmployeeId(
          "",
        );
      }
    };

  const getRoleLabel = (
    role,
  ) => {
    const matchedRole =
      employeeRoles.find(
        (employeeRole) =>
          employeeRole.value ===
          role,
      );

    if (matchedRole) {
      return matchedRole.label;
    }

    return role
      ?.split("_")
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  };

  const getInitials = (
    name,
  ) => {
    if (!name) {
      return "E";
    }

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word
          .charAt(0)
          .toUpperCase(),
      )
      .join("");
  };

  return (
    <main className="employees-page">
      <section className="employees-page-header">
        <div>
          <span className="employees-page-label">
            Team Management
          </span>

          <h1>
            Employees
          </h1>

          <p>
            Create employees,
            assign roles and manage
            account access.
          </p>
        </div>

        <button
          type="button"
          className="employees-add-button"
          onClick={
            openCreateForm
          }
          disabled={
            isLoading ||
            planMeta.remainingEmployeeSlots <=
              0
          }
        >
          <FiPlus />

          <span>
            Add Employee
          </span>
        </button>
      </section>

      <section className="employees-summary-grid">
        <article className="employee-summary-card">
          <div className="employee-summary-icon">
            <FiUsers />
          </div>

          <div>
            <span>
              Total Employees
            </span>

            <strong>
              {employees.length}
            </strong>

            <p>
              All employee
              accounts
            </p>
          </div>
        </article>

        <article className="employee-summary-card">
          <div className="employee-summary-icon">
            <FiUserCheck />
          </div>

          <div>
            <span>
              Active Employees
            </span>

            <strong>
              {
                planMeta.activeEmployeeCount
              }
            </strong>

            <p>
              Currently active
              accounts
            </p>
          </div>
        </article>

        <article className="employee-summary-card">
          <div className="employee-summary-icon">
            <FiPlus />
          </div>

          <div>
            <span>
              Available Slots
            </span>

            <strong>
              {
                planMeta.remainingEmployeeSlots
              }
            </strong>

            <p>
              Slots remaining in
              your plan
            </p>
          </div>
        </article>

        <article className="employee-summary-card employee-plan-card">
          <div>
            <span>
              Current Plan
            </span>

            <strong>
              {planMeta.planName ||
                "-"}
            </strong>

            <p>
              {
                planMeta.employeeLimit
              }{" "}
              employee limit
            </p>
          </div>

          <div className="employee-plan-progress">
            <div>
              <span>
                Plan usage
              </span>

              <strong>
                {
                  planMeta.activeEmployeeCount
                }
                /
                {
                  planMeta.employeeLimit
                }
              </strong>
            </div>

            <div className="employee-plan-progress-track">
              <span
                style={{
                  width:
                    planMeta.employeeLimit >
                    0
                      ? `${Math.min(
                          (planMeta.activeEmployeeCount /
                            planMeta.employeeLimit) *
                            100,
                          100,
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </article>
      </section>

      <section className="employees-content-card">
        <div className="employees-toolbar">
          <div className="employees-search-box">
            <FiSearch />

            <input
              type="search"
              value={
                searchTerm
              }
              onChange={(
                event,
              ) =>
                setSearchTerm(
                  event.target
                    .value,
                )
              }
              placeholder="Search employees..."
              aria-label="Search employees"
            />
          </div>

          <select
            className="employees-status-filter"
            value={
              statusFilter
            }
            onChange={(
              event,
            ) =>
              setStatusFilter(
                event.target
                  .value,
              )
            }
            aria-label="Filter employee status"
          >
            <option value="all">
              All Employees
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        {isLoading ? (
          <div className="employees-loading-state">
            <div className="employees-loader" />

            <p>
              Loading
              employees...
            </p>
          </div>
        ) : filteredEmployees.length ===
          0 ? (
          <div className="employees-empty-state">
            <div className="employees-empty-icon">
              <FiUsers />
            </div>

            <h2>
              {employees.length ===
              0
                ? "No employees added"
                : "No employees found"}
            </h2>

            <p>
              {employees.length ===
              0
                ? "Create your first employee account to start managing your team."
                : "Try changing the search text or status filter."}
            </p>

            {employees.length ===
              0 &&
              planMeta.remainingEmployeeSlots >
                0 && (
                <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                >
                  <FiPlus />

                  Add First
                  Employee
                </button>
              )}
          </div>
        ) : (
          <div className="employees-table-wrapper">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>
                    Employee
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Last Login
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map(
                  (
                    employee,
                  ) => {
                    const isProcessing =
                      processingEmployeeId ===
                      employee._id;

                    return (
                      <tr
                        key={
                          employee._id
                        }
                      >
                        <td>
                          <div className="employee-profile-cell">
                            <div className="employee-avatar">
                              {getInitials(
                                employee.name,
                              )}
                            </div>

                            <div>
                              <strong>
                                {
                                  employee.name
                                }
                              </strong>

                              <span>
                                {
                                  employee.email
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="employee-contact-cell">
                            <strong>
                              {employee.phone ||
                                "-"}
                            </strong>

                            <span>
                              Joined{" "}
                              {employee.createdAt
                                ? new Date(
                                    employee.createdAt,
                                  ).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "-"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="employee-role-badge">
                            {getRoleLabel(
                              employee.role,
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              employee.isActive
                                ? "employee-status-toggle active"
                                : "employee-status-toggle inactive"
                            }
                            onClick={() =>
                              handleStatusChange(
                                employee,
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            title={
                              employee.isActive
                                ? "Deactivate employee"
                                : "Activate employee"
                            }
                          >
                            <span className="employee-status-switch">
                              <span />
                            </span>

                            <strong>
                              {isProcessing
                                ? "Updating..."
                                : employee.isActive
                                  ? "Active"
                                  : "Inactive"}
                            </strong>
                          </button>
                        </td>

                        <td>
                          <div className="employee-last-login-cell">
                            {employee.lastLoginAt
                              ? new Date(
                                  employee.lastLoginAt,
                                ).toLocaleString(
                                  "en-IN",
                                )
                              : "Never logged in"}
                          </div>
                        </td>

                        <td>
                          <div className="employee-action-buttons">
                            <button
                              type="button"
                              className="employee-action-button edit"
                              onClick={() =>
                                openEditForm(
                                  employee,
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              aria-label={`Edit ${employee.name}`}
                              title="Edit employee"
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className="employee-action-button delete"
                              onClick={() =>
                                handleDelete(
                                  employee,
                                )
                              }
                              disabled={
                                isProcessing
                              }
                              aria-label={`Delete ${employee.name}`}
                              title="Delete employee"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isFormOpen && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <section
            className="employee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
          >
            <header className="employee-modal-header">
              <div>
                <span>
                  {editingEmployee
                    ? "Update Account"
                    : "New Team Member"}
                </span>

                <h2 id="employee-modal-title">
                  {editingEmployee
                    ? "Edit Employee"
                    : "Add Employee"}
                </h2>

                <p>
                  {editingEmployee
                    ? "Update employee details and assigned role."
                    : "Create login credentials and assign a role."}
                </p>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={
                  closeForm
                }
                disabled={
                  isSubmitting
                }
                aria-label="Close employee form"
              >
                <FiX />
              </button>
            </header>

            <form
              className="employee-form"
              onSubmit={
                handleSubmit
              }
              noValidate
            >
              <div className="employee-form-grid">
                <div className="employee-form-group">
                  <label htmlFor="employee-name">
                    Employee Name
                  </label>

                  <input
                    id="employee-name"
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter employee name"
                    autoComplete="name"
                  />

                  {formErrors.name && (
                    <span className="employee-field-error">
                      {
                        formErrors.name
                      }
                    </span>
                  )}
                </div>

                <div className="employee-form-group">
                  <label htmlFor="employee-phone">
                    Phone Number
                  </label>

                  <input
                    id="employee-phone"
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter phone number"
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel"
                  />

                  {formErrors.phone && (
                    <span className="employee-field-error">
                      {
                        formErrors.phone
                      }
                    </span>
                  )}
                </div>

                <div className="employee-form-group employee-form-group-full">
                  <label htmlFor="employee-email">
                    Email Address
                  </label>

                  <input
                    id="employee-email"
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter employee email"
                    autoComplete="email"
                  />

                  {formErrors.email && (
                    <span className="employee-field-error">
                      {
                        formErrors.email
                      }
                    </span>
                  )}
                </div>

                <div className="employee-form-group">
                  <label htmlFor="employee-role">
                    Employee Role
                  </label>

                  <select
                    id="employee-role"
                    name="role"
                    value={
                      formData.role
                    }
                    onChange={
                      handleInputChange
                    }
                  >
                    {employeeRoles.map(
                      (
                        role,
                      ) => (
                        <option
                          key={
                            role.value
                          }
                          value={
                            role.value
                          }
                        >
                          {
                            role.label
                          }
                        </option>
                      ),
                    )}
                  </select>

                  {formErrors.role && (
                    <span className="employee-field-error">
                      {
                        formErrors.role
                      }
                    </span>
                  )}
                </div>

                <div className="employee-form-group">
                  <label htmlFor="employee-password">
                    {editingEmployee
                      ? "New Password"
                      : "Password"}
                  </label>

                  <div className="employee-password-field">
                    <input
                      id="employee-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={
                        formData.password
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder={
                        editingEmployee
                          ? "Leave blank to keep current"
                          : "Enter login password"
                      }
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            currentValue,
                          ) =>
                            !currentValue,
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>
                  </div>

                  {formErrors.password && (
                    <span className="employee-field-error">
                      {
                        formErrors.password
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="employee-role-information">
                <FiAlertCircle />

                <p>
                  Employee access
                  will be controlled
                  using the selected
                  role. The employee
                  can use these
                  credentials to log
                  in.
                </p>
              </div>

              <footer className="employee-form-actions">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-submit-button"
                  disabled={
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? editingEmployee
                      ? "Updating..."
                      : "Creating..."
                    : editingEmployee
                      ? "Update Employee"
                      : "Create Employee"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Employees;