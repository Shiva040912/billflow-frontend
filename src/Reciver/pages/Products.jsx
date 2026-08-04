import { useEffect, useMemo, useState } from "react";
import api from "../services/axios";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiBox,
  FiEdit2,
  FiFilter,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import "../styles/products.css";

const createEmptyProductRow = () => ({
  rowId: crypto.randomUUID(),
  name: "",
  category: "",
  unit: "",
  purchasePrice: "",
  price: "",
  stock: "",
  gstRate: "0",
});

const initialFormData = {
  name: "",
  sku: "",
  category: "",
  unit: "",
  purchasePrice: "",
  price: "",
  stock: "",
  lowStockAlert: "5",
  gstRate: "0",
  description: "",
  isActive: true,
};

const EditProduct = ({
  isOpen,
  product,
  onClose,
  onProductUpdated,
}) => {
  const [formData, setFormData] =
    useState(initialFormData);

  const [categories, setCategories] = useState([]);

  const [isLoadingCategories, setIsLoadingCategories] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem(
      "billFlowAccessToken",
    );

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("billFlowAccessToken");
    localStorage.removeItem("billFlowUser");
    localStorage.removeItem("billFlowCompany");

    window.location.href = "/login";
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);

      const token = localStorage.getItem(
        "billFlowAccessToken",
      );

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await api.get(
        "/categories",
        {
          headers: getAuthHeaders(),
        },
      );

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

      const message = error.response?.data?.message;

      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : message ||
              "Categories load panna mudiyala",
      );
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !product) return;

    const categoryId =
      typeof product.category === "object"
        ? product.category?._id
        : product.category;

    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      category: categoryId || "",
      unit: product.unit || "",
      purchasePrice:
        product.purchasePrice ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      lowStockAlert:
        product.lowStockAlert ?? "5",
      gstRate: product.gstRate ?? "0",
      description: product.description || "",
      isActive:
        product.isActive === undefined
          ? true
          : Boolean(product.isActive),
    });

    fetchCategories();
  }, [isOpen, product]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setCategories([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

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
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !product) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  const validateNumberField = (
    value,
    fieldName,
    minimum = 0,
  ) => {
    if (
      value === "" ||
      Number.isNaN(Number(value)) ||
      Number(value) < minimum
    ) {
      toast.error(`Valid ${fieldName} enter pannu`);
      return false;
    }

    return true;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Product name enter pannu");
      return false;
    }

    if (formData.name.trim().length < 2) {
      toast.error(
        "Product name minimum 2 characters irukanum",
      );
      return false;
    }

    if (formData.name.trim().length > 150) {
      toast.error(
        "Product name maximum 150 characters mattum",
      );
      return false;
    }

    if (formData.sku.trim().length > 100) {
      toast.error(
        "SKU maximum 100 characters mattum",
      );
      return false;
    }

    if (!formData.category) {
      toast.error("Category select pannu");
      return false;
    }

    if (!formData.unit.trim()) {
      toast.error("Unit enter pannu");
      return false;
    }

    if (formData.unit.trim().length > 50) {
      toast.error(
        "Unit maximum 50 characters mattum",
      );
      return false;
    }

    if (
      !validateNumberField(
        formData.purchasePrice,
        "purchase price",
      )
    ) {
      return false;
    }

    if (
      !validateNumberField(
        formData.price,
        "selling price",
      )
    ) {
      return false;
    }

    if (
      !validateNumberField(
        formData.stock,
        "stock",
      )
    ) {
      return false;
    }

    if (
      !validateNumberField(
        formData.lowStockAlert,
        "low stock alert",
      )
    ) {
      return false;
    }

    if (
      !validateNumberField(
        formData.gstRate,
        "GST rate",
      )
    ) {
      return false;
    }

    if (Number(formData.gstRate) > 100) {
      toast.error(
        "GST rate 100%-ku mela irukka koodathu",
      );
      return false;
    }

    if (
      formData.description.trim().length > 500
    ) {
      toast.error(
        "Description maximum 500 characters mattum",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem(
        "billFlowAccessToken",
      );

      if (!token) {
        handleUnauthorized();
        return;
      }

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        unit: formData.unit.trim(),
        purchasePrice: Number(
          formData.purchasePrice,
        ),
        price: Number(formData.price),
        stock: Number(formData.stock),
        lowStockAlert: Number(
          formData.lowStockAlert,
        ),
        gstRate: Number(formData.gstRate),
        description:
          formData.description.trim(),
        isActive: Boolean(formData.isActive),
      };

      await api.patch(
        `/products/${product._id}`,
        payload,
        {
          headers: getAuthHeaders(),
        },
      );

      const selectedCategory = categories.find(
        (category) => category._id === payload.category,
      );

      const updatedProduct = {
        ...product,
        ...payload,
        _id: product._id,
        category: selectedCategory || product.category,
      };

      toast.success("Product updated successfully");

      if (onProductUpdated) {
        onProductUpdated(updatedProduct);
      }

      onClose();
    } catch (error) {
      console.error("Update product error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const responseMessage =
        error.response?.data?.message;

      toast.error(
        Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage ||
              "Product update panna mudiyala",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleOverlayClose();
        }
      }}
    >
      <div
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
      >
        <div className="product-modal-header">
          <div>
            <p>Product Management</p>

            <h2 id="edit-product-title">
              Edit Product
            </h2>

            <span>
              Update the selected product details.
            </span>
          </div>

          <button
            type="button"
            className="product-modal-close"
            onClick={handleOverlayClose}
            disabled={isSubmitting}
            aria-label="Close edit product modal"
          >
            <FiX />
          </button>
        </div>

        <form
          className="product-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="product-form-row">
            <div className="product-form-group">
              <label htmlFor="edit-name">
                Product Name
                <span>*</span>
              </label>

              <input
                id="edit-name"
                name="name"
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                maxLength={150}
                autoFocus
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="edit-sku">
                SKU
                <small>Optional</small>
              </label>

              <input
                id="edit-sku"
                name="sku"
                type="text"
                placeholder="Example: ITEM-001"
                value={formData.sku}
                onChange={handleChange}
                disabled={isSubmitting}
                maxLength={100}
              />
            </div>
          </div>

          <div className="product-form-row">
            <div className="product-form-group">
              <label htmlFor="edit-category">
                Category
                <span>*</span>
              </label>

              <select
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={
                  isSubmitting ||
                  isLoadingCategories
                }
              >
                <option value="">
                  {isLoadingCategories
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-form-group">
              <label htmlFor="edit-unit">
                Unit
                <span>*</span>
              </label>

              <input
                id="edit-unit"
                name="unit"
                type="text"
                list="edit-product-unit-options"
                placeholder="Kg, Box, Piece..."
                value={formData.unit}
                onChange={handleChange}
                disabled={isSubmitting}
                maxLength={50}
              />

              <datalist id="edit-product-unit-options">
                <option value="Piece" />
                <option value="Box" />
                <option value="Packet" />
                <option value="Bundle" />
                <option value="Carton" />
                <option value="Kilogram" />
                <option value="Kg" />
                <option value="Gram" />
                <option value="Litre" />
                <option value="ml" />
                <option value="Strip" />
                <option value="Bottle" />
                <option value="Meter" />
                <option value="Feet" />
                <option value="Roll" />
                <option value="Set" />
              </datalist>
            </div>
          </div>

          <div className="product-form-row">
            <div className="product-form-group">
              <label htmlFor="edit-purchase-price">
                Purchase Price
                <span>*</span>
              </label>

              <div className="product-price-input">
                <span>₹</span>

                <input
                  id="edit-purchase-price"
                  name="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="product-form-group">
              <label htmlFor="edit-price">
                Selling Price
                <span>*</span>
              </label>

              <div className="product-price-input">
                <span>₹</span>

                <input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="product-form-row product-form-three-columns">
            <div className="product-form-group">
              <label htmlFor="edit-stock">
                Stock
                <span>*</span>
              </label>

              <input
                id="edit-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="edit-low-stock">
                Low Stock Alert
                <span>*</span>
              </label>

              <input
                id="edit-low-stock"
                name="lowStockAlert"
                type="number"
                min="0"
                step="1"
                placeholder="5"
                value={formData.lowStockAlert}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="edit-gst">
                GST Rate
                <span>*</span>
              </label>

              <div className="product-gst-input">
                <input
                  id="edit-gst"
                  name="gstRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={formData.gstRate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />

                <span>%</span>
              </div>
            </div>
          </div>

          <div className="product-form-group">
            <label htmlFor="edit-description">
              Description
              <small>Optional</small>
            </label>

            <textarea
              id="edit-description"
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={4}
              maxLength={500}
            />

            <span className="product-character-count">
              {formData.description.length}/500
            </span>
          </div>

          <div className="product-status-field">
            <div>
              <strong>Product Status</strong>

              <span>
                Inactive product billing screen-la
                show aagathu.
              </span>
            </div>

            <label className="product-status-switch">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={isSubmitting}
              />

              <span className="product-status-slider" />
            </label>
          </div>

          <div className="product-form-actions">
            <button
              type="button"
              className="product-cancel-btn"
              onClick={handleOverlayClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="product-save-btn"
              disabled={
                isSubmitting ||
                isLoadingCategories
              }
            >
              {isSubmitting
                ? "Updating..."
                : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [stockStatus, setStockStatus] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [deletingProductId, setDeletingProductId] =
    useState("");

  const [isProductModalOpen, setIsProductModalOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [productRows, setProductRows] = useState([
    createEmptyProductRow(),
  ]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem(
      "billFlowAccessToken",
    );

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("billFlowAccessToken");
    localStorage.removeItem("billFlowUser");
    localStorage.removeItem("billFlowCompany");

    window.location.href = "/login";
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      const response = await api.get(
        "/products",
        {
          headers: getAuthHeaders(),
        },
      );

      const productData = Array.isArray(response.data)
        ? response.data
        : response.data?.products || [];

      setProducts(productData);
    } catch (error) {
      console.error("Fetch products error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Products load panna mudiyala",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        "/categories",
        {
          headers: getAuthHeaders(),
        },
      );

      const categoryData = Array.isArray(response.data)
        ? response.data
        : response.data?.categories || [];

      setCategories(
        categoryData.filter(
          (category) => category.isActive,
        ),
      );
    } catch (error) {
      console.error("Fetch categories error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Categories load panna mudiyala",
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isProductModalOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscapeKey = (event) => {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        handleCloseProductModal();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [isProductModalOpen, isSubmitting]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const productName =
        product.name?.toLowerCase() || "";

      const productDescription =
        product.description?.toLowerCase() || "";

      const matchesSearch =
        !normalizedSearch ||
        productName.includes(normalizedSearch) ||
        productDescription.includes(normalizedSearch);

      const categoryId =
        typeof product.category === "object"
          ? product.category?._id
          : product.category;

      const matchesCategory =
        selectedCategory === "all" ||
        categoryId === selectedCategory;

      let matchesStock = true;

      if (stockStatus === "in-stock") {
        matchesStock = Number(product.stock) > 5;
      }

      if (stockStatus === "low-stock") {
        matchesStock =
          Number(product.stock) > 0 &&
          Number(product.stock) <= 5;
      }

      if (stockStatus === "out-of-stock") {
        matchesStock = Number(product.stock) === 0;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
    stockStatus,
  ]);

  const productStats = useMemo(() => {
    const activeProducts = products.filter(
      (product) => product.isActive,
    ).length;

    const lowStockProducts = products.filter(
      (product) =>
        Number(product.stock) > 0 &&
        Number(product.stock) <= 5,
    ).length;

    const outOfStockProducts = products.filter(
      (product) => Number(product.stock) === 0,
    ).length;

    const inventoryValue = products.reduce(
      (total, product) =>
        total +
        (Number(product.purchasePrice) || 0) *
          (Number(product.stock) || 0),
      0,
    );

    return {
      total: products.length,
      active: activeProducts,
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      inventoryValue,
    };
  }, [products]);

  const hasActiveFilters =
    searchTerm.trim() ||
    selectedCategory !== "all" ||
    stockStatus !== "all";

  const handleOpenAddProducts = () => {
    setProductRows([
      createEmptyProductRow(),
    ]);

    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseEditProduct = () => {
    setSelectedProduct(null);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct._id === updatedProduct._id
          ? updatedProduct
          : currentProduct,
      ),
    );
  };

  const handleCloseProductModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsProductModalOpen(false);

    setProductRows([
      createEmptyProductRow(),
    ]);
  };

  const handleProductRowChange = (
    rowId,
    event,
  ) => {
    const { name, value } = event.target;

    setProductRows((currentRows) =>
      currentRows.map((row) =>
        row.rowId === rowId
          ? {
              ...row,
              [name]: value,
            }
          : row,
      ),
    );
  };

  const handleAddProductRow = () => {
    setProductRows((currentRows) => [
      ...currentRows,
      createEmptyProductRow(),
    ]);
  };

  const handleRemoveProductRow = (rowId) => {
    setProductRows((currentRows) => {
      if (currentRows.length === 1) {
        toast.error(
          "Minimum one product row irukkanum",
        );

        return currentRows;
      }

      return currentRows.filter(
        (row) => row.rowId !== rowId,
      );
    });
  };

  const validateNumberField = (
    value,
    fieldName,
    rowNumber,
  ) => {
    if (
      value === "" ||
      Number.isNaN(Number(value)) ||
      Number(value) < 0
    ) {
      toast.error(
        `Row ${rowNumber}: Valid ${fieldName} enter pannu`,
      );

      return false;
    }

    return true;
  };

  const validateProductRows = () => {
    for (
      let index = 0;
      index < productRows.length;
      index += 1
    ) {
      const row = productRows[index];
      const rowNumber = index + 1;

      if (!row.name.trim()) {
        toast.error(
          `Row ${rowNumber}: Product name enter pannu`,
        );

        return false;
      }

      if (row.name.trim().length < 2) {
        toast.error(
          `Row ${rowNumber}: Product name minimum 2 characters irukkanum`,
        );

        return false;
      }

      if (row.name.trim().length > 150) {
        toast.error(
          `Row ${rowNumber}: Product name maximum 150 characters mattum`,
        );

        return false;
      }

      if (!row.category) {
        toast.error(
          `Row ${rowNumber}: Category select pannu`,
        );

        return false;
      }

      if (!row.unit.trim()) {
        toast.error(
          `Row ${rowNumber}: Unit enter pannu`,
        );

        return false;
      }

      if (row.unit.trim().length > 50) {
        toast.error(
          `Row ${rowNumber}: Unit maximum 50 characters mattum`,
        );

        return false;
      }

      if (
        !validateNumberField(
          row.purchasePrice,
          "purchase price",
          rowNumber,
        )
      ) {
        return false;
      }

      if (
        !validateNumberField(
          row.price,
          "selling price",
          rowNumber,
        )
      ) {
        return false;
      }

      if (
        !validateNumberField(
          row.stock,
          "opening stock",
          rowNumber,
        )
      ) {
        return false;
      }

      if (
        !validateNumberField(
          row.gstRate,
          "GST rate",
          rowNumber,
        )
      ) {
        return false;
      }

      if (Number(row.gstRate) > 100) {
        toast.error(
          `Row ${rowNumber}: GST rate 100%-ku mela irukka koodathu`,
        );

        return false;
      }
    }

    return true;
  };

  const createProductPayload = (row) => ({
    name: row.name.trim(),
    sku: "",
    category: row.category,
    unit: row.unit.trim(),
    purchasePrice: Number(row.purchasePrice),
    price: Number(row.price),
    stock: Number(row.stock),
    lowStockAlert: 5,
    gstRate: Number(row.gstRate),
    description: "",
    isActive: true,
  });

  const handleSubmitProducts = async (event) => {
    event.preventDefault();

    if (!validateProductRows()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem(
        "billFlowAccessToken",
      );

      if (!token) {
        handleUnauthorized();
        return;
      }

      const productPayloads = productRows.map(
        createProductPayload,
      );

      await Promise.all(
        productPayloads.map((payload) =>
          api.post(
            "/products",
            payload,
            {
              headers: getAuthHeaders(),
            },
          ),
        ),
      );

      toast.success(
        `${productPayloads.length} product${
          productPayloads.length > 1 ? "s" : ""
        } created successfully`,
      );

      await fetchProducts();
      handleCloseProductModal();
    } catch (error) {
      console.error(
        "Save products error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const responseMessage =
        error.response?.data?.message;

      toast.error(
        Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage ||
              "Product save panna mudiyala",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const isConfirmed = window.confirm(
      `"${product.name}" product-ah delete panna confirm ah?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingProductId(product._id);

      await api.delete(
        `/products/${product._id}`,
        {
          headers: getAuthHeaders(),
        },
      );

      setProducts((currentProducts) =>
        currentProducts.filter(
          (currentProduct) =>
            currentProduct._id !== product._id,
        ),
      );

      toast.success(
        "Product deleted successfully",
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error,
      );

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Product delete panna mudiyala",
      );
    } finally {
      setDeletingProductId("");
    }
  };

  const clearProductFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setStockStatus("all");
  };

  const getStockClassName = (stock) => {
    const stockCount = Number(stock);

    if (stockCount === 0) {
      return "products-stock-badge out-of-stock";
    }

    if (stockCount <= 5) {
      return "products-stock-badge low-stock";
    }

    return "products-stock-badge in-stock";
  };

  const getStockLabel = (stock) => {
    const stockCount = Number(stock);

    if (stockCount === 0) {
      return "Out of Stock";
    }

    if (stockCount <= 5) {
      return `Low Stock · ${stockCount}`;
    }

    return `${stockCount} in stock`;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(price) || 0);

  return (
    <>
      <main className="products-page">
        <section className="products-header">
          <div className="products-header-content">
            <div className="products-title-row">
              <span className="products-title-icon">
                <FiPackage />
              </span>

              <div>
                <p className="products-eyebrow">
                  Inventory Catalogue
                </p>

                <h1>Products</h1>
              </div>
            </div>

            <p className="products-header-description">
              Manage pricing, stock availability and product
              catalogue from one production workspace.
            </p>
          </div>

          <button
            type="button"
            className="products-add-btn"
            onClick={handleOpenAddProducts}
          >
            <FiPlus />
            Add Products
          </button>
        </section>

        <section className="products-metrics-grid">
          <article className="products-metric-card">
            <span className="products-metric-icon total">
              <FiBox />
            </span>

            <div>
              <p>Total Products</p>
              <strong>{productStats.total}</strong>
              <small>Complete catalogue</small>
            </div>
          </article>

          <article className="products-metric-card">
            <span className="products-metric-icon active">
              <FiPackage />
            </span>

            <div>
              <p>Active Products</p>
              <strong>{productStats.active}</strong>
              <small>Available for billing</small>
            </div>
          </article>

          <article className="products-metric-card">
            <span className="products-metric-icon warning">
              <FiAlertTriangle />
            </span>

            <div>
              <p>Low Stock</p>
              <strong>{productStats.lowStock}</strong>
              <small>Needs attention</small>
            </div>
          </article>

          <article className="products-metric-card">
            <span className="products-metric-icon value">
              ₹
            </span>

            <div>
              <p>Inventory Value</p>
              <strong>
                {formatPrice(productStats.inventoryValue)}
              </strong>
              <small>Based on purchase price</small>
            </div>
          </article>
        </section>

        <section className="products-workspace">
          <div className="products-toolbar">
            <div className="products-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="products-search-clear"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <label className="products-filter-field">
              <FiFilter />

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="products-filter-field">
              <FiBox />

              <select
                value={stockStatus}
                onChange={(event) =>
                  setStockStatus(event.target.value)
                }
              >
                <option value="all">
                  All Stock Status
                </option>

                <option value="in-stock">
                  In Stock
                </option>

                <option value="low-stock">
                  Low Stock
                </option>

                <option value="out-of-stock">
                  Out of Stock
                </option>
              </select>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                className="products-clear-filters"
                onClick={clearProductFilters}
              >
                <FiX />
                Clear
              </button>
            )}
          </div>

          <div className="products-result-bar">
            <div>
              <strong>
                {filteredProducts.length} Product
                {filteredProducts.length === 1 ? "" : "s"}
              </strong>

              <span>
                {hasActiveFilters
                  ? "Matching current filters"
                  : "Showing complete product catalogue"}
              </span>
            </div>

            {productStats.outOfStock > 0 && (
              <span className="products-stock-alert">
                <FiAlertTriangle />
                {productStats.outOfStock} out of stock
              </span>
            )}
          </div>

          <section className="products-table-card">
            {isLoading ? (
              <div className="products-loading">
                <span className="products-loading-spinner" />
                <h3>Loading products...</h3>
                <p>Please wait while catalogue data is loading.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="products-empty-state">
                <span className="products-empty-icon">
                  <FiPackage />
                </span>

                <h3>
                  {products.length === 0
                    ? "No products added yet"
                    : "No matching products"}
                </h3>

                <p>
                  {products.length === 0
                    ? "Add your first product to start inventory and billing operations."
                    : "Try changing the search text or filters."}
                </p>

                {products.length === 0 ? (
                  <button
                    type="button"
                    className="products-empty-action"
                    onClick={handleOpenAddProducts}
                  >
                    <FiPlus />
                    Add First Product
                  </button>
                ) : (
                  <button
                    type="button"
                    className="products-empty-action secondary"
                    onClick={clearProductFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="products-desktop-table">
                  <div className="products-table-wrapper">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Product Details</th>
                          <th>Category</th>
                          <th>Purchase Price</th>
                          <th>Selling Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th className="products-actions-heading">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product._id}>
                            <td>
                              <div className="products-product-info">
                                <span className="products-product-image-placeholder">
                                  <FiPackage />
                                </span>

                                <div className="products-product-details">
                                  <strong className="products-product-name">
                                    {product.name}
                                  </strong>

                                  <span className="products-product-description">
                                    Unit: {product.unit || "Not specified"}
                                    {product.sku
                                      ? ` · SKU: ${product.sku}`
                                      : ""}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="products-category-name">
                                {product.category?.name || "Uncategorized"}
                              </span>
                            </td>

                            <td>
                              <span className="products-purchase-price">
                                {formatPrice(product.purchasePrice)}
                              </span>
                            </td>

                            <td>
                              <strong className="products-price">
                                {formatPrice(product.price)}
                              </strong>
                            </td>

                            <td>
                              <span className={getStockClassName(product.stock)}>
                                {getStockLabel(product.stock)}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  product.isActive
                                    ? "products-status-badge active"
                                    : "products-status-badge inactive"
                                }
                              >
                                <span className="products-status-dot" />
                                {product.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td>
                              <div className="products-actions">
                                <button
                                  type="button"
                                  className="products-action-btn"
                                  title="Edit product"
                                  onClick={() => handleOpenEditProduct(product)}
                                >
                                  <FiEdit2 />
                                </button>

                                <button
                                  type="button"
                                  className="products-action-btn delete"
                                  title="Delete product"
                                  disabled={deletingProductId === product._id}
                                  onClick={() => handleDeleteProduct(product)}
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

                <div className="products-mobile-list">
                  {filteredProducts.map((product) => (
                    <article className="products-mobile-card" key={product._id}>
                      <div className="products-mobile-card-top">
                        <div className="products-mobile-main-info">
                          <span className="products-mobile-product-icon">
                            <FiPackage />
                          </span>

                          <div>
                            <strong>{product.name}</strong>
                            <span>
                              {product.category?.name || "Uncategorized"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={
                            product.isActive
                              ? "products-status-badge active"
                              : "products-status-badge inactive"
                          }
                        >
                          <span className="products-status-dot" />
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="products-mobile-quick-row">
                        <div>
                          <span>Selling Price</span>
                          <strong>{formatPrice(product.price)}</strong>
                        </div>

                        <div>
                          <span>Purchase Price</span>
                          <strong>{formatPrice(product.purchasePrice)}</strong>
                        </div>
                      </div>

                      <div className="products-mobile-detail-row">
                        <span>Unit</span>
                        <strong>{product.unit || "—"}</strong>
                      </div>

                      <div className="products-mobile-detail-row">
                        <span>SKU</span>
                        <strong>{product.sku || "—"}</strong>
                      </div>

                      <div className="products-mobile-detail-row">
                        <span>Stock</span>
                        <span className={getStockClassName(product.stock)}>
                          {getStockLabel(product.stock)}
                        </span>
                      </div>

                      <div className="products-mobile-actions">
                        <button
                          type="button"
                          className="products-mobile-edit"
                          onClick={() => handleOpenEditProduct(product)}
                        >
                          <FiEdit2 />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="products-mobile-delete"
                          disabled={deletingProductId === product._id}
                          onClick={() => handleDeleteProduct(product)}
                        >
                          <FiTrash2 />
                          {deletingProductId === product._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {!isLoading && filteredProducts.length > 0 && (
              <div className="products-table-footer">
                <span>
                  Showing {filteredProducts.length} of {products.length} products
                </span>

                <span>
                  {productStats.lowStock} low stock · {productStats.outOfStock}{" "}
                  out of stock
                </span>
              </div>
            )}
          </section>
        </section>
      </main>

      {isProductModalOpen && (
        <div
          className="product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseProductModal();
            }
          }}
        >
          <div
            className="product-modal product-bulk-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="product-modal-header">
              <div>
                <p>Product Management</p>

                <h2 id="product-modal-title">
                  Add Products
                </h2>

                <span>
                  Add one or multiple products quickly.
                </span>
              </div>

              <button
                type="button"
                className="product-modal-close"
                onClick={handleCloseProductModal}
                disabled={isSubmitting}
                aria-label="Close product modal"
              >
                <FiX />
              </button>
            </div>

            <form
              className="product-form"
              onSubmit={handleSubmitProducts}
              noValidate
            >
              <div className="bulk-product-table-wrapper">
                <table className="bulk-product-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Unit</th>
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Opening Stock</th>
                      <th>GST</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productRows.map((row, index) => (
                      <tr key={row.rowId}>
                        <td>
                          <input
                            type="text"
                            name="name"
                            placeholder="Product name"
                            value={row.name}
                            onChange={(event) =>
                              handleProductRowChange(
                                row.rowId,
                                event,
                              )
                            }
                            disabled={isSubmitting}
                            maxLength={150}
                            autoFocus={index === 0}
                          />
                        </td>

                        <td>
                          <select
                            name="category"
                            value={row.category}
                            onChange={(event) =>
                              handleProductRowChange(
                                row.rowId,
                                event,
                              )
                            }
                            disabled={isSubmitting}
                          >
                            <option value="">
                              Select category
                            </option>

                            {categories.map((category) => (
                              <option
                                key={category._id}
                                value={category._id}
                              >
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <input
                            type="text"
                            name="unit"
                            list="product-unit-options"
                            placeholder="Piece"
                            value={row.unit}
                            onChange={(event) =>
                              handleProductRowChange(
                                row.rowId,
                                event,
                              )
                            }
                            disabled={isSubmitting}
                            maxLength={50}
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            name="purchasePrice"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={row.purchasePrice}
                            onChange={(event) =>
                              handleProductRowChange(
                                row.rowId,
                                event,
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={row.price}
                            onChange={(event) =>
                              handleProductRowChange(
                                row.rowId,
                                event,
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            name="stock"
                            placeholder="0"
                            min="0"
                            step="1"
                            value={row.stock}
                            onChange={(event) =>
                              handleProductRowChange(
                                row.rowId,
                                event,
                              )
                            }
                            disabled={isSubmitting}
                          />
                        </td>

                        <td>
                          <div className="bulk-gst-input">
                            <input
                              type="number"
                              name="gstRate"
                              placeholder="0"
                              min="0"
                              max="100"
                              step="0.01"
                              value={row.gstRate}
                              onChange={(event) =>
                                handleProductRowChange(
                                  row.rowId,
                                  event,
                                )
                              }
                              disabled={isSubmitting}
                            />

                            <span>%</span>
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="bulk-row-delete-btn"
                            title="Remove row"
                            disabled={
                              isSubmitting ||
                              productRows.length === 1
                            }
                            onClick={() =>
                              handleRemoveProductRow(
                                row.rowId,
                              )
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <datalist id="product-unit-options">
                <option value="Piece" />
                <option value="Box" />
                <option value="Packet" />
                <option value="Bundle" />
                <option value="Carton" />
                <option value="Kilogram" />
                <option value="Kg" />
                <option value="Gram" />
                <option value="g" />
                <option value="Litre" />
                <option value="ml" />
                <option value="Strip" />
                <option value="Tablet" />
                <option value="Capsule" />
                <option value="Bottle" />
                <option value="Tube" />
                <option value="Vial" />
                <option value="Meter" />
                <option value="Feet" />
                <option value="Roll" />
                <option value="Set" />
              </datalist>

              <button
                type="button"
                className="bulk-add-row-btn"
                onClick={handleAddProductRow}
                disabled={isSubmitting}
              >
                <FiPlus />
                Add Another Row
              </button>

              <div className="product-form-actions">
                <button
                  type="button"
                  className="product-cancel-btn"
                  onClick={handleCloseProductModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="product-save-btn"
                  disabled={
                    isSubmitting ||
                    categories.length === 0
                  }
                >
                  {isSubmitting
                    ? "Saving Products..."
                    : `Save ${productRows.length} Product${
                        productRows.length > 1
                          ? "s"
                          : ""
                      }`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EditProduct
        isOpen={Boolean(selectedProduct)}
        product={selectedProduct}
        onClose={handleCloseEditProduct}
        onProductUpdated={handleProductUpdated}
      />
    </>
  );
};

export default Products;