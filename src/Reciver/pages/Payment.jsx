import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/axios";

import "../styles/payment.css";

const Payment = () => {
  const navigate = useNavigate();

  const [isPaying, setIsPaying] = useState(false);

  const registrationData = useMemo(() => {
    const savedData = sessionStorage.getItem(
      "billFlowCompanyRegistration",
    );

    return savedData ? JSON.parse(savedData) : null;
  }, []);

  const selectedPlan = useMemo(() => {
    const savedPlan = sessionStorage.getItem(
      "billFlowSelectedPlan",
    );

    return savedPlan ? JSON.parse(savedPlan) : null;
  }, []);

  useEffect(() => {
    if (!registrationData) {
      navigate("/create-company", { replace: true });
      return;
    }

    if (!selectedPlan) {
      navigate("/choose-plan", { replace: true });
    }
  }, [navigate, registrationData, selectedPlan]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  if (!registrationData || !selectedPlan) {
    return null;
  }

  const gstAmount = Math.round(selectedPlan.price * 0.18);
  const totalAmount = selectedPlan.price + gstAmount;

  const handlePayment = async () => {
    try {
      setIsPaying(true);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Razorpay checkout load aagala. Internet check pannu.",
        );
      }

      const response = await api.post(
        "/payments/create-order",
        {
          amount: totalAmount,
          planName: selectedPlan.name,
        },
      );

      const orderData = response.data;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BillFlow",
        description: `${selectedPlan.name} Subscription`,
        order_id: orderData.orderId,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await api.post(
              "/payments/verify-payment",
              {
                razorpayOrderId:
                  paymentResponse.razorpay_order_id,
                razorpayPaymentId:
                  paymentResponse.razorpay_payment_id,
                razorpaySignature:
                  paymentResponse.razorpay_signature,

                companyName: registrationData.companyName,
                ownerName: registrationData.ownerName,
                email: registrationData.email,
                phone: registrationData.phone,
                address: registrationData.address,
                password: registrationData.password,

                planName: selectedPlan.name,
                planAmount: totalAmount,
              },
            );

            const verificationData =
              verifyResponse.data;

            if (
              !verificationData.verified ||
              !verificationData.accessToken
            ) {
              throw new Error(
                "Payment verified response incomplete-ah irukku",
              );
            }

            localStorage.setItem(
              "billFlowAccessToken",
              verificationData.accessToken,
            );

            localStorage.setItem(
              "billFlowUser",
              JSON.stringify(verificationData.owner),
            );

            localStorage.setItem(
              "billFlowCompany",
              JSON.stringify(verificationData.company),
            );

            sessionStorage.removeItem(
              "billFlowCompanyRegistration",
            );

            sessionStorage.removeItem(
              "billFlowSelectedPlan",
            );

            alert(
              "Payment verified. BillFlow account successfully created.",
            );

            navigate("/login", {
              replace: true,
            });
          } catch (error) {
            console.error(
              "Payment verification error:",
              error,
            );

            alert(
              error.message ||
                "Payment successful, aana verification fail aagiduchu.",
            );

            setIsPaying(false);
          }
        },

        prefill: {
          name: registrationData.ownerName,
          email: registrationData.email,
          contact: registrationData.phone,
        },

        notes: {
          companyName: registrationData.companyName,
          planName: selectedPlan.name,
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (failureResponse) {
          console.error(
            "Razorpay payment failed:",
            failureResponse.error,
          );

          alert(
            failureResponse.error.description ||
              "Payment failed. Try again.",
          );

          setIsPaying(false);
        },
      );

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        error.message ||
          "Payment start panna mudiyala. Try again.",
      );

      setIsPaying(false);
    }
  };

  return (
    <main className="payment-page">
      <section className="payment-container">
        <div className="registration-stepper">
          <div className="registration-step completed">
            <span>✓</span>
            <p>Company Details</p>
          </div>

          <div className="registration-step-line completed"></div>

          <div className="registration-step completed">
            <span>✓</span>
            <p>Choose Plan</p>
          </div>

          <div className="registration-step-line completed"></div>

          <div className="registration-step active">
            <span>3</span>
            <p>Payment</p>
          </div>
        </div>

        <div className="payment-header">
          <span className="payment-step-badge">
            BillFlow Registration
          </span>

          <h1>Complete your payment</h1>

          <p>
            Payment successful aana udane company account activate aagum.
          </p>
        </div>

        <div className="payment-layout">
          <section className="payment-details-card">
            <div className="payment-card-heading">
              <div>
                <span className="payment-small-label">
                  Company Details
                </span>

                <h2>{registrationData.companyName}</h2>
              </div>

              <button
                type="button"
                className="payment-edit-button"
                onClick={() => navigate("/create-company")}
                disabled={isPaying}
              >
                Edit
              </button>
            </div>

            <div className="payment-details-grid">
              <div className="payment-detail-item">
                <span>Owner Name</span>
                <strong>{registrationData.ownerName}</strong>
              </div>

              <div className="payment-detail-item">
                <span>Email</span>
                <strong>{registrationData.email}</strong>
              </div>

              <div className="payment-detail-item">
                <span>Phone</span>
                <strong>{registrationData.phone}</strong>
              </div>

              <div className="payment-detail-item">
                <span>Business Type</span>
                <strong>{registrationData.businessType}</strong>
              </div>

              <div className="payment-detail-item payment-detail-full">
                <span>Address</span>
                <strong>{registrationData.address}</strong>
              </div>

              {registrationData.gstNumber && (
                <div className="payment-detail-item">
                  <span>GST Number</span>
                  <strong>{registrationData.gstNumber}</strong>
                </div>
              )}
            </div>

            <div className="secure-payment-box">
              <div className="secure-payment-icon">✓</div>

              <div>
                <h3>Secure Razorpay Payment</h3>

                <p>
                  UPI, card, net banking and supported wallets use
                  pannalaam.
                </p>
              </div>
            </div>
          </section>

          <aside className="payment-summary-card">
            <div className="payment-summary-heading">
              <span>Selected Plan</span>

              <button
                type="button"
                onClick={() => navigate("/choose-plan")}
                disabled={isPaying}
              >
                Change
              </button>
            </div>

            <div className="selected-plan-summary">
              <div>
                <h2>{selectedPlan.name}</h2>
                <p>{selectedPlan.description}</p>
              </div>

              {selectedPlan.popular && (
                <span className="summary-popular-badge">
                  Popular
                </span>
              )}
            </div>

            <div className="payment-price-details">
              <div>
                <span>Plan Price</span>
                <strong>₹{selectedPlan.price}</strong>
              </div>

              <div>
                <span>GST (18%)</span>
                <strong>₹{gstAmount}</strong>
              </div>
            </div>

            <div className="payment-total-row">
              <span>Total Amount</span>
              <strong>₹{totalAmount}</strong>
            </div>

            <button
              type="button"
              className="pay-now-button"
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying
                ? "Payment Processing..."
                : `Pay ₹${totalAmount}`}
            </button>

            <button
              type="button"
              className="payment-back-button"
              onClick={() => navigate("/choose-plan")}
              disabled={isPaying}
            >
              Back to Plans
            </button>

            <p className="payment-terms-text">
              Payment continue pannina BillFlow terms and subscription
              policy accept pannuringa.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Payment;