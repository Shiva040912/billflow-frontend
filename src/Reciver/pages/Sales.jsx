import { useEffect, useMemo, useState } from "react";
import api from "../services/axios";
import { FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";


import { createSale, getSales } from "../services/salesService";

import "../styles/sales.css";

const initialFormData = {
  customerId: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  discountAmount: 0,
  paymentMethod: "cash",
  paymentStatus: "paid",
  paidAmount: 0,
  notes: "",
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [formData, setFormData] = useState(initialFormData);
  const [saleItems, setSaleItems] = useState([]);

  const [productSearch, setProductSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSale, setIsCreatingSale] = useState(false);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("billFlowAccessToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [salesResponse, productsResponse, customersResponse] =
        await Promise.all([
          getSales(),
          api.get("/products"),
          api.get("/customers"),
        ]);

      setSales(
        Array.isArray(salesResponse)
          ? salesResponse
          : salesResponse?.sales || [],
      );

      setProducts(
        Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.products || [],
      );

      setCustomers(
        Array.isArray(customersResponse.data)
          ? customersResponse.data
          : customersResponse.data?.customers || [],
      );
    } catch (error) {
      console.error(
        "Sales initial data error:",
        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.message ||
          "Sales data load panna mudiyala",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredProducts = useMemo(() => {
    const searchValue = productSearch.trim().toLowerCase();

    if (!searchValue) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(searchValue) ||
        product.sku?.toLowerCase().includes(searchValue)
      );
    });
  }, [products, productSearch]);

  const filteredSales = useMemo(() => {
    const searchValue = salesSearch.trim().toLowerCase();

    if (!searchValue) {
      return sales;
    }

    return sales.filter((sale) => {
      return (
        sale.invoiceNumber?.toLowerCase().includes(searchValue) ||
        sale.customerName?.toLowerCase().includes(searchValue) ||
        sale.customerPhone?.toLowerCase().includes(searchValue)
      );
    });
  }, [sales, salesSearch]);

  const totals = useMemo(() => {
    const subtotal = saleItems.reduce(
      (total, item) => total + item.taxableAmount,
      0,
    );

    const gstAmount = saleItems.reduce(
      (total, item) => total + item.gstAmount,
      0,
    );

    const discountAmount = Number(formData.discountAmount || 0);

    const grandTotal = Math.max(
      0,
      subtotal + gstAmount - discountAmount,
    );

    return {
      subtotal: Number(subtotal.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
    };
  }, [saleItems, formData.discountAmount]);

  useEffect(() => {
    if (formData.paymentStatus === "paid") {
      setFormData((currentData) => ({
        ...currentData,
        paidAmount: totals.grandTotal,
      }));
    }

    if (formData.paymentStatus === "unpaid") {
      setFormData((currentData) => ({
        ...currentData,
        paidAmount: 0,
      }));
    }
  }, [formData.paymentStatus, totals.grandTotal]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleCustomerChange = (event) => {
    const customerId = event.target.value;

    if (!customerId) {
      setFormData((currentData) => ({
        ...currentData,
        customerId: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
      }));

      return;
    }

    const selectedCustomer = customers.find(
      (customer) => customer._id === customerId,
    );

    if (!selectedCustomer) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      customerId: selectedCustomer._id,
      customerName: selectedCustomer.name || "",
      customerPhone: selectedCustomer.phone || "",
      customerEmail: selectedCustomer.email || "",
    }));
  };

  const addProductToSale = (product) => {
    if (Number(product.stock || 0) <= 0) {
      toast.error("Intha product out of stock");
      return;
    }

    const existingItem = saleItems.find(
      (item) => item.productId === product._id,
    );

    if (existingItem) {
      if (existingItem.quantity >= Number(product.stock)) {
        toast.error("Available stock limit reach aagiruchu");
        return;
      }

      setSaleItems((currentItems) =>
        currentItems.map((item) => {
          if (item.productId !== product._id) {
            return item;
          }

          const quantity = item.quantity + 1;
          const taxableAmount = quantity * item.unitPrice;
          const gstAmount =
            (taxableAmount * item.gstRate) / 100;

          return {
            ...item,
            quantity,
            taxableAmount: Number(taxableAmount.toFixed(2)),
            gstAmount: Number(gstAmount.toFixed(2)),
            totalAmount: Number(
              (taxableAmount + gstAmount).toFixed(2),
            ),
          };
        }),
      );

      return;
    }

    const quantity = 1;
    const unitPrice = Number(product.price || 0);
    const gstRate = Number(product.gstRate || 0);

    const taxableAmount = quantity * unitPrice;
    const gstAmount = (taxableAmount * gstRate) / 100;

    setSaleItems((currentItems) => [
      ...currentItems,
      {
        productId: product._id,
        productName: product.name,
        sku: product.sku || "",
        quantity,
        unitPrice,
        gstRate,
        taxableAmount: Number(taxableAmount.toFixed(2)),
        gstAmount: Number(gstAmount.toFixed(2)),
        totalAmount: Number(
          (taxableAmount + gstAmount).toFixed(2),
        ),
        unit: product.unit || "",
        availableStock: Number(product.stock || 0),
      },
    ]);
  };

  const updateItemQuantity = (productId, value) => {
    const quantity = Number(value);

    setSaleItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const safeQuantity = Math.max(
          1,
          Math.min(quantity || 1, item.availableStock),
        );

        const taxableAmount =
          safeQuantity * item.unitPrice;

        const gstAmount =
          (taxableAmount * item.gstRate) / 100;

        return {
          ...item,
          quantity: safeQuantity,
          taxableAmount: Number(taxableAmount.toFixed(2)),
          gstAmount: Number(gstAmount.toFixed(2)),
          totalAmount: Number(
            (taxableAmount + gstAmount).toFixed(2),
          ),
        };
      }),
    );
  };

  const removeSaleItem = (productId) => {
    setSaleItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId,
      ),
    );
  };

  const resetSaleForm = () => {
    setFormData(initialFormData);
    setSaleItems([]);
    setProductSearch("");
  };

  const handleCreateSale = async (event) => {
    event.preventDefault();

    if (saleItems.length === 0) {
      toast.error("Minimum one product add pannanum");
      return;
    }

    if (
      Number(formData.discountAmount || 0) >
      totals.subtotal + totals.gstAmount
    ) {
      toast.error("Discount total amount vida adhigama iruka koodathu");
      return;
    }

    if (
      formData.paymentStatus === "partial" &&
      Number(formData.paidAmount || 0) <= 0
    ) {
      toast.error("Partial payment-ku paid amount enter pannanum");
      return;
    }

    const payload = {
      customerId: formData.customerId || undefined,
      customerName:
        formData.customerName.trim() || "Walk-in Customer",
      customerPhone: formData.customerPhone.trim(),
      customerEmail: formData.customerEmail.trim(),

      items: saleItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        gstRate: Number(item.gstRate),
        unit: item.unit,
      })),

      discountAmount: Number(formData.discountAmount || 0),
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      paidAmount: Number(formData.paidAmount || 0),
      notes: formData.notes.trim(),
    };

    try {
      setIsCreatingSale(true);

      const response = await createSale(payload);

      toast.success(
        response.message || "Sale created successfully",
      );

      resetSaleForm();
      await fetchInitialData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Sale create panna mudiyala",
      );
    } finally {
      setIsCreatingSale(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sales-page">
        <div className="sales-loading">
          Sales data loading...
        </div>
      </div>
    );
  }

  return (
    <div className="sales-page">
      <div className="sales-header">
        <div>
          <h1>Sales & Billing</h1>
          <p>
            Invoice create panni stock and payment manage
            pannunga.
          </p>
        </div>
      </div>

      <div className="sales-layout">
        <form
          className="sales-create-section"
          onSubmit={handleCreateSale}
        >
          <div className="sales-card">
            <div className="sales-card-header">
              <div>
                <h2>Create Invoice</h2>
                <p>Customer and payment details</p>
              </div>
            </div>

            <div className="sales-form-grid">
              <div className="sales-form-group sales-full-field">
                <label htmlFor="customerId">
                  Existing Customer
                </label>

                <select
                  id="customerId"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleCustomerChange}
                >
                  <option value="">
                    Walk-in Customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer._id}
                      value={customer._id}
                    >
                      {customer.name}
                      {customer.phone
                        ? ` - ${customer.phone}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sales-form-group">
                <label htmlFor="customerName">
                  Customer Name
                </label>

                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={handleFormChange}
                  placeholder="Customer name"
                />
              </div>

              <div className="sales-form-group">
                <label htmlFor="customerPhone">
                  Phone Number
                </label>

                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="text"
                  value={formData.customerPhone}
                  onChange={handleFormChange}
                  placeholder="Phone number"
                />
              </div>

              <div className="sales-form-group">
                <label htmlFor="customerEmail">
                  Email
                </label>

                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleFormChange}
                  placeholder="Email address"
                />
              </div>

              <div className="sales-form-group">
                <label htmlFor="paymentMethod">
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleFormChange}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">
                    Bank Transfer
                  </option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div className="sales-form-group">
                <label htmlFor="paymentStatus">
                  Payment Status
                </label>

                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleFormChange}
                >
                  <option value="paid">Paid</option>
                  <option value="partial">
                    Partial
                  </option>
                  <option value="unpaid">
                    Unpaid
                  </option>
                </select>
              </div>

              <div className="sales-form-group">
                <label htmlFor="paidAmount">
                  Paid Amount
                </label>

                <input
                  id="paidAmount"
                  name="paidAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paidAmount}
                  onChange={handleFormChange}
                  disabled={
                    formData.paymentStatus !== "partial"
                  }
                />
              </div>
            </div>
          </div>

          <div className="sales-card">
            <div className="sales-card-header">
              <div>
                <h2>Add Products</h2>
                <p>Product select panni quantity update pannunga</p>
              </div>
            </div>

            <div className="sales-search-box">
              <FiSearch />

              <input
                type="text"
                value={productSearch}
                onChange={(event) =>
                  setProductSearch(event.target.value)
                }
                placeholder="Product name or SKU search..."
              />
            </div>

            <div className="sales-product-list">
              {filteredProducts.map((product) => (
                <div
                  className="sales-product-item"
                  key={product._id}
                >
                  <div>
                    <h3>{product.name}</h3>

                    <p>
                      SKU: {product.sku || "-"} · Stock:{" "}
                      {product.stock || 0} {product.unit || ""}
                    </p>
                  </div>

                  <div className="sales-product-action">
                    <strong>
                      ₹{Number(product.price || 0).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        addProductToSale(product)
                      }
                      disabled={
                        Number(product.stock || 0) <= 0
                      }
                    >
                      <FiPlus />
                      Add
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="sales-empty-state">
                  Product found aagala.
                </div>
              )}
            </div>
          </div>

          <div className="sales-card">
            <div className="sales-card-header">
              <div>
                <h2>Invoice Items</h2>
                <p>{saleItems.length} products added</p>
              </div>
            </div>

            <div className="sales-items-table-wrapper">
              <table className="sales-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {saleItems.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <strong>{item.productName}</strong>
                        <span>{item.sku || "-"}</span>
                      </td>

                      <td>
                        ₹{item.unitPrice.toFixed(2)}
                      </td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          max={item.availableStock}
                          value={item.quantity}
                          onChange={(event) =>
                            updateItemQuantity(
                              item.productId,
                              event.target.value,
                            )
                          }
                        />
                      </td>

                      <td>
                        {item.gstRate}%<br />
                        <span>
                          ₹{item.gstAmount.toFixed(2)}
                        </span>
                      </td>

                      <td>
                        ₹{item.totalAmount.toFixed(2)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="sales-remove-btn"
                          onClick={() =>
                            removeSaleItem(item.productId)
                          }
                          aria-label="Remove product"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {saleItems.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        <div className="sales-empty-state">
                          Invoice-ku product add pannala.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="sales-bottom-grid">
              <div className="sales-form-group">
                <label htmlFor="notes">Notes</label>

                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Invoice notes..."
                  rows="4"
                />
              </div>

              <div className="sales-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>
                    ₹{totals.subtotal.toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>GST</span>
                  <strong>
                    ₹{totals.gstAmount.toFixed(2)}
                  </strong>
                </div>

                <div className="sales-discount-row">
                  <label htmlFor="discountAmount">
                    Discount
                  </label>

                  <input
                    id="discountAmount"
                    name="discountAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="sales-grand-total">
                  <span>Grand Total</span>
                  <strong>
                    ₹{totals.grandTotal.toFixed(2)}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="sales-create-btn"
                  disabled={isCreatingSale}
                >
                  {isCreatingSale
                    ? "Creating Invoice..."
                    : "Create Invoice"}
                </button>
              </div>
            </div>
          </div>
        </form>

        <aside className="sales-history-section">
          <div className="sales-card sales-history-card">
            <div className="sales-card-header">
              <div>
                <h2>Recent Sales</h2>
                <p>{sales.length} total invoices</p>
              </div>
            </div>

            <div className="sales-search-box">
              <FiSearch />

              <input
                type="text"
                value={salesSearch}
                onChange={(event) =>
                  setSalesSearch(event.target.value)
                }
                placeholder="Invoice or customer search..."
              />
            </div>

            <div className="sales-history-list">
              {filteredSales.map((sale) => (
                <div
                  className="sales-history-item"
                  key={sale._id}
                >
                  <div className="sales-history-top">
                    <div>
                      <h3>{sale.invoiceNumber}</h3>
                      <p>
                        {sale.customerName ||
                          "Walk-in Customer"}
                      </p>
                    </div>

                    <strong>
                      ₹{Number(
                        sale.grandTotal || 0,
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div className="sales-history-bottom">
                    <span
                      className={`sales-status sales-status-${sale.paymentStatus}`}
                    >
                      {sale.paymentStatus}
                    </span>

                    <span>
                      {sale.createdAt
                        ? new Date(
                            sale.createdAt,
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </span>
                  </div>
                </div>
              ))}

              {filteredSales.length === 0 && (
                <div className="sales-empty-state">
                  Sales records illa.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Sales;