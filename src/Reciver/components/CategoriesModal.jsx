import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

import api from "../services/axios";

const CategoryModal = ({
  isOpen,
  category,
  onClose,
  onCategorySaved,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isEditMode = Boolean(category?._id);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        isActive:
          category.isActive !== undefined
            ? category.isActive
            : true,
      });

      return;
    }

    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
  }, [isOpen, category]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  const handleInputChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const categoryName =
      formData.name.trim();

    const categoryDescription =
      formData.description.trim();

    if (!categoryName) {
      toast.error("Category name is required");
      return false;
    }

    if (categoryName.length < 2) {
      toast.error(
        "Category name minimum 2 characters irukanum",
      );
      return false;
    }

    if (categoryName.length > 100) {
      toast.error(
        "Category name maximum 100 characters mattum",
      );
      return false;
    }

    if (categoryDescription.length > 500) {
      toast.error(
        "Description maximum 500 characters mattum",
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

    const payload = {
      name: formData.name.trim(),
      description:
        formData.description.trim(),
      isActive: formData.isActive,
    };

    try {
      setIsSubmitting(true);

      if (isEditMode) {
        await api.patch(
          `/categories/${category._id}`,
          payload,
        );

        toast.success(
          "Category updated successfully",
        );
      } else {
        await api.post(
          "/categories",
          payload,
        );

        toast.success(
          "Category created successfully",
        );
      }

      onCategorySaved();
    } catch (error) {
      console.error(
        "Save category error:",
        error,
      );

      if (error.response?.status === 401) {
        localStorage.removeItem(
          "billFlowAccessToken",
        );

        localStorage.removeItem(
          "billFlowUser",
        );

        localStorage.removeItem(
          "billFlowCompany",
        );

        window.location.href = "/login";
        return;
      }

      const errorMessage =
        error.response?.data?.message;

      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage ||
              "Category save panna mudiyala",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !isSubmitting
    ) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="category-modal-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        <div className="category-modal-header">
          <div>
            <p>
              {isEditMode
                ? "Update Category"
                : "Create Category"}
            </p>

            <h2 id="category-modal-title">
              {isEditMode
                ? "Edit Category"
                : "Add Category"}
            </h2>
          </div>

          <button
            type="button"
            className="category-modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close category modal"
          >
            <FiX />
          </button>
        </div>

        <form
          className="category-modal-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="category-form-group">
            <label htmlFor="category-name">
              Category Name
              <span>*</span>
            </label>

            <input
              id="category-name"
              type="text"
              name="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleInputChange}
              maxLength={100}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <div className="category-form-group">
            <label htmlFor="category-description">
              Description
            </label>

            <textarea
              id="category-description"
              name="description"
              placeholder="Enter category description"
              value={formData.description}
              onChange={handleInputChange}
              maxLength={500}
              rows={4}
              disabled={isSubmitting}
            />

            <span className="category-character-count">
              {formData.description.length}/500
            </span>
          </div>

          <div className="category-status-field">
            <div>
              <strong>Category Status</strong>

              <span>
                Inactive category product dropdown-la
                show aagathu.
              </span>
            </div>

            <label className="category-status-switch">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />

              <span className="category-status-slider" />
            </label>
          </div>

          <div className="category-modal-actions">
            <button
              type="button"
              className="category-cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="category-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Category"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;