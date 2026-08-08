import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axios";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCommand,
  FiCreditCard,
  FiDownload,
  FiMinus,
  FiPauseCircle,
  FiPlayCircle,
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
const HOLD_BILL_STORAGE_KEY = "billFlowHeldBillingDraft";

const PAYMENT_MODES = {
  PAY_NOW: "pay_now",
  PARTIAL: "partial",
  PAY_LATER: "pay_later",
};

const Billing = () => {
  const navigate = useNavigate();

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

  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES.PAY_NOW);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");

  const [hasHeldBill, setHasHeldBill] = useState(false);
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
  const paymentSectionRef = useRef(null);
  const printFrameRef = useRef(null);
  const lastEnterAtRef = useRef(0);
  const enterTimerRef = useRef(null);
  const customerMenuRef = useRef(null);
  const productMenuRef = useRef(null);
  const customerItemRefs = useRef([]);
  const productItemRefs = useRef([]);

  const formatPrice = useCallback(
    (value) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(Number(value) || 0),
    [],
  );

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
        error.response?.data?.message || "Billing data load panna mudiyala",
      );
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  useEffect(() => {
    setHasHeldBill(Boolean(localStorage.getItem(HOLD_BILL_STORAGE_KEY)));

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
        const name = String(product.name || "").toLowerCase();
        const sku = String(product.sku || "").toLowerCase();
        const barcode = String(product.barcode || "").toLowerCase();

        return (
          name.includes(search) ||
          sku.includes(search) ||
          barcode.includes(search)
        );
      })
      .slice(0, 10);
  }, [products, productSearch]);

  useEffect(() => {
    setActiveCustomerIndex(0);
    customerItemRefs.current = [];
  }, [customerPhone, matchedCustomers.length]);

  useEffect(() => {
    setActiveProductIndex(0);
    productItemRefs.current = [];
  }, [productSearch, filteredProducts.length]);

  const keepActiveSearchItemVisible = useCallback((menu, item) => {
    if (!menu || !item) return;

    window.requestAnimationFrame(() => {
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;
      const visibleTop = menu.scrollTop;
      const visibleBottom = menu.scrollTop + menu.clientHeight;

      if (itemTop < visibleTop) {
        menu.scrollTo({ top: itemTop, behavior: "smooth" });
      } else if (itemBottom > visibleBottom) {
        menu.scrollTo({
          top: itemBottom - menu.clientHeight,
          behavior: "smooth",
        });
      }

      const menuRect = menu.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const topSafeArea = 92;
      const bottomSafeArea = 18;

      if (menuRect.bottom > viewportHeight - bottomSafeArea) {
        window.scrollBy({
          top: menuRect.bottom - viewportHeight + bottomSafeArea,
          behavior: "smooth",
        });
      } else if (menuRect.top < topSafeArea) {
        window.scrollBy({
          top: menuRect.top - topSafeArea,
          behavior: "smooth",
        });
      }
    });
  }, []);

  useEffect(() => {
    if (matchedCustomers.length === 0) return;

    keepActiveSearchItemVisible(
      customerMenuRef.current,
      customerItemRefs.current[activeCustomerIndex],
    );
  }, [
    activeCustomerIndex,
    keepActiveSearchItemVisible,
    matchedCustomers.length,
  ]);

  useEffect(() => {
    if (filteredProducts.length === 0) return;

    keepActiveSearchItemVisible(
      productMenuRef.current,
      productItemRefs.current[activeProductIndex],
    );
  }, [
    activeProductIndex,
    filteredProducts.length,
    keepActiveSearchItemVisible,
  ]);

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerPhone(customer.phone || "");
    setActiveCustomerIndex(0);
    window.setTimeout(() => productInputRef.current?.focus(), 0);
  };

  const clearSelectedCustomer = () => {
    if (
      paymentMode === PAYMENT_MODES.PARTIAL ||
      paymentMode === PAYMENT_MODES.PAY_LATER
    ) {
      setPaymentMode(PAYMENT_MODES.PAY_NOW);
      setPaymentMethod("cash");
      setAmountReceived("");
    }

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

      const response = await api.post("/customers", {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        address: newCustomer.address.trim(),
      });

      const createdCustomer = response.data;

      setCustomers((previousCustomers) => [
        createdCustomer,
        ...previousCustomers,
      ]);
      setSelectedCustomer(createdCustomer);
      setCustomerPhone(createdCustomer.phone || "");
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
          barcode: product.barcode || "",
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

  const resetCurrentBill = useCallback(() => {
    setBillItems([]);
    setProductSearch("");
    setSelectedCustomer(null);
    setCustomerPhone("");
    setPaymentMode(PAYMENT_MODES.PAY_NOW);
    setPaymentMethod("cash");
    setAmountReceived("");
  }, []);

  const clearBill = () => {
    if (billItems.length === 0 && !selectedCustomer) return;

    const confirmed = window.confirm(
      "Current bill-la irukura details ellam clear pannalama?",
    );

    if (!confirmed) return;

    resetCurrentBill();
    window.setTimeout(() => customerInputRef.current?.focus(), 0);
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

  const totalQuantity = useMemo(
    () =>
      billItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ),
    [billItems],
  );

  const numericAmountReceived = Number(amountReceived) || 0;

  const paidNow = useMemo(() => {
    if (paymentMode === PAYMENT_MODES.PAY_LATER) return 0;
    if (paymentMode === PAYMENT_MODES.PARTIAL) return numericAmountReceived;
    return grandTotal;
  }, [grandTotal, numericAmountReceived, paymentMode]);

  const amountDue = useMemo(() => {
    if (paymentMode === PAYMENT_MODES.PAY_LATER) return grandTotal;
    if (paymentMode === PAYMENT_MODES.PARTIAL) {
      return Math.max(grandTotal - numericAmountReceived, 0);
    }
    return 0;
  }, [grandTotal, numericAmountReceived, paymentMode]);

  const balanceReturn = useMemo(() => {
    if (
      paymentMode !== PAYMENT_MODES.PAY_NOW ||
      paymentMethod !== "cash"
    ) {
      return 0;
    }

    return Math.max(numericAmountReceived - grandTotal, 0);
  }, [grandTotal, numericAmountReceived, paymentMethod, paymentMode]);

  const getInvoicePdfBlob = async (invoiceId) => {
    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });

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
          error.response?.data?.message || "Invoice print panna mudiyala",
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

  const changePaymentMode = (nextMode) => {
    if (
      (nextMode === PAYMENT_MODES.PARTIAL ||
        nextMode === PAYMENT_MODES.PAY_LATER) &&
      !selectedCustomer
    ) {
      toast.error("Partial / Pay Later-ku customer select pannanum");
      customerInputRef.current?.focus();
      return;
    }

    setPaymentMode(nextMode);
    setAmountReceived("");

    if (nextMode === PAYMENT_MODES.PAY_LATER) {
      setPaymentMethod("credit");
      return;
    }

    if (paymentMethod === "credit") {
      setPaymentMethod("cash");
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);

    if (paymentMode === PAYMENT_MODES.PAY_NOW && method !== "cash") {
      setAmountReceived("");
    }
  };

  const holdBill = useCallback(() => {
    if (billItems.length === 0) {
      toast.error("Hold panna current bill-la products illa");
      return;
    }

    const existingHeldBill = localStorage.getItem(HOLD_BILL_STORAGE_KEY);

    if (existingHeldBill) {
      const confirmed = window.confirm(
        "Already oru held bill iruku. Adha replace pannalama?",
      );

      if (!confirmed) return;
    }

    const heldDraft = {
      selectedCustomer,
      customerPhone,
      billItems,
      paymentMode,
      paymentMethod,
      amountReceived,
      heldAt: new Date().toISOString(),
    };

    localStorage.setItem(HOLD_BILL_STORAGE_KEY, JSON.stringify(heldDraft));
    setHasHeldBill(true);
    resetCurrentBill();
    toast.success("Bill held successfully");
    window.setTimeout(() => customerInputRef.current?.focus(), 0);
  }, [
    amountReceived,
    billItems,
    customerPhone,
    paymentMethod,
    paymentMode,
    resetCurrentBill,
    selectedCustomer,
  ]);

  const resumeBill = useCallback(() => {
    const savedDraft = localStorage.getItem(HOLD_BILL_STORAGE_KEY);

    if (!savedDraft) {
      setHasHeldBill(false);
      toast.error("Held bill available illa");
      return;
    }

    if (billItems.length > 0 || selectedCustomer) {
      const confirmed = window.confirm(
        "Current bill replace aagum. Held bill resume pannalama?",
      );

      if (!confirmed) return;
    }

    try {
      const heldDraft = JSON.parse(savedDraft);

      setSelectedCustomer(heldDraft.selectedCustomer || null);
      setCustomerPhone(heldDraft.customerPhone || "");
      setBillItems(Array.isArray(heldDraft.billItems) ? heldDraft.billItems : []);
      setPaymentMode(heldDraft.paymentMode || PAYMENT_MODES.PAY_NOW);
      setPaymentMethod(heldDraft.paymentMethod || "cash");
      setAmountReceived(String(heldDraft.amountReceived || ""));

      localStorage.removeItem(HOLD_BILL_STORAGE_KEY);
      setHasHeldBill(false);
      toast.success("Held bill resumed");
      window.setTimeout(() => productInputRef.current?.focus(), 0);
    } catch (error) {
      console.error("Resume held bill error:", error);
      localStorage.removeItem(HOLD_BILL_STORAGE_KEY);
      setHasHeldBill(false);
      toast.error("Held bill data invalid. Cleared safely.");
    }
  }, [billItems.length, selectedCustomer]);

  const validatePayment = useCallback(() => {
    if (!selectedCustomer) {
      toast.error("Customer select illa add pannu");
      customerInputRef.current?.focus();
      return false;
    }

    if (billItems.length === 0) {
      toast.error("Minimum one product add pannu");
      productInputRef.current?.focus();
      return false;
    }

    if (paymentMode === PAYMENT_MODES.PARTIAL) {
      if (numericAmountReceived <= 0) {
        toast.error("Partial payment amount 0-ku mela irukanum");
        paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        return false;
      }

      if (numericAmountReceived >= grandTotal) {
        toast.error("Partial amount Grand Total vida kammiya irukanum");
        return false;
      }
    }

    if (
      paymentMode === PAYMENT_MODES.PAY_NOW &&
      paymentMethod === "cash" &&
      amountReceived !== "" &&
      numericAmountReceived < grandTotal
    ) {
      toast.error("Cash Received Grand Total-ku kammiya iruka koodathu");
      return false;
    }

    return true;
  }, [
    amountReceived,
    billItems.length,
    grandTotal,
    numericAmountReceived,
    paymentMethod,
    paymentMode,
    selectedCustomer,
  ]);

  const handleGenerateBill = useCallback(
    async ({ autoPrint = false } = {}) => {
      if (isGeneratingBill) return;
      if (!validatePayment()) return;

      let resolvedPaymentMethod = paymentMethod;
      let resolvedPaidAmount = Number(grandTotal);

      if (paymentMode === PAYMENT_MODES.PAY_LATER) {
        resolvedPaymentMethod = "credit";
        resolvedPaidAmount = 0;
      } else if (paymentMode === PAYMENT_MODES.PARTIAL) {
        resolvedPaidAmount = Number(numericAmountReceived);
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
        paymentMethod: resolvedPaymentMethod,
        paidAmount: resolvedPaidAmount,
      };

      try {
        setIsGeneratingBill(true);

        const response = await api.post("/invoices", invoicePayload);
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

        resetCurrentBill();
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
      numericAmountReceived,
      paymentMethod,
      paymentMode,
      printInvoice,
      resetCurrentBill,
      selectedCustomer,
      validatePayment,
    ],
  );

  const handleCustomerSearchKeyDown = (event) => {
    if (matchedCustomers.length === 0) {
      if (event.key === "Enter" && customerPhone.trim().length >= 10) {
        event.preventDefault();
        event.stopPropagation();
        openAddCustomer();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setCustomerPhone("");
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setActiveCustomerIndex((current) =>
        current >= matchedCustomers.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setActiveCustomerIndex((current) =>
        current <= 0 ? matchedCustomers.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      selectCustomer(matchedCustomers[activeCustomerIndex]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setCustomerPhone("");
    }
  };

  const handleProductSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setProductSearch("");
      return;
    }

    if (filteredProducts.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setActiveProductIndex((current) =>
        current >= filteredProducts.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setActiveProductIndex((current) =>
        current <= 0 ? filteredProducts.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      addProductToBill(filteredProducts[activeProductIndex]);
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
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (event.key === "F8") {
      event.preventDefault();
      holdBill();
      return;
    }

    if (event.key === "F9") {
      event.preventDefault();
      resumeBill();
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
    const inputType = target?.type;
    const isTextArea = tagName === "textarea";
    const isButton = tagName === "button";
    const isSelect = tagName === "select";
    const isNumberInput = tagName === "input" && inputType === "number";
    const hasOpenSearch =
      matchedCustomers.length > 0 || filteredProducts.length > 0;

    if (isTextArea || isButton || isSelect || isNumberInput || hasOpenSearch) {
      return;
    }

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

  const primaryActionLabel = useMemo(() => {
    if (isGeneratingBill) return "Generating...";
    if (isPrinting) return "Opening Print...";

    if (paymentMode === PAYMENT_MODES.PARTIAL) {
      return "Collect Payment & Print";
    }

    if (paymentMode === PAYMENT_MODES.PAY_LATER) {
      return "Create Pay Later Bill";
    }

    return "Complete Sale & Print";
  }, [isGeneratingBill, isPrinting, paymentMode]);

  const generatedPaymentStatus =
    generatedInvoice?.paymentStatus ||
    generatedInvoice?.status ||
    generatedInvoice?.payment?.status ||
    null;

  if (isLoading) {
    return (
      <div className="billing-page billing-page-loading">
        <div className="billing-loading">
          <span className="billing-loader" />
          <div>
            <strong>BillFlow POS</strong>
            <span>Billing workspace loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="billing-page" onKeyDown={handleBillingKeyDown}>
        <header className="billing-pos-header">
          <div className="billing-brand-cluster">
            <div className="billing-brand-mark">BF</div>
            <div className="billing-brand-copy">
              <span>BillFlow POS</span>
              <strong>Billing Counter</strong>
            </div>
          </div>

          <div className="billing-counter-meta">
            <span className="billing-counter-live">
              <i /> Counter Ready
            </span>
            <span>{billItems.length} line items</span>
            <span>{totalQuantity} units</span>
            {hasHeldBill && (
              <span className="billing-held-indicator">
                <FiPauseCircle /> Held bill available
              </span>
            )}
          </div>

          <button
            type="button"
            className="billing-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <FiArrowLeft />
            Back to Dashboard
          </button>
        </header>

        <div className="billing-shortcut-strip">
          <span><kbd>F2</kbd> Customer</span>
          <span><kbd>F4</kbd> Product</span>
          <span><kbd>F6</kbd> Payment</span>
          <span><kbd>F8</kbd> Hold</span>
          <span><kbd>F9</kbd> Resume</span>
          <span className={enterArmed ? "is-armed" : ""}>
            <kbd>Enter ×2</kbd> Generate & Print
          </span>
        </div>

        <main className="billing-pos-layout">
          <section className="billing-workspace">
            <div className="billing-workspace-topline">
              <div>
                <span className="billing-section-kicker">CURRENT SALE</span>
                <h1>New Invoice</h1>
              </div>

              <div className="billing-bill-actions">
                <button
                  type="button"
                  className="billing-hold-btn"
                  onClick={holdBill}
                  disabled={billItems.length === 0}
                >
                  <FiPauseCircle /> Hold Bill
                </button>

                <button
                  type="button"
                  className={`billing-resume-btn ${hasHeldBill ? "has-bill" : ""}`}
                  onClick={resumeBill}
                  disabled={!hasHeldBill}
                >
                  <FiPlayCircle /> Resume
                </button>

                <button
                  type="button"
                  className="billing-clear-btn"
                  onClick={clearBill}
                  disabled={billItems.length === 0 && !selectedCustomer}
                >
                  <FiTrash2 /> Clear
                </button>
              </div>
            </div>

            <div className="billing-search-zone">
              <div className="billing-search-block">
                <div className="billing-search-label-row">
                  <label htmlFor="customer-search">Customer</label>
                  <span>Name / phone</span>
                </div>

                {!selectedCustomer ? (
                  <div className="billing-combobox">
                    <FiUser className="billing-combobox-icon" />
                    <input
                      ref={customerInputRef}
                      id="customer-search"
                      type="text"
                      placeholder="Search customer name or phone"
                      value={customerPhone}
                      autoComplete="off"
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      onKeyDown={handleCustomerSearchKeyDown}
                      aria-expanded={matchedCustomers.length > 0}
                    />
                    <FiChevronDown className="billing-combobox-chevron" />

                    {matchedCustomers.length > 0 && (
                      <div
                        ref={customerMenuRef}
                        className="billing-combobox-menu"
                      >
                        {matchedCustomers.map((customer, index) => (
                          <button
                            ref={(element) => {
                              customerItemRefs.current[index] = element;
                            }}
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
                    <div className="billing-selected-party-copy">
                      <span>Selected Customer</span>
                      <strong>{selectedCustomer.name}</strong>
                      <small>{selectedCustomer.phone}</small>
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
                  <label htmlFor="product-search">Product / Barcode</label>
                  <span>Name · SKU · barcode</span>
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
                    <div
                      ref={productMenuRef}
                      className="billing-combobox-menu billing-product-menu"
                    >
                      {filteredProducts.map((product, index) => (
                        <button
                          ref={(element) => {
                            productItemRefs.current[index] = element;
                          }}
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
                            <small>
                              {product.sku || "No SKU"}
                              {product.barcode ? ` · ${product.barcode}` : ""}
                            </small>
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
              <div className="billing-items-panel-head">
                <div>
                  <FiShoppingCart />
                  <strong>Bill Items</strong>
                </div>
                <span>{billItems.length} products · {totalQuantity} units</span>
              </div>

              {billItems.length === 0 ? (
                <div className="billing-empty-state">
                  <div className="billing-empty-icon">
                    <FiShoppingCart />
                  </div>
                  <h3>Ready for billing</h3>
                  <p>Product search-la item scan/search panni Enter press pannu.</p>
                  <button
                    type="button"
                    onClick={() => productInputRef.current?.focus()}
                  >
                    <FiSearch /> Start Product Search
                  </button>
                </div>
              ) : (
                <>
                  <div className="billing-table-scroll billing-desktop-items">
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
                                  <span>
                                    {item.sku || "No SKU"}
                                    {item.barcode ? ` · ${item.barcode}` : ""}
                                  </span>
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

                  <div className="billing-mobile-items">
                    {billItems.map((item, index) => {
                      const itemSubtotal = item.price * item.quantity;
                      const itemGst = (itemSubtotal * item.gstRate) / 100;
                      const itemTotal = itemSubtotal + itemGst;

                      return (
                        <article
                          className="billing-mobile-item-card"
                          key={item.productId}
                        >
                          <div className="billing-mobile-item-head">
                            <div>
                              <span className="billing-mobile-item-index">
                                Item {index + 1}
                              </span>
                              <strong>{item.name}</strong>
                              <small>
                                {item.sku || "No SKU"}
                                {item.barcode ? ` · ${item.barcode}` : ""}
                              </small>
                            </div>

                            <button
                              type="button"
                              className="billing-mobile-remove-btn"
                              onClick={() => removeBillItem(item.productId)}
                              aria-label={`Remove ${item.name}`}
                            >
                              <FiTrash2 />
                            </button>
                          </div>

                          <div className="billing-mobile-item-details">
                            <div>
                              <span>Rate</span>
                              <strong>{formatPrice(item.price)}</strong>
                            </div>
                            <div>
                              <span>GST</span>
                              <strong>{item.gstRate}%</strong>
                            </div>
                            <div>
                              <span>Amount</span>
                              <strong>{formatPrice(itemTotal)}</strong>
                            </div>
                          </div>

                          <div className="billing-mobile-quantity-row">
                            <span>Quantity</span>
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
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="billing-checkout-panel">
            <div className="billing-checkout-head">
              <div>
                <span>CHECKOUT</span>
                <strong>Payment Summary</strong>
              </div>
              <span className="billing-checkout-count">{totalQuantity} units</span>
            </div>

            <div className="billing-checkout-customer">
              <span>Customer</span>
              {selectedCustomer ? (
                <div>
                  <div className="billing-mini-avatar">
                    {selectedCustomer.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <strong>{selectedCustomer.name}</strong>
                    <small>{selectedCustomer.phone}</small>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => customerInputRef.current?.focus()}
                >
                  <FiUserPlus /> Select customer
                </button>
              )}
            </div>

            <div className="billing-payment-section" ref={paymentSectionRef}>
              <div className="billing-payment-title-row">
                <div>
                  <span>Payment Type</span>
                  <strong>How will this bill be settled?</strong>
                </div>
              </div>

              <div className="billing-payment-mode-grid">
                <button
                  type="button"
                  className={
                    paymentMode === PAYMENT_MODES.PAY_NOW ? "active" : ""
                  }
                  onClick={() => changePaymentMode(PAYMENT_MODES.PAY_NOW)}
                >
                  <FiCheckCircle />
                  <span>
                    <strong>Pay Now</strong>
                    <small>Full payment</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    paymentMode === PAYMENT_MODES.PARTIAL ? "active" : ""
                  }
                  onClick={() => changePaymentMode(PAYMENT_MODES.PARTIAL)}
                >
                  <FiCreditCard />
                  <span>
                    <strong>Partial</strong>
                    <small>Pay some now</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    paymentMode === PAYMENT_MODES.PAY_LATER ? "active" : ""
                  }
                  onClick={() => changePaymentMode(PAYMENT_MODES.PAY_LATER)}
                >
                  <FiClock />
                  <span>
                    <strong>Pay Later</strong>
                    <small>Credit sale</small>
                  </span>
                </button>
              </div>

              {paymentMode !== PAYMENT_MODES.PAY_LATER && (
                <div className="billing-payment-methods">
                  <span>Payment Method</span>
                  <div className="billing-method-grid">
                    {[
                      { value: "cash", label: "Cash" },
                      { value: "upi", label: "UPI" },
                      { value: "card", label: "Card" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        className={
                          paymentMethod === method.value ? "active" : ""
                        }
                        onClick={() =>
                          handlePaymentMethodChange(method.value)
                        }
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMode === PAYMENT_MODES.PAY_NOW &&
                paymentMethod === "cash" && (
                  <div className="billing-money-input-group">
                    <label htmlFor="cash-received">Cash Received</label>
                    <div className="billing-money-input">
                      <span>₹</span>
                      <input
                        id="cash-received"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amountReceived}
                        onChange={(event) =>
                          setAmountReceived(event.target.value)
                        }
                        placeholder={grandTotal.toFixed(2)}
                      />
                    </div>
                  </div>
                )}

              {paymentMode === PAYMENT_MODES.PARTIAL && (
                <div className="billing-money-input-group">
                  <label htmlFor="partial-received">Amount Received</label>
                  <div className="billing-money-input">
                    <span>₹</span>
                    <input
                      id="partial-received"
                      type="number"
                      min="0"
                      max={Math.max(grandTotal - 0.01, 0)}
                      step="0.01"
                      value={amountReceived}
                      onChange={(event) => setAmountReceived(event.target.value)}
                      placeholder="Enter partial amount"
                    />
                  </div>
                  <small>0 vida adhigama, Grand Total vida kammiya irukanum.</small>
                </div>
              )}

              {paymentMode === PAYMENT_MODES.PAY_LATER && (
                <div className="billing-credit-note">
                  <FiClock />
                  <div>
                    <strong>Pay Later / Credit Sale</strong>
                    <span>Paid now ₹0. Full bill amount customer-ku due aagum.</span>
                  </div>
                </div>
              )}
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
              <div>
                <span>Discount</span>
                <strong>{formatPrice(0)}</strong>
              </div>

              <div className="billing-total-divider" />

              <div className="billing-grand-total">
                <span>Grand Total</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>

              {paymentMode === PAYMENT_MODES.PARTIAL && (
                <>
                  <div className="billing-payment-result-row paid">
                    <span>Paying Now</span>
                    <strong>{formatPrice(paidNow)}</strong>
                  </div>
                  <div className="billing-payment-result-row due">
                    <span>Balance Due</span>
                    <strong>{formatPrice(amountDue)}</strong>
                  </div>
                </>
              )}

              {paymentMode === PAYMENT_MODES.PAY_LATER && (
                <div className="billing-payment-result-row due billing-due-highlight">
                  <span>Amount Due</span>
                  <strong>{formatPrice(amountDue)}</strong>
                </div>
              )}

              {paymentMode === PAYMENT_MODES.PAY_NOW &&
                paymentMethod === "cash" && (
                  <div className="billing-payment-result-row return">
                    <span>Balance to Return</span>
                    <strong>{formatPrice(balanceReturn)}</strong>
                  </div>
                )}
            </div>

            <div className="billing-primary-actions">
              <button
                type="button"
                className={`billing-print-generate-btn ${
                  enterArmed ? "is-armed" : ""
                }`}
                onClick={() => handleGenerateBill({ autoPrint: true })}
                disabled={isGeneratingBill || isPrinting || billItems.length === 0}
              >
                <FiPrinter />
                <span>
                  <strong>{primaryActionLabel}</strong>
                  <small>Double Enter shortcut</small>
                </span>
              </button>

              <button
                type="button"
                className="billing-generate-only-btn"
                onClick={() => handleGenerateBill({ autoPrint: false })}
                disabled={isGeneratingBill || billItems.length === 0}
              >
                Generate without Print
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
                <div className="billing-last-invoice-icon">
                  <FiCheckCircle />
                </div>
                <div>
                  <span>Last generated invoice</span>
                  <strong>{generatedInvoice.invoiceNumber}</strong>
                  {generatedPaymentStatus && (
                    <small>{String(generatedPaymentStatus)}</small>
                  )}
                </div>
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
                <span>NEW CONTACT</span>
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
                  maxLength={10}
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