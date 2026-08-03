import { useEffect, useMemo, useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import {
  createProviderEmployee,
  getProviderEmployees,
} from "../services/employees";

import "../styles/employees.css";

const initialFormData = {
  fullName: "",
  email: "",
  phone: "",
  department: "",
  role: "",
  password: "",
};

const departmentOptions = [
  {
    value: "management",
    label: "Management",
  },
  {
    value: "support",
    label: "Support",
  },
  {
    value: "sales",
    label: "Sales",
  },
  {
    value: "finance",
    label: "Finance",
  },
  {
    value: "technical",
    label: "Technical",
  },
];

const roleOptions = [
  {
    value: "support_executive",
    label: "Support Executive",
  },
  {
    value: "sales_executive",
    label: "Sales Executive",
  },
  {
    value: "finance_executive",
    label: "Finance Executive",
  },
  {
    value: "technical_support",
    label: "Technical Support",
  },
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] =
    useState(false);

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingEmployee, setIsCreatingEmployee] =
    useState(false);

  const fetchEmployees = async (showSuccessToast = false) => {
    try {
      const response = await getProviderEmployees();

      setEmployees(response.employees || []);

      if (showSuccessToast) {
        toast.success("Employees refreshed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to fetch provider employees",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!isEmployeeModalOpen) {
      return undefined;
    }

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && !isCreatingEmployee) {
        closeEmployeeModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isEmployeeModalOpen, isCreatingEmployee]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearchTerm = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearchTerm) {
      return employees;
    }

    return employees.filter((employee) => {
      const searchableValues = [
        employee.employeeId,
        employee.fullName,
        employee.email,
        employee.phone,
        employee.department,
        employee.role,
      ];

      return searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearchTerm),
      );
    });
  }, [employees, searchTerm]);

  const activeEmployeesCount = useMemo(() => {
    return employees.filter((employee) => employee.isActive).length;
  }, [employees]);

  const inactiveEmployeesCount =
    employees.length - activeEmployeesCount;

  const openEmployeeModal = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setShowPassword(false);
    setIsEmployeeModalOpen(true);
  };

  const closeEmployeeModal = () => {
    if (isCreatingEmployee) {
      return;
    }

    setIsEmployeeModalOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setShowPassword(false);
  };

  const handleModalOverlayClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !isCreatingEmployee
    ) {
      closeEmployeeModal();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEmployees(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const validateEmployeeForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Employee full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email ID is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim(),
      )
    ) {
      errors.email = "Enter a valid email ID";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (
      !/^(\+91)?[6-9]\d{9}$/.test(
        formData.phone.trim().replace(/\s/g, ""),
      )
    ) {
      errors.phone =
        "Enter a valid Indian phone number";
    }

    if (!formData.department) {
      errors.department = "Select employee department";
    }

    if (!formData.role) {
      errors.role = "Select employee role";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password =
        "Password must contain at least 8 characters";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleCreateEmployee = async (event) => {
    event.preventDefault();

    if (!validateEmployeeForm()) {
      return;
    }

    try {
      setIsCreatingEmployee(true);

      const phoneNumber = formData.phone
        .trim()
        .replace(/\s/g, "");

      const formattedPhone = phoneNumber.startsWith("+91")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const response = await createProviderEmployee({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formattedPhone,
        department: formData.department,
        role: formData.role,
        password: formData.password,
      });

      if (response.employee) {
        setEmployees((currentEmployees) => [
          response.employee,
          ...currentEmployees,
        ]);
      } else {
        await fetchEmployees();
      }

      toast.success(
        response.message || "Employee created successfully",
      );

      setIsEmployeeModalOpen(false);
      setFormData(initialFormData);
      setFormErrors({});
      setShowPassword(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message;

      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage || "Unable to create employee",
      );
    } finally {
      setIsCreatingEmployee(false);
    }
  };

  const formatDisplayText = (value) => {
    if (!value) {
      return "Not available";
    }

    return String(value)
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ");
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

  return (
    <section className="provider-employees-page">
      <header className="provider-employees-header">
        <div className="provider-employees-heading">
          <span>Team Management</span>

          <h1>Employees</h1>

          <p>
            Provider employees, departments and account access
            manage pannunga.
          </p>
        </div>

        <div className="provider-employees-header-actions">
          <button
            type="button"
            className="provider-employees-refresh-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <FiRefreshCw
              className={
                isRefreshing
                  ? "provider-employees-refresh-spinning"
                  : ""
              }
            />

            <span>
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            className="provider-add-employee-btn"
            onClick={openEmployeeModal}
          >
            <FiPlus />
            <span>Add Employee</span>
          </button>
        </div>
      </header>

      <div className="provider-employee-summary-grid">
        <article className="provider-employee-summary-card">
          <div className="provider-employee-summary-icon">
            <FiUsers />
          </div>

          <div>
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
          </div>
        </article>

        <article className="provider-employee-summary-card">
          <div className="provider-employee-summary-icon active">
            <FiUserPlus />
          </div>

          <div>
            <span>Active Employees</span>
            <strong>{activeEmployeesCount}</strong>
          </div>
        </article>

        <article className="provider-employee-summary-card">
          <div className="provider-employee-summary-icon inactive">
            <FiUsers />
          </div>

          <div>
            <span>Inactive Employees</span>
            <strong>{inactiveEmployeesCount}</strong>
          </div>
        </article>
      </div>

      <section className="provider-employees-card">
        <div className="provider-employees-toolbar">
          <div>
            <h2>Employee List</h2>
            <p>
              {filteredEmployees.length} employee
              {filteredEmployees.length === 1 ? "" : "s"} displayed
            </p>
          </div>

          <div className="provider-employees-search">
            <FiSearch />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search employee..."
              aria-label="Search provider employees"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear employee search"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="provider-employees-loading">
            <div className="provider-employees-loader" />
            <p>Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="provider-employees-empty">
            <div>
              <FiUsers />
            </div>

            <h3>
              {searchTerm
                ? "No matching employees"
                : "No employees found"}
            </h3>

            <p>
              {searchTerm
                ? "Search term-ah change panni try pannunga."
                : "Add Employee button use panni first employee create pannunga."}
            </p>
          </div>
        ) : (
          <div className="provider-employees-table-wrapper">
            <table className="provider-employees-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id || employee.id}>
                    <td>
                      <div className="provider-employee-profile-cell">
                        <div className="provider-employee-avatar">
                          {employee.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || "E"}
                        </div>

                        <div>
                          <strong>
                            {employee.fullName ||
                              "Not available"}
                          </strong>

                          <span>
                            {employee.email ||
                              "Email not available"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="provider-employee-id">
                        {employee.employeeId ||
                          "Not available"}
                      </span>
                    </td>

                    <td>
                      {formatDisplayText(
                        employee.department,
                      )}
                    </td>

                    <td>
                      <span className="provider-employee-role">
                        {formatDisplayText(employee.role)}
                      </span>
                    </td>

                    <td>
                      {employee.phone || "Not available"}
                    </td>

                    <td>
                      <span
                        className={`provider-employee-status ${
                          employee.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span />

                        {employee.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>{formatDate(employee.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isEmployeeModalOpen && (
        <div
          className="provider-employee-modal-overlay"
          onMouseDown={handleModalOverlayClick}
          role="presentation"
        >
          <section
            className="provider-employee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-add-employee-title"
          >
            <header className="provider-employee-modal-header">
              <div>
                <div className="provider-employee-modal-icon">
                  <FiUserPlus />
                </div>

                <div>
                  <span>Create Account</span>

                  <h2 id="provider-add-employee-title">
                    Add New Employee
                  </h2>

                  <p>
                    Employee details and login access create
                    pannunga.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="provider-employee-modal-close"
                onClick={closeEmployeeModal}
                disabled={isCreatingEmployee}
                aria-label="Close add employee popup"
              >
                <FiX />
              </button>
            </header>

            <form
              className="provider-employee-form"
              onSubmit={handleCreateEmployee}
              noValidate
            >
              <div className="provider-employee-form-grid">
                <div className="provider-employee-form-group">
                  <label htmlFor="providerEmployeeFullName">
                    Full Name
                  </label>

                  <input
                    id="providerEmployeeFullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="Enter employee full name"
                    className={
                      formErrors.fullName ? "error" : ""
                    }
                    autoComplete="name"
                  />

                  {formErrors.fullName && (
                    <small>{formErrors.fullName}</small>
                  )}
                </div>

                <div className="provider-employee-form-group">
                  <label htmlFor="providerEmployeeEmail">
                    Email ID
                  </label>

                  <input
                    id="providerEmployeeEmail"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="employee@billflow.com"
                    className={
                      formErrors.email ? "error" : ""
                    }
                    autoComplete="email"
                  />

                  {formErrors.email && (
                    <small>{formErrors.email}</small>
                  )}
                </div>

                <div className="provider-employee-form-group">
                  <label htmlFor="providerEmployeePhone">
                    Phone Number
                  </label>

                  <input
                    id="providerEmployeePhone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="9876543210"
                    className={
                      formErrors.phone ? "error" : ""
                    }
                    autoComplete="tel"
                  />

                  {formErrors.phone && (
                    <small>{formErrors.phone}</small>
                  )}
                </div>

                <div className="provider-employee-form-group">
                  <label htmlFor="providerEmployeeDepartment">
                    Department
                  </label>

                  <select
                    id="providerEmployeeDepartment"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className={
                      formErrors.department ? "error" : ""
                    }
                  >
                    <option value="">
                      Select department
                    </option>

                    {departmentOptions.map((department) => (
                      <option
                        key={department.value}
                        value={department.value}
                      >
                        {department.label}
                      </option>
                    ))}
                  </select>

                  {formErrors.department && (
                    <small>{formErrors.department}</small>
                  )}
                </div>

                <div className="provider-employee-form-group">
                  <label htmlFor="providerEmployeeRole">
                    Role
                  </label>

                  <select
                    id="providerEmployeeRole"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className={
                      formErrors.role ? "error" : ""
                    }
                  >
                    <option value="">Select role</option>

                    {roleOptions.map((role) => (
                      <option
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </option>
                    ))}
                  </select>

                  {formErrors.role && (
                    <small>{formErrors.role}</small>
                  )}
                </div>

                <div className="provider-employee-form-group">
                  <label htmlFor="providerEmployeePassword">
                    Temporary Password
                  </label>

                  <div
                    className={`provider-employee-password-field ${
                      formErrors.password ? "error" : ""
                    }`}
                  >
                    <input
                      id="providerEmployeePassword"
                      name="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (currentValue) => !currentValue,
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
                    <small>{formErrors.password}</small>
                  )}
                </div>
              </div>

              <div className="provider-employee-form-note">
                Employee ID backend-la automatic-ah generate
                aagum. Employee indha email and temporary
                password use panni login pannalam.
              </div>

              <footer className="provider-employee-modal-footer">
                <button
                  type="button"
                  className="provider-employee-cancel-btn"
                  onClick={closeEmployeeModal}
                  disabled={isCreatingEmployee}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="provider-employee-create-btn"
                  disabled={isCreatingEmployee}
                >
                  <FiUserPlus />

                  <span>
                    {isCreatingEmployee
                      ? "Creating..."
                      : "Create Employee"}
                  </span>
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};

export default Employees;