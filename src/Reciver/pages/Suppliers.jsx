import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTruck,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "../services/suppliers";

import "../styles/suppliers.css";

const initialFormData = {
  supplierName: "",
  companyName: "",
  phone: "",
  email: "",
  gstNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  openingBalance: "",
  isActive: true,
  notes: "",
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] =
    useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [deletingSupplierId, setDeletingSupplierId] =
    useState(null);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);

      const response = await getSuppliers();

      setSuppliers(
        Array.isArray(response) ? response : [],
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Suppliers load panna mudiyala";

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const searchValue = searchTerm
      .trim()
      .toLowerCase();

    if (!searchValue) {
      return suppliers;
    }

    return suppliers.filter((supplier) => {
      return [
        supplier.supplierName,
        supplier.companyName,
        supplier.phone,
        supplier.email,
        supplier.gstNumber,
        supplier.city,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(searchValue),
      );
    });
  }, [suppliers, searchTerm]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingSupplierId(null);
    setIsFormOpen(false);
  };

  const handleOpenCreateForm = () => {
    setFormData(initialFormData);
    setEditingSupplierId(null);
    setIsFormOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setFormData({
      supplierName: supplier.supplierName || "",
      companyName: supplier.companyName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      gstNumber: supplier.gstNumber || "",
      address: supplier.address || "",
      city: supplier.city || "",
      state: supplier.state || "",
      pincode: supplier.pincode || "",
      openingBalance:
        supplier.openingBalance ?? "",
      isActive: supplier.isActive ?? true,
      notes: supplier.notes || "",
    });

    setEditingSupplierId(supplier._id);
    setIsFormOpen(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.supplierName.trim()) {
      toast.error("Supplier name required");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number required");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      toast.error(
        "Valid 10 digit phone number enter pannu",
      );
      return false;
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim(),
      )
    ) {
      toast.error("Valid email enter pannu");
      return false;
    }

    if (
      formData.pincode.trim() &&
      !/^[0-9]{6}$/.test(formData.pincode.trim())
    ) {
      toast.error(
        "Valid 6 digit pincode enter pannu",
      );
      return false;
    }

    if (
      Number(formData.openingBalance || 0) < 0
    ) {
      toast.error(
        "Opening balance negative-ah irukka koodathu",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const supplierData = {
      supplierName: formData.supplierName.trim(),
      companyName: formData.companyName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      gstNumber: formData.gstNumber
        .trim()
        .toUpperCase(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      openingBalance: Number(
        formData.openingBalance || 0,
      ),
      isActive: formData.isActive,
      notes: formData.notes.trim(),
    };

    try {
      setIsSubmitting(true);

      if (editingSupplierId) {
        await updateSupplier(
          editingSupplierId,
          supplierData,
        );

        toast.success(
          "Supplier updated successfully",
        );
      } else {
        await createSupplier(supplierData);

        toast.success(
          "Supplier created successfully",
        );
      }

      resetForm();
      await fetchSuppliers();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Supplier save panna mudiyala";

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (
    supplierId,
  ) => {
    const isConfirmed = window.confirm(
      "Intha supplier-ah delete panna confirm-ah?",
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingSupplierId(supplierId);

      await deleteSupplier(supplierId);

      setSuppliers((currentSuppliers) =>
        currentSuppliers.filter(
          (supplier) =>
            supplier._id !== supplierId,
        ),
      );

      toast.success(
        "Supplier deleted successfully",
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Supplier delete panna mudiyala";

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message,
      );
    } finally {
      setDeletingSupplierId(null);
    }
  };

  return (
    <section className="suppliers-page">
      <div className="suppliers-header">
        <div>
          <p className="suppliers-header-label">
            Supplier Management
          </p>

          <h1>Suppliers</h1>

          <p>
            Supplier details, contact information
            and opening balance manage pannunga.
          </p>
        </div>

        <button
          type="button"
          className="supplier-primary-btn"
          onClick={handleOpenCreateForm}
        >
          <FiPlus />
          Add Supplier
        </button>
      </div>

      <div className="suppliers-summary">
        <div className="supplier-summary-card">
          <span className="supplier-summary-icon">
            <FiTruck />
          </span>

          <div>
            <p>Total Suppliers</p>
            <h2>{suppliers.length}</h2>
          </div>
        </div>

        <div className="supplier-summary-card">
          <div>
            <p>Active Suppliers</p>

            <h2>
              {
                suppliers.filter(
                  (supplier) =>
                    supplier.isActive,
                ).length
              }
            </h2>
          </div>
        </div>

        <div className="supplier-summary-card">
          <div>
            <p>Opening Balance</p>

            <h2>
              ₹
              {suppliers
                .reduce(
                  (total, supplier) =>
                    total +
                    Number(
                      supplier.openingBalance ||
                        0,
                    ),
                  0,
                )
                .toLocaleString("en-IN")}
            </h2>
          </div>
        </div>
      </div>

      <div className="suppliers-content-card">
        <div className="suppliers-toolbar">
          <div className="supplier-search-box">
            <FiSearch />

            <input
              type="text"
              placeholder="Search supplier, phone, email..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
            />
          </div>

          <p>
            {filteredSuppliers.length} supplier
            {filteredSuppliers.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="suppliers-table-wrapper">
          <table className="suppliers-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact</th>
                <th>Location</th>
                <th>GST Number</th>
                <th>Opening Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="supplier-table-message"
                  >
                    Suppliers loading...
                  </td>
                </tr>
              ) : filteredSuppliers.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="supplier-table-message"
                  >
                   Not found
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(
                  (supplier) => (
                    <tr key={supplier._id}>
                      <td>
                        <div className="supplier-name-cell">
                          <span className="supplier-avatar">
                            {supplier.supplierName
                              ?.charAt(0)
                              .toUpperCase()}
                          </span>

                          <div>
                            <strong>
                              {
                                supplier.supplierName
                              }
                            </strong>

                            <span>
                              {supplier.companyName ||
                                "No company name"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="supplier-contact-cell">
                          <span>
                            {supplier.phone}
                          </span>

                          <small>
                            {supplier.email ||
                              "No email"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="supplier-location-cell">
                          <span>
                            {supplier.city ||
                              "Not provided"}
                          </span>

                          <small>
                            {supplier.state ||
                              supplier.pincode ||
                              ""}
                          </small>
                        </div>
                      </td>

                      <td>
                        {supplier.gstNumber || "—"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          supplier.openingBalance ||
                            0,
                        ).toLocaleString(
                          "en-IN",
                        )}
                      </td>

                      <td>
                        <span
                          className={`supplier-status ${
                            supplier.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {supplier.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="supplier-actions">
                          <button
                            type="button"
                            className="supplier-action-btn edit"
                            title="Edit supplier"
                            onClick={() =>
                              handleEditSupplier(
                                supplier,
                              )
                            }
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="supplier-action-btn delete"
                            title="Delete supplier"
                            disabled={
                              deletingSupplierId ===
                              supplier._id
                            }
                            onClick={() =>
                              handleDeleteSupplier(
                                supplier._id,
                              )
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div
          className="supplier-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              resetForm();
            }
          }}
        >
          <div className="supplier-modal">
            <div className="supplier-modal-header">
              <div>
                <p>
                  {editingSupplierId
                    ? "Update supplier details"
                    : "Create new supplier"}
                </p>

                <h2>
                  {editingSupplierId
                    ? "Edit Supplier"
                    : "Add Supplier"}
                </h2>
              </div>

              <button
                type="button"
                className="supplier-modal-close"
                onClick={resetForm}
              >
                <FiX />
              </button>
            </div>

            <form
              className="supplier-form"
              onSubmit={handleSubmit}
            >
              <div className="supplier-form-grid">
                <div className="supplier-form-group">
                  <label htmlFor="supplierName">
                    Supplier Name *
                  </label>

                  <input
                    id="supplierName"
                    name="supplierName"
                    type="text"
                    value={
                      formData.supplierName
                    }
                    onChange={handleChange}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="companyName">
                    Company Name
                  </label>

                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={
                      formData.companyName
                    }
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="phone">
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="gstNumber">
                    GST Number
                  </label>

                  <input
                    id="gstNumber"
                    name="gstNumber"
                    type="text"
                    value={
                      formData.gstNumber
                    }
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="openingBalance">
                    Opening Balance
                  </label>

                  <input
                    id="openingBalance"
                    name="openingBalance"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      formData.openingBalance
                    }
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="supplier-form-group supplier-full-width">
                  <label htmlFor="address">
                    Address
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter supplier address"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="city">
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="state">
                    State
                  </label>

                  <input
                    id="state"
                    name="state"
                    type="text"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="pincode">
                    Pincode
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                  />
                </div>

                <div className="supplier-form-group supplier-status-field">
                  <label>Status</label>

                  <label className="supplier-checkbox">
                    <input
                      name="isActive"
                      type="checkbox"
                      checked={
                        formData.isActive
                      }
                      onChange={handleChange}
                    />

                    <span>
                      Supplier active-ah
                      irukkar
                    </span>
                  </label>
                </div>

                <div className="supplier-form-group supplier-full-width">
                  <label htmlFor="notes">
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Enter additional notes"
                  />
                </div>
              </div>

              <div className="supplier-form-actions">
                <button
                  type="button"
                  className="supplier-cancel-btn"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="supplier-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingSupplierId
                      ? "Update Supplier"
                      : "Create Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Suppliers;