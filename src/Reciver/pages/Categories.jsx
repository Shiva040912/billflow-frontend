import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArchive,
  FiCheckCircle,
  FiEdit2,
  FiFolder,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import CategoryModal from "../components/CategoriesModal";
import api from "../services/axios";

import "../styles/categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [deletingCategoryId, setDeletingCategoryId] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleUnauthorized = () => {
    localStorage.removeItem("billFlowAccessToken");
    localStorage.removeItem("billFlowUser");
    localStorage.removeItem("billFlowCompany");
    window.location.href = "/login";
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      const response = await api.get("/categories");

      const categoryData = Array.isArray(response.data)
        ? response.data
        : response.data?.categories || [];

      setCategories(categoryData);
    } catch (error) {
      console.error("Fetch categories error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const errorMessage = error.response?.data?.message;

      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage || "Categories load panna mudiyala",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const categoryName = category.name?.toLowerCase() || "";
      const categoryDescription = category.description?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        categoryName.includes(normalizedSearch) ||
        categoryDescription.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const activeCategoriesCount = categories.filter(
    (category) => category.isActive,
  ).length;

  const inactiveCategoriesCount = categories.filter(
    (category) => !category.isActive,
  ).length;

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

  const handleDeleteCategory = async (category) => {
    const isConfirmed = window.confirm(
      `"${category.name}" category-ah delete panna confirm ah?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingCategoryId(category._id);

      await api.delete(`/categories/${category._id}`);

      toast.success("Category deleted successfully");

      setCategories((previousCategories) =>
        previousCategories.filter((item) => item._id !== category._id),
      );
    } catch (error) {
      console.error("Delete category error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const errorMessage = error.response?.data?.message;

      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage || "Category delete panna mudiyala",
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

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const hasFilters = searchTerm.trim() || statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const renderEmptyState = () => (
    <div className="categories-empty-state">
      <span className="categories-empty-icon">
        <FiFolder />
      </span>

      <h3>
        {categories.length === 0
          ? "No categories added yet"
          : "No matching categories"}
      </h3>

      <p>
        {categories.length === 0
          ? "Create your first category to organise products and make billing easier."
          : "Try changing the search text or status filter."}
      </p>

      {categories.length === 0 ? (
        <button
          type="button"
          className="categories-empty-action"
          onClick={handleOpenAddModal}
        >
          <FiPlus />
          Add First Category
        </button>
      ) : (
        <button
          type="button"
          className="categories-empty-action secondary"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <main className="categories-page">
        <section className="categories-header">
          <div className="categories-header-content">
            <span className="categories-eyebrow">Product Organisation</span>
            <h1>Categories</h1>
            <p className="categories-header-description">
              Organise your product catalogue into clear business categories.
            </p>
          </div>

          <button
            type="button"
            className="categories-add-btn"
            onClick={handleOpenAddModal}
          >
            <FiPlus />
            <span>Add Category</span>
          </button>
        </section>

        <section className="categories-summary">
          <article className="categories-summary-card total">
            <span className="categories-summary-icon">
              <FiFolder />
            </span>
            <div>
              <p>Total Categories</p>
              <strong>{categories.length}</strong>
              <small>Complete catalogue groups</small>
            </div>
          </article>

          <article className="categories-summary-card active">
            <span className="categories-summary-icon">
              <FiCheckCircle />
            </span>
            <div>
              <p>Active</p>
              <strong>{activeCategoriesCount}</strong>
              <small>Available for products</small>
            </div>
          </article>

          <article className="categories-summary-card inactive">
            <span className="categories-summary-icon">
              <FiArchive />
            </span>
            <div>
              <p>Inactive</p>
              <strong>{inactiveCategoriesCount}</strong>
              <small>Currently hidden</small>
            </div>
          </article>
        </section>

        <section className="categories-workspace">
          <div className="categories-toolbar">
            <div className="categories-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  className="categories-search-clear"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear category search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter category status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                className="categories-clear-filter"
                onClick={clearFilters}
              >
                <FiX />
                Clear
              </button>
            )}
          </div>

          <div className="categories-result-bar">
            <div>
              <strong>
                {filteredCategories.length} Categor
                {filteredCategories.length === 1 ? "y" : "ies"}
              </strong>
              <span>
                {hasFilters
                  ? "Matching current search and filters"
                  : "Showing complete category catalogue"}
              </span>
            </div>

            <span className="categories-result-meta">
              {activeCategoriesCount} active
            </span>
          </div>

          <section className="categories-content-card">
            {isLoading ? (
              <div className="categories-empty-state">
                <div className="categories-loader" />
                <h3>Loading categories...</h3>
                <p>Please wait while category data is loading.</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <div className="categories-desktop-table">
                  <div className="categories-table-wrapper">
                    <table className="categories-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Created On</th>
                          <th className="categories-actions-heading">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredCategories.map((category) => (
                          <tr key={category._id}>
                            <td>
                              <div className="categories-category-info">
                                <div className="categories-category-icon">
                                  <FiFolder />
                                </div>

                                <div>
                                  <strong>{category.name}</strong>
                                  <span>Product category</span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="categories-description">
                                {category.description || "No description added"}
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
                                <span className="categories-status-dot" />
                                {category.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td>
                              <span className="categories-date">
                                {formatDate(category.createdAt)}
                              </span>
                            </td>

                            <td>
                              <div className="categories-actions">
                                <button
                                  type="button"
                                  className="categories-action-btn"
                                  title="Edit category"
                                  aria-label={`Edit ${category.name}`}
                                  onClick={() => handleOpenEditModal(category)}
                                >
                                  <FiEdit2 />
                                </button>

                                <button
                                  type="button"
                                  className="categories-action-btn delete"
                                  title="Delete category"
                                  aria-label={`Delete ${category.name}`}
                                  disabled={deletingCategoryId === category._id}
                                  onClick={() => handleDeleteCategory(category)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="categories-mobile-list">
                  {filteredCategories.map((category) => (
                    <article className="categories-mobile-card" key={category._id}>
                      <div className="categories-mobile-card-header">
                        <div className="categories-mobile-category">
                          <div className="categories-category-icon">
                            <FiFolder />
                          </div>

                          <div className="categories-mobile-title">
                            <strong>{category.name}</strong>
                            <span>Created {formatDate(category.createdAt)}</span>
                          </div>
                        </div>

                        <span
                          className={
                            category.isActive
                              ? "categories-status-badge active"
                              : "categories-status-badge inactive"
                          }
                        >
                          <span className="categories-status-dot" />
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="categories-mobile-description">
                        {category.description ||
                          "No description added for this category."}
                      </p>

                      <div className="categories-mobile-actions">
                        <button
                          type="button"
                          className="categories-mobile-edit-btn"
                          onClick={() => handleOpenEditModal(category)}
                        >
                          <FiEdit2 />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="categories-mobile-delete-btn"
                          disabled={deletingCategoryId === category._id}
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <FiTrash2 />
                          <span>
                            {deletingCategoryId === category._id
                              ? "Deleting..."
                              : "Delete"}
                          </span>
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

      <CategoryModal
        isOpen={isCategoryModalOpen}
        category={selectedCategory}
        onClose={handleCloseModal}
        onCategorySaved={handleCategorySaved}
      />
    </>
  );
};

export default Categories;