import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../services/axios";
import toast from "react-hot-toast";
import {
  FiChevronDown,
  FiCommand,
  FiDownload,
  FiMinus,
  FiPlus,
  FiPrinter,
  FiSearch,
  FiShoppingCart,
  FiTrash2,
  FiUser,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

import "../styles/billing.css";

const DOUBLE_ENTER_DELAY = 650;

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [productSearch, setProductSearch] = useState("");
  const [billItems, setBillItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [enterArmed, setEnterArmed] = useState(false);

  const customerInputRef = useRef(null);
  const productInputRef = useRef(null);
  const paymentSelectRef = useRef(null);
  const printFrameRef = useRef(null);
  const lastEnterAtRef = useRef(0);
  const enterTimerRef = useRef(null);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("billFlowAccessToken");
    localStorage.removeItem("billFlowUser");
    localStorage.removeItem("billFlowCompany");
    window.location.href = "/login";
  }, []);

  const fetchBillingData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [customersResponse, productsResponse] = await Promise.all([
        api.get("/customers"),
        api.get("/products"),
      ]);

      const customerData = Array.isArray(customersResponse.data)
        ? customersResponse.data
        : customersResponse.data?.customers || [];

      const productData = Array.isArray(productsResponse.data)
        ? productsResponse.data
        : productsResponse.data?.products || [];

      setCustomers(customerData);
      setProducts(
        productData.filter(
          (product) => product.isActive && Number(product.stock) > 0,
        ),
      );
    } catch (error) {
      console.error("Billing data fetch error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Billing data load panna mudiyala",
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
      }
    };
  }, []);

  const matchedCustomers = useMemo(() => {
    const search = customerPhone.trim().toLowerCase();

    if (search.length < 2 || selectedCustomer) {
      return [];
    }

    return customers
      .filter((customer) => {
        const phone = String(customer.phone || "").toLowerCase();
        const name = String(customer.name || "").toLowerCase();
        return phone.includes(search) || name.includes(search);
      })
      .slice(0, 7);
  }, [customers, customerPhone, selectedCustomer]);

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) return [];

    return products
      .filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const sku = product.sku?.toLowerCase() || "";
        return name.includes(search) || sku.includes(search);
      })
      .slice(0, 10);
  }, [products, productSearch]);

  useEffect(() => {
    setActiveCustomerIndex(0);
  }, [customerPhone, matchedCustomers.length]);

  useEffect(() => {
    setActiveProductIndex(0);
  }, [productSearch, filteredProducts.length]);

  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerPhone(customer.phone);
    setActiveCustomerIndex(0);
    window.setTimeout(() => productInputRef.current?.focus(), 0);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setCustomerPhone("");
    window.setTimeout(() => customerInputRef.current?.focus(), 0);
  };

  const openAddCustomer = () => {
    const phone = customerPhone.trim();

    if (phone.length < 10) {
      toast.error("Valid phone number enter pannu");
      return;
    }

    setNewCustomer({ name: "", phone, address: "" });
    setShowAddCustomer(true);
  };

  const closeAddCustomer = () => {
    if (isSavingCustomer) return;

    setShowAddCustomer(false);
    setNewCustomer({ name: "", phone: "", address: "" });
  };

  const handleNewCustomerChange = (event) => {
    const { name, value } = event.target;

    setNewCustomer((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const saveNewCustomer = async (event) => {
    event.preventDefault();

    if (!newCustomer.name.trim()) {
      toast.error("Customer name enter pannu");
      return;
    }

    if (newCustomer.phone.trim().length < 10) {
      toast.error("Valid phone number enter pannu");
      return;
    }

    try {
      setIsSavingCustomer(true);

      const response = await api.post(
        "/customers",
        {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim(),
          address: newCustomer.address.trim(),
        },
      );

      const createdCustomer = response.data;

      setCustomers((previousCustomers) => [
        createdCustomer,
        ...previousCustomers,
      ]);
      setSelectedCustomer(createdCustomer);
      setCustomerPhone(createdCustomer.phone);
      toast.success("Customer added successfully");
      closeAddCustomer();
      window.setTimeout(() => productInputRef.current?.focus(), 0);
    } catch (error) {
      console.error("Add customer error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const responseMessage = error.response?.data?.message;
      toast.error(
        Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage || "Customer add panna mudiyala",
      );
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const addProductToBill = (product) => {
    setBillItems((previousItems) => {
      const existingItem = previousItems.find(
        (item) => item.productId === product._id,
      );

      if (existingItem) {
        if (existingItem.quantity >= Number(product.stock)) {
          toast.error("Available stock-ku mela add panna mudiyathu");
          return previousItems;
        }

        return previousItems.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...previousItems,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku || "",
          price: Number(product.price),
          stock: Number(product.stock),
          gstRate: Number(product.gstRate) || 0,
          quantity: 1,
        },
      ];
    });

    setProductSearch("");
    setActiveProductIndex(0);
    window.setTimeout(() => productInputRef.current?.focus(), 0);
  };

  const updateQuantity = (productId, quantity) => {
    setBillItems((previousItems) =>
      previousItems.map((item) => {
        if (item.productId !== productId) return item;

        const nextQuantity = Number(quantity);

        if (Number.isNaN(nextQuantity) || nextQuantity < 1) {
          return item;
        }

        if (nextQuantity > item.stock) {
          toast.error("Available stock-ku mela quantity poda mudiyathu");
          return item;
        }

        return { ...item, quantity: nextQuantity };
      }),
    );
  };

  const removeBillItem = (productId) => {
    setBillItems((previousItems) =>
      previousItems.filter((item) => item.productId !== productId),
    );
  };

  const clearBill = () => {
    if (billItems.length === 0) return;

    const confirmed = window.confirm(
      "Current bill-la irukura ella products-um clear pannalama?",
    );

    if (!confirmed) return;

    setBillItems([]);
    setProductSearch("");
    setGeneratedInvoice(null);
    productInputRef.current?.focus();
  };

  const subtotal = useMemo(
    () =>
      billItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [billItems],
  );

  const totalGst = useMemo(
    () =>
      billItems.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        return total + (itemTotal * item.gstRate) / 100;
      }, 0),
    [billItems],
  );

  const grandTotal = subtotal + totalGst;
  const totalQuantity = billItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const getInvoicePdfBlob = async (invoiceId) => {
    const response = await api.get(
      `/invoices/${invoiceId}/pdf`,
      {
        responseType: "blob",
      },
    );

    return new Blob([response.data], {
      type: "application/pdf",
    });
  };

  const printInvoice = useCallback(
    async (invoiceToPrint) => {
      if (!invoiceToPrint?._id) {
        toast.error("Generate bill first");
        return;
      }

      try {
        setIsPrinting(true);
        const pdfBlob = await getInvoicePdfBlob(invoiceToPrint._id);
        const printUrl = window.URL.createObjectURL(pdfBlob);
        const frame = printFrameRef.current;

        if (!frame) {
          throw new Error("Print frame unavailable");
        }

        frame.onload = () => {
          window.setTimeout(() => {
            try {
              frame.contentWindow?.focus();
              frame.contentWindow?.print();
            } finally {
              window.setTimeout(() => {
                window.URL.revokeObjectURL(printUrl);
              }, 2000);
            }
          }, 250);
        };

        frame.src = printUrl;
      } catch (error) {
        console.error("Invoice print error:", error);

        if (error.response?.status === 401) {
          handleUnauthorized();
          return;
        }

        toast.error(
          error.response?.data?.message ||
            "Invoice print panna mudiyala",
        );
      } finally {
        window.setTimeout(() => setIsPrinting(false), 500);
      }
    },
    [handleUnauthorized],
  );

  const handleDownloadInvoice = async () => {
    if (!generatedInvoice?._id) {
      toast.error("Generate bill first");
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const pdfBlob = await getInvoicePdfBlob(generatedInvoice._id);
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");

      downloadLink.href = downloadUrl;
      downloadLink.download = `${
        generatedInvoice.invoiceNumber || "invoice"
      }.pdf`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("Invoice PDF download error:", error);

      if (error.response?.status === 401) {
        handleUnauthorized();
        return;
      }

      const responseMessage = error.response?.data?.message;
      toast.error(
        Array.isArray(responseMessage)
          ? responseMessage.join(", ")
          : responseMessage || "Invoice PDF download panna mudiyala",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleGenerateBill = useCallback(
    async ({ autoPrint = false } = {}) => {
      if (isGeneratingBill) return;

      if (!selectedCustomer) {
        toast.error("Customer select illa add pannu");
        customerInputRef.current?.focus();
        return;
      }

      if (billItems.length === 0) {
        toast.error("Minimum one product add pannu");
        productInputRef.current?.focus();
        return;
      }

      const invoicePayload = {
        customerId: selectedCustomer._id,
        items: billItems.map((item) => ({
          productId: item.productId,
          productName: item.name,
          sku: item.sku || "",
          price: Number(item.price),
          quantity: Number(item.quantity),
          gstRate: Number(item.gstRate) || 0,
        })),
        discount: 0,
        paymentMethod,
        paidAmount:
          paymentMethod === "credit" ? 0 : Number(grandTotal),
      };

      try {
        setIsGeneratingBill(true);

        const response = await api.post(
          "/invoices",
          invoicePayload,
        );

        const createdInvoice = response.data?.invoice;

        if (!createdInvoice?._id) {
          throw new Error("Generated invoice details are missing");
        }

        setGeneratedInvoice(createdInvoice);
        toast.success(
          `${createdInvoice.invoiceNumber || "Invoice"} generated successfully`,
        );

        if (autoPrint) {
          await printInvoice(createdInvoice);
        }

        setBillItems([]);
        setProductSearch("");
        setSelectedCustomer(null);
        setCustomerPhone("");
        setPaymentMethod("cash");
        await fetchBillingData();

        window.setTimeout(() => customerInputRef.current?.focus(), 100);
      } catch (error) {
        console.error("Generate invoice error:", error);

        if (error.response?.status === 401) {
          handleUnauthorized();
          return;
        }

        const responseMessage = error.response?.data?.message;
        toast.error(
          Array.isArray(responseMessage)
            ? responseMessage.join(", ")
            : responseMessage || "Invoice generate panna mudiyala",
        );
      } finally {
        setIsGeneratingBill(false);
        setEnterArmed(false);
        lastEnterAtRef.current = 0;
      }
    },
    [
      billItems,
      fetchBillingData,
      grandTotal,
      handleUnauthorized,
      isGeneratingBill,
      paymentMethod,
      printInvoice,
      selectedCustomer,
    ],
  );

  const handleCustomerSearchKeyDown = (event) => {
    if (matchedCustomers.length === 0) {
      if (event.key === "Enter" && customerPhone.trim().length >= 10) {
        event.preventDefault();
        event.stopPropagation();
        openAddCustomer();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setActiveCustomerIndex((current) =>
        current >= matchedCustomers.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setActiveCustomerIndex((current) =>
        current <= 0 ? matchedCustomers.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      selectCustomer(matchedCustomers[activeCustomerIndex]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setCustomerPhone("");
    }
  };

  const handleProductSearchKeyDown = (event) => {
    if (filteredProducts.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setActiveProductIndex((current) =>
        current >= filteredProducts.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setActiveProductIndex((current) =>
        current <= 0 ? filteredProducts.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      addProductToBill(filteredProducts[activeProductIndex]);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setProductSearch("");
    }
  };

  const handleBillingKeyDown = (event) => {
    if (showAddCustomer) return;

    if (event.key === "F2") {
      event.preventDefault();
      selectedCustomer
        ? productInputRef.current?.focus()
        : customerInputRef.current?.focus();
      return;
    }

    if (event.key === "F4") {
      event.preventDefault();
      productInputRef.current?.focus();
      return;
    }

    if (event.key === "F6") {
      event.preventDefault();
      paymentSelectRef.current?.focus();
      return;
    }

    if (event.key === "Escape") {
      setEnterArmed(false);
      lastEnterAtRef.current = 0;
      return;
    }

    if (event.key !== "Enter" || event.repeat) return;

    const target = event.target;
    const tagName = target?.tagName?.toLowerCase();
    const isTextArea = tagName === "textarea";
    const isButton = tagName === "button";
    const hasOpenSearch =
      matchedCustomers.length > 0 || filteredProducts.length > 0;

    if (isTextArea || isButton || hasOpenSearch) return;

    const now = Date.now();
    const isDoubleEnter = now - lastEnterAtRef.current <= DOUBLE_ENTER_DELAY;

    event.preventDefault();

    if (isDoubleEnter) {
      if (enterTimerRef.current) {
        window.clearTimeout(enterTimerRef.current);
      }
      setEnterArmed(false);
      lastEnterAtRef.current = 0;
      handleGenerateBill({ autoPrint: true });
      return;
    }

    lastEnterAtRef.current = now;
    setEnterArmed(true);

    if (enterTimerRef.current) {
      window.clearTimeout(enterTimerRef.current);
    }

    enterTimerRef.current = window.setTimeout(() => {
      setEnterArmed(false);
      lastEnterAtRef.current = 0;
    }, DOUBLE_ENTER_DELAY);
  };

  if (isLoading) {
    return (
      <div className="billing-page">
        <div className="billing-loading">
          <span className="billing-loader" />
          Billing workspace loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="billing-page"
        onKeyDown={handleBillingKeyDown}
      >
        <header className="billing-command-header">
          <div>
            <div className="billing-eyebrow">Point of Sale</div>
            <h1>New Invoice</h1>
            <p>Fast keyboard-first billing workspace</p>
          </div>

          <div className="billing-shortcut-bar">
            <span><kbd>F2</kbd> Customer</span>
            <span><kbd>F4</kbd> Product</span>
            <span><kbd>F6</kbd> Payment</span>
            <span className={enterArmed ? "is-armed" : ""}>
              <kbd>Enter ×2</kbd> Generate & Print
            </span>
          </div>
        </header>

        <main className="billing-pos-layout">
          <section className="billing-workspace">
            <div className="billing-workspace-toolbar">
              <div className="billing-workspace-title">
                <FiShoppingCart />
                <div>
                  <strong>Current Bill</strong>
                  <span>
                    {billItems.length} products · {totalQuantity} units
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="billing-clear-btn"
                onClick={clearBill}
                disabled={billItems.length === 0}
              >
                <FiTrash2 /> Clear Bill
              </button>
            </div>

            <div className="billing-search-zone">
              <div className="billing-search-block">
                <div className="billing-search-label-row">
                  <label htmlFor="customer-search">Customer</label>
                  <span>Search name or phone</span>
                </div>

                {!selectedCustomer ? (
                  <div className="billing-combobox">
                    <FiUser className="billing-combobox-icon" />
                    <input
                      ref={customerInputRef}
                      id="customer-search"
                      type="text"
                      placeholder="Customer name / phone"
                      value={customerPhone}
                      autoComplete="off"
                      onChange={(event) =>
                        setCustomerPhone(event.target.value)
                      }
                      onKeyDown={handleCustomerSearchKeyDown}
                      aria-expanded={matchedCustomers.length > 0}
                    />
                    <FiChevronDown className="billing-combobox-chevron" />

                    {matchedCustomers.length > 0 && (
                      <div className="billing-combobox-menu">
                        {matchedCustomers.map((customer, index) => (
                          <button
                            key={customer._id}
                            type="button"
                            className={
                              activeCustomerIndex === index ? "active" : ""
                            }
                            onMouseEnter={() => setActiveCustomerIndex(index)}
                            onClick={() => selectCustomer(customer)}
                          >
                            <span className="billing-result-primary">
                              <strong>{customer.name}</strong>
                              <small>{customer.phone}</small>
                            </span>
                            <span className="billing-result-secondary">
                              {customer.address || "No address"}
                            </span>
                          </button>
                        ))}
                        <div className="billing-menu-hint">
                          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                          <span><kbd>Enter</kbd> Select</span>
                        </div>
                      </div>
                    )}

                    {customerPhone.trim().length >= 3 &&
                      matchedCustomers.length === 0 && (
                        <div className="billing-combobox-empty">
                          <span>Customer not found</span>
                          <button type="button" onClick={openAddCustomer}>
                            <FiUserPlus /> Add New Customer
                          </button>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="billing-selected-party">
                    <div className="billing-avatar">
                      {selectedCustomer.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <strong>{selectedCustomer.name}</strong>
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedCustomer}
                      aria-label="Remove selected customer"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>

              <div className="billing-search-block billing-product-search-block">
                <div className="billing-search-label-row">
                  <label htmlFor="product-search">Product</label>
                  <span>Name or SKU · Arrow + Enter</span>
                </div>

                <div className="billing-combobox">
                  <FiSearch className="billing-combobox-icon" />
                  <input
                    ref={productInputRef}
                    id="product-search"
                    type="text"
                    placeholder="Scan barcode or search product"
                    value={productSearch}
                    autoComplete="off"
                    onChange={(event) => setProductSearch(event.target.value)}
                    onKeyDown={handleProductSearchKeyDown}
                    aria-expanded={filteredProducts.length > 0}
                  />
                  <FiCommand className="billing-combobox-chevron" />

                  {filteredProducts.length > 0 && (
                    <div className="billing-combobox-menu billing-product-menu">
                      {filteredProducts.map((product, index) => (
                        <button
                          key={product._id}
                          type="button"
                          className={
                            activeProductIndex === index ? "active" : ""
                          }
                          onMouseEnter={() => setActiveProductIndex(index)}
                          onClick={() => addProductToBill(product)}
                        >
                          <span className="billing-result-primary">
                            <strong>{product.name}</strong>
                            <small>{product.sku || "No SKU"}</small>
                          </span>
                          <span className="billing-result-price">
                            <strong>{formatPrice(product.price)}</strong>
                            <small>Stock {product.stock}</small>
                          </span>
                        </button>
                      ))}
                      <div className="billing-menu-hint">
                        <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                        <span><kbd>Enter</kbd> Add Product</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="billing-items-panel">
              {billItems.length === 0 ? (
                <div className="billing-empty-state">
                  <div className="billing-empty-icon">
                    <FiShoppingCart />
                  </div>
                  <h3>Bill is empty</h3>
                  <p>Search a product and press Enter to add it.</p>
                  <button
                    type="button"
                    onClick={() => productInputRef.current?.focus()}
                  >
                    <FiSearch /> Start Product Search
                  </button>
                </div>
              ) : (
                <div className="billing-table-scroll">
                  <table className="billing-pos-table">
                    <thead>
                      <tr>
                        <th className="billing-col-index">#</th>
                        <th>Item</th>
                        <th>Rate</th>
                        <th>Qty</th>
                        <th>GST</th>
                        <th className="billing-text-right">Amount</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item, index) => {
                        const itemSubtotal = item.price * item.quantity;
                        const itemGst =
                          (itemSubtotal * item.gstRate) / 100;
                        const itemTotal = itemSubtotal + itemGst;

                        return (
                          <tr key={item.productId}>
                            <td className="billing-row-number">{index + 1}</td>
                            <td>
                              <div className="billing-item-info">
                                <strong>{item.name}</strong>
                                <span>{item.sku || "No SKU"}</span>
                              </div>
                            </td>
                            <td>{formatPrice(item.price)}</td>
                            <td>
                              <div className="billing-qty-stepper">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <FiMinus />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.stock}
                                  value={item.quantity}
                                  onChange={(event) =>
                                    updateQuantity(
                                      item.productId,
                                      event.target.value,
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity + 1,
                                    )
                                  }
                                  disabled={item.quantity >= item.stock}
                                >
                                  <FiPlus />
                                </button>
                              </div>
                            </td>
                            <td>{item.gstRate}%</td>
                            <td className="billing-text-right billing-amount-cell">
                              {formatPrice(itemTotal)}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="billing-row-delete"
                                onClick={() => removeBillItem(item.productId)}
                                aria-label={`Remove ${item.name}`}
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="billing-checkout-panel">
            <div className="billing-checkout-head">
              <span>Checkout</span>
              <strong>{totalQuantity} units</strong>
            </div>

            <div className="billing-payment-section">
              <label htmlFor="payment-method">Payment Method</label>
              <select
                ref={paymentSelectRef}
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            <div className="billing-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div>
                <span>Total GST</span>
                <strong>{formatPrice(totalGst)}</strong>
              </div>
              <div className="billing-total-divider" />
              <div className="billing-grand-total">
                <span>Grand Total</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>
            </div>

            <div className="billing-primary-actions">
              <button
                type="button"
                className={`billing-print-generate-btn ${
                  enterArmed ? "is-armed" : ""
                }`}
                onClick={() => handleGenerateBill({ autoPrint: true })}
                disabled={isGeneratingBill || isPrinting}
              >
                <FiPrinter />
                <span>
                  <strong>
                    {isGeneratingBill
                      ? "Generating..."
                      : isPrinting
                        ? "Opening Print..."
                        : "Generate & Print"}
                  </strong>
                  <small>Double tap Enter</small>
                </span>
              </button>

              <button
                type="button"
                className="billing-generate-only-btn"
                onClick={() => handleGenerateBill({ autoPrint: false })}
                disabled={isGeneratingBill}
              >
                Generate Only
              </button>
            </div>

            <div className="billing-secondary-actions">
              <button
                type="button"
                onClick={() => printInvoice(generatedInvoice)}
                disabled={!generatedInvoice || isPrinting}
              >
                <FiPrinter /> Reprint
              </button>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={!generatedInvoice || isDownloadingPdf}
              >
                <FiDownload />
                {isDownloadingPdf ? "Downloading" : "PDF"}
              </button>
            </div>

            {generatedInvoice && (
              <div className="billing-last-invoice">
                <span>Last generated</span>
                <strong>{generatedInvoice.invoiceNumber}</strong>
              </div>
            )}
          </aside>
        </main>

        <iframe
          ref={printFrameRef}
          title="Invoice print frame"
          className="billing-print-frame"
        />
      </div>

      {showAddCustomer && (
        <div
          className="billing-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAddCustomer();
            }
          }}
        >
          <div className="billing-customer-modal">
            <div className="billing-modal-header">
              <div>
                <span>New Contact</span>
                <h2>Add Customer</h2>
                <p>Create customer without leaving billing.</p>
              </div>
              <button
                type="button"
                onClick={closeAddCustomer}
                disabled={isSavingCustomer}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={saveNewCustomer}>
              <div className="billing-form-group">
                <label htmlFor="new-customer-name">Customer Name</label>
                <input
                  id="new-customer-name"
                  type="text"
                  name="name"
                  value={newCustomer.name}
                  onChange={handleNewCustomerChange}
                  placeholder="Enter customer name"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="billing-form-group">
                <label htmlFor="new-customer-phone">Phone Number</label>
                <input
                  id="new-customer-phone"
                  type="tel"
                  name="phone"
                  value={newCustomer.phone}
                  onChange={(event) =>
                    setNewCustomer((previousData) => ({
                      ...previousData,
                      phone: event.target.value.replace(/\D/g, ""),
                    }))
                  }
                  maxLength={15}
                />
              </div>

              <div className="billing-form-group">
                <label htmlFor="new-customer-address">
                  Address <small>Optional</small>
                </label>
                <textarea
                  id="new-customer-address"
                  name="address"
                  value={newCustomer.address}
                  onChange={handleNewCustomerChange}
                  placeholder="Enter address"
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="billing-modal-actions">
                <button
                  type="button"
                  onClick={closeAddCustomer}
                  disabled={isSavingCustomer}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSavingCustomer}>
                  {isSavingCustomer ? "Adding..." : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Billing;