import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiCreditCard,
  FiEdit2,
  FiLock,
  FiMapPin,
  FiShield,
  FiUser,
  FiZap,
} from "react-icons/fi";

import api from "../services/axios";

import "../styles/payment.css";

const Payment = () => {
  const navigate = useNavigate();

  const isVerificationRunningRef =
    useRef(false);

  const [isPaying, setIsPaying] =
    useState(false);

  const registrationData = useMemo(() => {
    const savedData =
      sessionStorage.getItem(
        "billFlowCompanyRegistration"
      );

    if (!savedData) {
      return null;
    }

    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error(
        "Company registration data parse error:",
        error
      );

      return null;
    }
  }, []);

  const selectedPlan = useMemo(() => {
    const savedPlan =
      sessionStorage.getItem(
        "billFlowSelectedPlan"
      );

    if (!savedPlan) {
      return null;
    }

    try {
      return JSON.parse(savedPlan);
    } catch (error) {
      console.error(
        "Selected plan data parse error:",
        error
      );

      return null;
    }
  }, []);

  useEffect(() => {
    if (!registrationData) {
      navigate("/create-company", {
        replace: true,
      });

      return;
    }

    if (!selectedPlan) {
      navigate("/choose-plan", {
        replace: true,
      });
    }
  }, [
    navigate,
    registrationData,
    selectedPlan,
  ]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const getErrorMessage = (
    error,
    fallbackMessage
  ) => {
    const backendMessage =
      error?.response?.data?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join("\n");
    }

    if (
      typeof backendMessage === "string" &&
      backendMessage.trim()
    ) {
      return backendMessage;
    }

    const backendError =
      error?.response?.data?.error;

    if (
      typeof backendError === "string" &&
      backendError.trim()
    ) {
      return backendError;
    }

    if (
      typeof error?.message === "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    return fallbackMessage;
  };

  if (
    !registrationData ||
    !selectedPlan
  ) {
    return null;
  }

  const planPrice = Number(
    selectedPlan.price || 0
  );

  const gstAmount = Math.round(
    planPrice * 0.18
  );

  const totalAmount =
    planPrice + gstAmount;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatBusinessType = (
    value
  ) => {
    if (!value) {
      return "Not available";
    }

    return String(value)
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const handlePayment = async () => {
    if (
      isPaying ||
      isVerificationRunningRef.current
    ) {
      return;
    }

    try {
      setIsPaying(true);

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Razorpay checkout load aagala. Internet connection check pannu."
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay checkout initialize aagala. Page refresh panni try pannu."
        );
      }

      const response = await api.post(
        "/payments/create-order",
        {
          amount: totalAmount,
          planName: selectedPlan.name,
        }
      );

      const orderData =
        response.data || {};

      if (
        !orderData.orderId ||
        !orderData.keyId ||
        !orderData.amount
      ) {
        throw new Error(
          "Payment order response incomplete-ah irukku."
        );
      }

      const options = {
        key: orderData.keyId,

        amount: orderData.amount,

        currency:
          orderData.currency || "INR",

        name: "BillFlow",

        description:
          `${selectedPlan.name} Subscription`,

        order_id: orderData.orderId,

        handler: async function (
          paymentResponse
        ) {
          if (
            isVerificationRunningRef.current
          ) {
            return;
          }

          isVerificationRunningRef.current =
            true;

          try {
            const verifyPayload = {
              razorpayOrderId:
                paymentResponse.razorpay_order_id,

              razorpayPaymentId:
                paymentResponse.razorpay_payment_id,

              razorpaySignature:
                paymentResponse.razorpay_signature,

              companyName:
                registrationData.companyName,

              ownerName:
                registrationData.ownerName,

              email:
                registrationData.email,

              phone:
                registrationData.phone,

              address:
                registrationData.address,

              password:
                registrationData.password,

              planName:
                selectedPlan.name,

              planAmount:
                totalAmount,
            };

            console.log(
              "Payment verification starting:",
              {
                razorpayOrderId:
                  verifyPayload.razorpayOrderId,

                razorpayPaymentId:
                  verifyPayload.razorpayPaymentId,

                companyName:
                  verifyPayload.companyName,

                planName:
                  verifyPayload.planName,

                planAmount:
                  verifyPayload.planAmount,
              }
            );

            const verifyResponse =
              await api.post(
                "/payments/verify-payment",
                verifyPayload
              );

            const verificationData =
              verifyResponse.data || {};

            console.log(
              "Payment verification success:",
              verificationData
            );

            const accessToken =
              verificationData.accessToken ||
              verificationData.access_token ||
              verificationData.token;

            const ownerData =
              verificationData.owner ||
              verificationData.user ||
              null;

            const companyData =
              verificationData.company ||
              null;

            if (accessToken) {
              localStorage.setItem(
                "billFlowAccessToken",
                accessToken
              );
            }

            if (ownerData) {
              localStorage.setItem(
                "billFlowUser",
                JSON.stringify(
                  ownerData
                )
              );
            }

            if (companyData) {
              localStorage.setItem(
                "billFlowCompany",
                JSON.stringify(
                  companyData
                )
              );
            }

            sessionStorage.removeItem(
              "billFlowCompanyRegistration"
            );

            sessionStorage.removeItem(
              "billFlowSelectedPlan"
            );

            alert(
              verificationData.message ||
                "Payment verified. BillFlow account successfully created."
            );

            navigate("/login", {
              replace: true,
            });
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            console.error(
              "Payment verification response:",
              JSON.stringify(
                error?.response?.data,
                null,
                2
              )
            );

            console.error(
              "Payment verification status:",
              error?.response?.status
            );

            const errorStatus =
              error?.response?.status;

            const backendMessage =
              error?.response?.data
                ?.message;

            const normalizedMessage =
              Array.isArray(
                backendMessage
              )
                ? backendMessage.join(
                    "\n"
                  )
                : backendMessage;

            const accountAlreadyCreated =
              errorStatus === 409 &&
              typeof normalizedMessage ===
                "string" &&
              [
                "already exists",
                "already registered",
                "already processed",
                "already verified",
              ].some((text) =>
                normalizedMessage
                  .toLowerCase()
                  .includes(text)
              );

            if (
              accountAlreadyCreated
            ) {
              sessionStorage.removeItem(
                "billFlowCompanyRegistration"
              );

              sessionStorage.removeItem(
                "billFlowSelectedPlan"
              );

              alert(
                "Company account already created successfully. Please login."
              );

              navigate("/login", {
                replace: true,
              });

              return;
            }

            const message =
              getErrorMessage(
                error,
                "Payment successful, aana account verification fail aagiduchu."
              );

            alert(message);

            setIsPaying(false);
          } finally {
            isVerificationRunningRef.current =
              false;
          }
        },

        prefill: {
          name:
            registrationData.ownerName,

          email:
            registrationData.email,

          contact:
            registrationData.phone,
        },

        notes: {
          companyName:
            registrationData.companyName,

          planName:
            selectedPlan.name,
        },

        theme: {
          color: "#18181b",
        },

        modal: {
          ondismiss: function () {
            if (
              !isVerificationRunningRef.current
            ) {
              setIsPaying(false);
            }
          },
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (failureResponse) {
          console.error(
            "Razorpay payment failed:",
            failureResponse?.error
          );

          const failureMessage =
            failureResponse?.error
              ?.description ||
            failureResponse?.error
              ?.reason ||
            "Payment failed. Try again.";

          alert(failureMessage);

          isVerificationRunningRef.current =
            false;

          setIsPaying(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment start error:",
        error
      );

      console.error(
        "Payment start response:",
        JSON.stringify(
          error?.response?.data,
          null,
          2
        )
      );

      const message =
        getErrorMessage(
          error,
          "Payment start panna mudiyala. Try again."
        );

      alert(message);

      isVerificationRunningRef.current =
        false;

      setIsPaying(false);
    }
  };

  return (
    <main className="payment-page">
      <header className="payment-topbar">
        <button
          type="button"
          className="payment-brand"
          onClick={() =>
            navigate("/")
          }
        >
          <span className="payment-brand-logo">
            <FiZap />
          </span>

          <span className="payment-brand-text">
            <strong>
              Bill<span>Flow</span>
            </strong>

            <small>
              Business Setup
            </small>
          </span>
        </button>

        <button
          type="button"
          className="payment-topbar-back"
          onClick={() =>
            navigate(
              "/choose-plan"
            )
          }
          disabled={isPaying}
        >
          <FiArrowLeft />

          <span>
            Choose Plan
          </span>
        </button>
      </header>

      <section className="payment-container">
        <div className="registration-stepper">
          <div className="registration-step completed">
            <span>
              <FiCheck />
            </span>

            <p>
              Company Details
            </p>
          </div>

          <div className="registration-step-line completed" />

          <div className="registration-step completed">
            <span>
              <FiCheck />
            </span>

            <p>
              Choose Plan
            </p>
          </div>

          <div className="registration-step-line completed" />

          <div className="registration-step active">
            <span>3</span>

            <p>
              Payment
            </p>
          </div>
        </div>

        <div className="payment-header">
          <span className="payment-step-badge">
            Step 3 of 3
          </span>

          <h1>
            Complete your
            <span> subscription.</span>
          </h1>

          <p>
            Review your company and plan details before
            completing the secure payment.
          </p>
        </div>

        <div className="payment-layout">
          <section className="payment-details-card">
            <div className="payment-card-heading">
              <div>
                <span className="payment-small-label">
                  Business Details
                </span>

                <h2>
                  {
                    registrationData.companyName
                  }
                </h2>

                <p>
                  Review your company information before
                  continuing.
                </p>
              </div>

              <button
                type="button"
                className="payment-edit-button"
                onClick={() =>
                  navigate(
                    "/create-company"
                  )
                }
                disabled={isPaying}
              >
                <FiEdit2 />
                Edit
              </button>
            </div>

            <div className="payment-details-grid">
              <div className="payment-detail-item">
                <span className="payment-detail-icon">
                  <FiUser />
                </span>

                <div>
                  <span>
                    Owner Name
                  </span>

                  <strong>
                    {
                      registrationData.ownerName
                    }
                  </strong>
                </div>
              </div>

              <div className="payment-detail-item">
                <span className="payment-detail-icon">
                  <FiCreditCard />
                </span>

                <div>
                  <span>
                    Email Address
                  </span>

                  <strong>
                    {
                      registrationData.email
                    }
                  </strong>
                </div>
              </div>

              <div className="payment-detail-item">
                <span className="payment-detail-icon">
                  <FiUser />
                </span>

                <div>
                  <span>
                    Phone Number
                  </span>

                  <strong>
                    {
                      registrationData.phone
                    }
                  </strong>
                </div>
              </div>

              <div className="payment-detail-item">
                <span className="payment-detail-icon">
                  <FiZap />
                </span>

                <div>
                  <span>
                    Business Type
                  </span>

                  <strong>
                    {formatBusinessType(
                      registrationData.businessType
                    )}
                  </strong>
                </div>
              </div>

              <div className="payment-detail-item payment-detail-full">
                <span className="payment-detail-icon">
                  <FiMapPin />
                </span>

                <div>
                  <span>
                    Business Address
                  </span>

                  <strong>
                    {
                      registrationData.address
                    }
                  </strong>
                </div>
              </div>

              {registrationData.gstNumber && (
                <div className="payment-detail-item">
                  <span className="payment-detail-icon">
                    <FiShield />
                  </span>

                  <div>
                    <span>
                      GST Number
                    </span>

                    <strong>
                      {
                        registrationData.gstNumber
                      }
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="secure-payment-box">
              <div className="secure-payment-icon">
                <FiShield />
              </div>

              <div>
                <span>
                  Secure Checkout
                </span>

                <h3>
                  Razorpay protected payment
                </h3>

                <p>
                  Pay using UPI, cards, net banking or
                  supported payment methods through Razorpay.
                </p>
              </div>
            </div>
          </section>

          <aside className="payment-summary-card">
            <div className="payment-summary-heading">
              <div>
                <span>
                  Order Summary
                </span>

                <small>
                  Selected subscription
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/choose-plan"
                  )
                }
                disabled={isPaying}
              >
                Change
              </button>
            </div>

            <div className="selected-plan-summary">
              <div>
                <span className="selected-plan-label">
                  BillFlow Plan
                </span>

                <h2>
                  {selectedPlan.name}
                </h2>

                <p>
                  {selectedPlan.description ||
                    "BillFlow subscription plan."}
                </p>
              </div>

              {selectedPlan.popular && (
                <span className="summary-popular-badge">
                  Popular
                </span>
              )}
            </div>

            <div className="payment-price-details">
              <div>
                <span>
                  Plan Price
                </span>

                <strong>
                  {formatCurrency(
                    planPrice
                  )}
                </strong>
              </div>

              <div>
                <span>
                  GST
                  <small>18%</small>
                </span>

                <strong>
                  {formatCurrency(
                    gstAmount
                  )}
                </strong>
              </div>
            </div>

            <div className="payment-total-row">
              <div>
                <span>
                  Total Amount
                </span>

                <small>
                  Inclusive of GST
                </small>
              </div>

              <strong>
                {formatCurrency(
                  totalAmount
                )}
              </strong>
            </div>

            <button
              type="button"
              className="pay-now-button"
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <span className="payment-button-loader" />
                  Processing Payment
                </>
              ) : (
                <>
                  <FiLock />
                  Pay{" "}
                  {formatCurrency(
                    totalAmount
                  )}
                </>
              )}
            </button>

            <div className="payment-provider-note">
              <FiCheckCircle />

              <span>
                Secured by Razorpay
              </span>
            </div>

            <button
              type="button"
              className="payment-back-button"
              onClick={() =>
                navigate(
                  "/choose-plan"
                )
              }
              disabled={isPaying}
            >
              <FiArrowLeft />

              Back to Plans
            </button>

            <p className="payment-terms-text">
              By continuing, you agree to the BillFlow
              subscription and payment terms.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Payment;