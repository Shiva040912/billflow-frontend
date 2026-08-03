import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiFolder,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import CategoryModal from "../components/CategoriesModal";
import api from "../services/axios";

import "../styles/categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [isLoading, setIsLoading] = useState(true);

  const [
    deletingCategoryId,
    setDeletingCategoryId,
  ] = useState("");

  const [
    isCategoryModalOpen,
    setIsCategoryModalOpen,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const handleUnauthorized = () => {
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
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      const response = await api.get(
        "/categories",
      );

      const categoryData = Array.isArray(
        response.data,
      )
        ? response.data
        : response.data?.categories || [];

      setCategories(categoryData);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const errorMessage =
        error.response?.data?.message;

      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage ||
              "Categories load panna mudiyala",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return categories.filter((category) => {
      const categoryName =
        category.name?.toLowerCase() || "";

      const categoryDescription =
        category.description?.toLowerCase() ||
        "";

      const matchesSearch =
        !normalizedSearch ||
        categoryName.includes(
          normalizedSearch,
        ) ||
        categoryDescription.includes(
          normalizedSearch,
        );

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          category.isActive) ||
        (statusFilter === "inactive" &&
          !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [
    categories,
    searchTerm,
    statusFilter,
  ]);

  const handleOpenAddModal = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(false);
  };

  const handleCategorySaved = () => {
    handleCloseModal();
    fetchCategories();
  };

  const handleDeleteCategory = async (
    category,
  ) => {
    const isConfirmed = window.confirm(
      `"${category.name}" category-ah delete panna confirm ah?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingCategoryId(category._id);

      await api.delete(
        `/categories/${category._id}`,
      );

      toast.success(
        "Category deleted successfully",
      );

      setCategories(
        (previousCategories) =>
          previousCategories.filter(
            (item) =>
              item._id !== category._id,
          ),
      );
    } catch (error) {
      console.error(
        "Delete category error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const errorMessage =
        error.response?.data?.message;

      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage ||
              "Category delete panna mudiyala",
      );
    } finally {
      setDeletingCategoryId("");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
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

  return (
    <>
      <div className="categories-page">
        <section className="categories-header">
          <div>
            <p className="categories-eyebrow">
              Category Management
            </p>

            <h1>Categories</h1>

            <p>
              Manage the categories used for your
              company products.
            </p>
          </div>

          <button
            type="button"
            className="categories-add-btn"
            onClick={handleOpenAddModal}
          >
            <FiPlus />
            Add Category
          </button>
        </section>

        <section className="categories-summary">
          <div className="categories-summary-card">
            <span>Total Categories</span>

            <strong>
              {categories.length}
            </strong>
          </div>

          <div className="categories-summary-card">
            <span>Active Categories</span>

            <strong>
              {
                categories.filter(
                  (category) =>
                    category.isActive,
                ).length
              }
            </strong>
          </div>

          <div className="categories-summary-card">
            <span>Inactive Categories</span>

            <strong>
              {
                categories.filter(
                  (category) =>
                    !category.isActive,
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="categories-toolbar">
          <div className="categories-search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search by category name..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
            />
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
        </section>

        <section className="categories-table-card">
          {isLoading ? (
            <div className="categories-empty-state">
              <h3>
                Loading categories...
              </h3>

              <p>
                Please wait for a moment.
              </p>
            </div>
          ) : filteredCategories.length ===
            0 ? (
            <div className="categories-empty-state">
              <FiFolder />

              <h3>
                No categories available
              </h3>

              <p>
                {categories.length === 0
                  ? "Create your first category to start adding products."
                  : "No categories match your search or filter."}
              </p>
            </div>
          ) : (
            <div className="categories-table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map(
                    (category) => (
                      <tr key={category._id}>
                        <td>
                          <div className="categories-category-info">
                            <div className="categories-category-icon">
                              <FiFolder />
                            </div>

                            <strong>
                              {category.name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="categories-description">
                            {category.description ||
                              "No description"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              category.isActive
                                ? "categories-status-badge active"
                                : "categories-status-badge inactive"
                            }
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            category.createdAt,
                          )}
                        </td>

                        <td>
                          <div className="categories-actions">
                            <button
                              type="button"
                              className="categories-action-btn"
                              title="Edit category"
                              onClick={() =>
                                handleOpenEditModal(
                                  category,
                                )
                              }
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className="categories-action-btn delete"
                              title="Delete category"
                              disabled={
                                deletingCategoryId ===
                                category._id
                              }
                              onClick={() =>
                                handleDeleteCategory(
                                  category,
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
          )}
        </section>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        category={selectedCategory}
        onClose={handleCloseModal}
        onCategorySaved={
          handleCategorySaved
        }
      />
    </>
  );
};

export default Categories;