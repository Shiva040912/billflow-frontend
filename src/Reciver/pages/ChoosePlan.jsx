import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiPackage,
  FiShield,
  FiStar,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import api from "../services/axios";

import "../styles/chooseplan.css";

const ChoosePlan = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await api.get(
          "/provider/plans/public/active"
        );

        const planData = Array.isArray(
          response.data
        )
          ? response.data
          : response.data?.plans || [];

        setPlans(planData);

        if (planData.length > 0) {
          const popularPlan =
            planData.find(
              (plan) => plan.isPopular
            ) || planData[0];

          setSelectedPlanId(
            popularPlan._id
          );
        }
      } catch (error) {
        console.error(
          "Plans fetch error:",
          error
        );

        const responseMessage =
          error.response?.data?.message;

        setErrorMessage(
          Array.isArray(responseMessage)
            ? responseMessage[0]
            : responseMessage ||
                "Plans load panna mudiyala."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (planId) => {
    setSelectedPlanId(planId);
    setErrorMessage("");
  };

  const handleContinue = () => {
    const registrationData =
      sessionStorage.getItem(
        "billFlowCompanyRegistration"
      );

    if (!registrationData) {
      navigate("/create-company");
      return;
    }

    const selectedPlan = plans.find(
      (plan) =>
        plan._id === selectedPlanId
    );

    if (!selectedPlan) {
      setErrorMessage(
        "Continue panna oru plan select pannu."
      );

      return;
    }

    const paymentPlan = {
      ...selectedPlan,

      id: selectedPlan._id,

      price: Number(
        selectedPlan.monthlyPrice || 0
      ),

      billingCycle: "month",

      popular:
        selectedPlan.isPopular || false,
    };

    sessionStorage.setItem(
      "billFlowSelectedPlan",
      JSON.stringify(paymentPlan)
    );

    navigate("/payment");
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  return (
    <main className="choose-plan-page">
      <header className="choose-plan-topbar">
        <button
          type="button"
          className="choose-plan-brand"
          onClick={() => navigate("/")}
        >
          <span className="choose-plan-brand-logo">
            <FiZap />
          </span>

          <span className="choose-plan-brand-text">
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
          className="choose-plan-topbar-back"
          onClick={() =>
            navigate("/create-company")
          }
        >
          <FiArrowLeft />

          <span>
            Company Details
          </span>
        </button>
      </header>

      <section className="choose-plan-container">
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

          <div className="registration-step active">
            <span>2</span>

            <p>
              Choose Plan
            </p>
          </div>

          <div className="registration-step-line" />

          <div className="registration-step">
            <span>3</span>

            <p>
              Payment
            </p>
          </div>
        </div>

        <div className="choose-plan-header">
          <span className="choose-plan-badge">
            Step 2 of 3
          </span>

          <h1>
            Choose a plan that fits
            <span> your business.</span>
          </h1>

          <p>
            Start with the right workspace for your current
            business size. You can choose from the available
            BillFlow subscription plans below.
          </p>
        </div>

        {errorMessage && (
          <div className="choose-plan-error">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="choose-plan-loading">
            <div className="choose-plan-loader" />

            <h3>
              Loading plans
            </h3>

            <p>
              Available BillFlow plans are being prepared.
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="choose-plan-empty">
            <div className="choose-plan-empty-icon">
              <FiPackage />
            </div>

            <h3>
              No plans available
            </h3>

            <p>
              Subscription plans are currently unavailable.
            </p>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => {
              const isSelected =
                selectedPlanId ===
                plan._id;

              return (
                <article
                  key={plan._id}
                  className={`plan-card ${
                    isSelected
                      ? "plan-card-selected"
                      : ""
                  } ${
                    plan.isPopular
                      ? "plan-card-popular"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectPlan(
                      plan._id
                    )
                  }
                >
                  {plan.isPopular && (
                    <div className="popular-badge">
                      <FiStar />
                      Most Popular
                    </div>
                  )}

                  <div className="plan-card-selection">
                    <span
                      className={`plan-selection-indicator ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                    >
                      {isSelected && (
                        <FiCheck />
                      )}
                    </span>
                  </div>

                  <div className="plan-card-top">
                    <div>
                      <span className="plan-name-label">
                        BillFlow Plan
                      </span>

                      <h2>
                        {plan.name}
                      </h2>

                      <p>
                        {plan.description ||
                          "BillFlow subscription plan."}
                      </p>
                    </div>

                    <div className="plan-radio">
                      <input
                        type="radio"
                        name="plan"
                        value={plan._id}
                        checked={isSelected}
                        onChange={() =>
                          handleSelectPlan(
                            plan._id
                          )
                        }
                        aria-label={`Select ${plan.name} plan`}
                      />
                    </div>
                  </div>

                  <div className="plan-price">
                    <strong>
                      {formatCurrency(
                        plan.monthlyPrice
                      )}
                    </strong>

                    <span className="billing-cycle">
                      / month
                    </span>
                  </div>

                  {Number(
                    plan.yearlyPrice
                  ) > 0 && (
                    <div className="plan-yearly-price">
                      <span>
                        Yearly billing
                      </span>

                      <strong>
                        {formatCurrency(
                          plan.yearlyPrice
                        )}
                      </strong>
                    </div>
                  )}

                  {Number(
                    plan.trialDays
                  ) > 0 && (
                    <div className="plan-trial">
                      <FiCheckCircle />

                      <span>
                        {plan.trialDays} days free trial included
                      </span>
                    </div>
                  )}

                  <div className="plan-limits">
                    <div>
                      <span className="plan-limit-icon">
                        <FiUsers />
                      </span>

                      <div>
                        <small>
                          Employees
                        </small>

                        <strong>
                          {plan.employeeLimit}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <span className="plan-limit-icon products">
                        <FiPackage />
                      </span>

                      <div>
                        <small>
                          Products
                        </small>

                        <strong>
                          {plan.productLimit}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <span className="plan-limit-icon customers">
                        <FiUsers />
                      </span>

                      <div>
                        <small>
                          Customers
                        </small>

                        <strong>
                          {plan.customerLimit}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <span className="plan-limit-icon invoices">
                        <FiShield />
                      </span>

                      <div>
                        <small>
                          Invoices
                        </small>

                        <strong>
                          {plan.invoiceLimit}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="plan-feature-title">
                    Included features
                  </div>

                  <ul className="plan-features">
                    {Array.isArray(
                      plan.features
                    ) &&
                    plan.features.length >
                      0 ? (
                      plan.features.map(
                        (
                          feature,
                          index
                        ) => (
                          <li
                            key={`${plan._id}-${index}`}
                          >
                            <span className="feature-check">
                              <FiCheck />
                            </span>

                            <span>
                              {feature}
                            </span>
                          </li>
                        )
                      )
                    ) : (
                      <li>
                        <span className="feature-check">
                          <FiCheck />
                        </span>

                        <span>
                          BillFlow billing features
                        </span>
                      </li>
                    )}
                  </ul>

                  <button
                    type="button"
                    className={`select-plan-button ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      handleSelectPlan(
                        plan._id
                      );
                    }}
                  >
                    {isSelected ? (
                      <>
                        <FiCheck />
                        Selected Plan
                      </>
                    ) : (
                      <>
                        Select Plan
                        <FiArrowRight />
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div className="choose-plan-security">
          <FiShield />

          <div>
            <strong>
              Secure subscription
            </strong>

            <span>
              Your selected plan will be confirmed only after
              successful payment.
            </span>
          </div>
        </div>

        <div className="choose-plan-footer">
          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate(
                "/create-company"
              )
            }
          >
            <FiArrowLeft />
            Back
          </button>

          <button
            type="button"
            className="continue-payment-button"
            disabled={
              isLoading ||
              plans.length === 0 ||
              !selectedPlanId
            }
            onClick={handleContinue}
          >
            Continue to Payment
            <FiArrowRight />
          </button>
        </div>
      </section>
    </main>
  );
};

export default ChoosePlan;