import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBox,
  FiDollarSign,
  FiEdit2,
  FiFilter,
  FiLayers,
  FiPackage,
  FiSearch,
  FiTrendingDown,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../services/axios";

import "../styles/inventory.css";


const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingProduct, setEditingProduct] = useState(null);
  const [stockForm, setStockForm] = useState({
    stock: "",
    lowStockAlert: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      const response = await api.get("/products");

      setProducts(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Stock details load panna mudiyala";

      toast.error(
        Array.isArray(message) ? message[0] : message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStockStatus = (product) => {
    const stock = Number(product.stock || 0);
    const lowStockAlert = Number(
      product.lowStockAlert || 0,
    );

    if (stock === 0) {
      return "out_of_stock";
    }

    if (stock <= lowStockAlert) {
      return "low_stock";
    }

    return "in_stock";
  };

  const getStatusLabel = (status) => {
    if (status === "in_stock") {
      return "In Stock";
    }

    if (status === "low_stock") {
      return "Low Stock";
    }

    return "Out of Stock";
  };

  const filteredProducts = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const stockStatus = getStockStatus(product);

      const matchesSearch =
        !searchValue ||
        [
          product.name,
          product.sku,
          product.category?.name,
          product.unit,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(searchValue),
        );

      const matchesStatus =
        statusFilter === "all" ||
        stockStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total + Number(product.stock || 0),
      0,
    );
  }, [products]);

  const totalStockValue = useMemo(() => {
    return products.reduce(
      (total, product) =>
        total +
        Number(product.stock || 0) *
          Number(product.purchasePrice || 0),
      0,
    );
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(
      (product) =>
        getStockStatus(product) === "low_stock",
    ).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(
      (product) =>
        getStockStatus(product) === "out_of_stock",
    ).length;
  }, [products]);

  const handleOpenEdit = (product) => {
    setEditingProduct(product);

    setStockForm({
      stock: product.stock ?? "",
      lowStockAlert: product.lowStockAlert ?? "",
    });
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);

    setStockForm({
      stock: "",
      lowStockAlert: "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setStockForm((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleUpdateStock = async (event) => {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    const stock = Number(stockForm.stock);
    const lowStockAlert = Number(
      stockForm.lowStockAlert,
    );

    if (stock < 0) {
      toast.error("Stock negative-ah irukka koodathu");
      return;
    }

    if (lowStockAlert < 0) {
      toast.error(
        "Low stock alert negative-ah irukka koodathu",
      );
      return;
    }

    try {
      setIsUpdating(true);

      const response = await api.patch(
        `/products/${editingProduct._id}`,
        {
          stock,
          lowStockAlert,
        },
      );

      const updatedProduct =
        response.data?.product || response.data;

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === editingProduct._id
            ? {
                ...product,
                ...updatedProduct,
                stock,
                lowStockAlert,
              }
            : product,
        ),
      );

      toast.success("Stock updated successfully");

      handleCloseEdit();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Stock update panna mudiyala";

      toast.error(
        Array.isArray(message) ? message[0] : message,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="stock-page">
      <div className="stock-page-shell">
        <div className="stock-summary-grid">
          <article className="stock-summary-card">
            <div className="stock-summary-card-top">
              <span className="stock-summary-icon product-icon">
                <FiBox />
              </span>

              <span className="stock-summary-trend neutral">
                Active inventory
              </span>
            </div>

            <div className="stock-summary-card-body">
              <p>Total Products</p>
              <h2>{products.length}</h2>
              <span>Products tracked in inventory</span>
            </div>
          </article>

          <article className="stock-summary-card">
            <div className="stock-summary-card-top">
              <span className="stock-summary-icon stock-icon">
                <FiLayers />
              </span>

              <span className="stock-summary-trend neutral">
                Available units
              </span>
            </div>

            <div className="stock-summary-card-body">
              <p>Total Stock</p>
              <h2>{totalStock.toLocaleString("en-IN")}</h2>
              <span>Combined quantity across products</span>
            </div>
          </article>

          <article className="stock-summary-card">
            <div className="stock-summary-card-top">
              <span className="stock-summary-icon value-icon">
                <FiDollarSign />
              </span>

              <span className="stock-summary-trend neutral">
                Purchase value
              </span>
            </div>

            <div className="stock-summary-card-body">
              <p>Total Stock Value</p>
              <h2>
                ₹
                {totalStockValue.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </h2>
              <span>Based on current purchase price</span>
            </div>
          </article>

          <article className="stock-summary-card warning">
            <div className="stock-summary-card-top">
              <span className="stock-summary-icon warning-icon">
                <FiTrendingDown />
              </span>

              <span className="stock-summary-trend danger">
                Needs attention
              </span>
            </div>

            <div className="stock-summary-card-body">
              <p>Low / Out of Stock</p>
              <h2>{lowStockCount + outOfStockCount}</h2>
              <span>
                {lowStockCount} low, {outOfStockCount} out
              </span>
            </div>
          </article>
        </div>

        <div className="stock-content-card">
          <div className="stock-content-header">
            <div>
              <span className="stock-section-label">
                Inventory Overview
              </span>
              <h2>Product Stock</h2>
              <p>
                Current quantity, pricing and stock status-ai
                review pannunga.
              </p>
            </div>

            <div className="stock-result-count">
              <strong>{filteredProducts.length}</strong>
              <span>
                product
                {filteredProducts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="stock-toolbar">
            <div className="stock-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search by product, SKU or category"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="stock-search-clear"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="stock-filter-wrap">
              <FiFilter />

              <select
                className="stock-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">
                  Out of Stock
                </option>
              </select>
            </div>
          </div>

          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Low Stock Alert</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Stock Value</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="stock-table-message"
                    >
                      <div className="stock-loading-state">
                        <span className="stock-loading-spinner" />
                        <strong>Stock loading...</strong>
                        <p>
                          Inventory details fetch
                          pannittu irukkom.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="stock-table-message"
                    >
                      <div className="stock-empty-state">
                        <span>
                          <FiPackage />
                        </span>
                        <strong>No products found</strong>
                        <p>
                          Search or status filter-ai change
                          panni try pannunga.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockStatus =
                      getStockStatus(product);

                    const stockValue =
                      Number(product.stock || 0) *
                      Number(product.purchasePrice || 0);

                    return (
                      <tr key={product._id}>
                        <td>
                          <div className="stock-product-cell">
                            <span className="stock-product-avatar">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                />
                              ) : (
                                product.name
                                  ?.charAt(0)
                                  .toUpperCase()
                              )}
                            </span>

                            <div>
                              <strong>{product.name}</strong>
                              <span>
                                {product.unit || "No unit"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="stock-sku">
                            {product.sku || "—"}
                          </span>
                        </td>

                        <td>
                          <span className="stock-category-name">
                            {product.category?.name || "—"}
                          </span>
                        </td>

                        <td>
                          <div className="stock-quantity-cell">
                            <strong>
                              {Number(
                                product.stock || 0,
                              ).toLocaleString("en-IN")}
                            </strong>
                            <span>{product.unit || "units"}</span>
                          </div>
                        </td>

                        <td>
                          <span className="stock-alert-value">
                            {Number(
                              product.lowStockAlert || 0,
                            ).toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td>
                          <span className="stock-money-value">
                            ₹
                            {Number(
                              product.purchasePrice || 0,
                            ).toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td>
                          <span className="stock-money-value selling">
                            ₹
                            {Number(
                              product.price || 0,
                            ).toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td>
                          <span className="stock-total-value">
                            ₹
                            {stockValue.toLocaleString(
                              "en-IN",
                              {
                                maximumFractionDigits: 2,
                              },
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`stock-status ${stockStatus}`}
                          >
                            <span className="stock-status-dot" />
                            {getStatusLabel(stockStatus)}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="stock-edit-btn"
                            onClick={() =>
                              handleOpenEdit(product)
                            }
                            title="Update stock"
                          >
                            <FiEdit2 />
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingProduct && (
        <div
          className="stock-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseEdit();
            }
          }}
        >
          <div className="stock-modal">
            <div className="stock-modal-header">
              <div className="stock-modal-title-wrap">
                <span className="stock-modal-icon">
                  <FiEdit2 />
                </span>

                <div>
                  <p>Update product stock</p>
                  <h2>{editingProduct.name}</h2>
                </div>
              </div>

              <button
                type="button"
                className="stock-modal-close"
                onClick={handleCloseEdit}
                aria-label="Close stock update modal"
              >
                <FiX />
              </button>
            </div>

            <div className="stock-modal-product">
              <div className="stock-modal-product-avatar">
                {editingProduct.imageUrl ? (
                  <img
                    src={editingProduct.imageUrl}
                    alt={editingProduct.name}
                  />
                ) : (
                  editingProduct.name
                    ?.charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div>
                <strong>{editingProduct.name}</strong>
                <span>
                  {editingProduct.sku || "No SKU"} ·{" "}
                  {editingProduct.category?.name ||
                    "No category"}
                </span>
              </div>

              <span
                className={`stock-status ${getStockStatus(
                  editingProduct,
                )}`}
              >
                <span className="stock-status-dot" />
                {getStatusLabel(
                  getStockStatus(editingProduct),
                )}
              </span>
            </div>

            <form
              className="stock-form"
              onSubmit={handleUpdateStock}
            >
              <div className="stock-form-grid">
                <div className="stock-form-group">
                  <label htmlFor="stock">
                    Current Stock
                  </label>

                  <div className="stock-input-wrap">
                    <FiBox />

                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={stockForm.stock}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <span>
                    Available product quantity
                  </span>
                </div>

                <div className="stock-form-group">
                  <label htmlFor="lowStockAlert">
                    Low Stock Alert
                  </label>

                  <div className="stock-input-wrap">
                    <FiAlertTriangle />

                    <input
                      id="lowStockAlert"
                      name="lowStockAlert"
                      type="number"
                      min="0"
                      step="1"
                      value={stockForm.lowStockAlert}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <span>
                    Alert trigger quantity
                  </span>
                </div>
              </div>

              <div className="stock-form-note">
                <FiAlertTriangle />
                <p>
                  Stock update pannina product availability
                  and stock value immediately update aagum.
                </p>
              </div>

              <div className="stock-form-actions">
                <button
                  type="button"
                  className="stock-cancel-btn"
                  onClick={handleCloseEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="stock-submit-btn"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="stock-btn-spinner" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiEdit2 />
                      Update Stock
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Inventory;