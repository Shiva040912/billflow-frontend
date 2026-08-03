import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/chooseplan.css";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 499,
    billingCycle: "month",
    description: "Small shops-ku suitable.",
    features: [
      "1 Owner Account",
      "Up to 3 Employees",
      "Products & Categories",
      "Basic Billing",
      "Stock Management",
      "Basic Reports",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    billingCycle: "month",
    description: "Growing businesses-ku best.",
    popular: true,
    features: [
      "1 Owner Account",
      "Up to 10 Employees",
      "Advanced Billing",
      "Stock & Purchase Management",
      "Customer & Supplier Management",
      "Advanced Reports",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 1999,
    billingCycle: "month",
    description: "Large shops and multiple teams-ku.",
    features: [
      "1 Owner Account",
      "Unlimited Employees",
      "All Billing Features",
      "Advanced Inventory",
      "Expenses & Profit Reports",
      "Priority Support",
    ],
  },
];

const ChoosePlan = () => {
  const navigate = useNavigate();

  const [selectedPlan, setSelectedPlan] = useState("pro");

  const handleContinue = () => {
    const registrationData = sessionStorage.getItem(
      "billFlowCompanyRegistration",
    );

    if (!registrationData) {
      navigate("/create-company");
      return;
    }

    const plan = plans.find((item) => item.id === selectedPlan);

    sessionStorage.setItem(
      "billFlowSelectedPlan",
      JSON.stringify(plan),
    );

    navigate("/payment");
  };

  return (
    <main className="choose-plan-page">
      <section className="choose-plan-container">
        <div className="registration-stepper">
          <div className="registration-step completed">
            <span>✓</span>
            <p>Company Details</p>
          </div>

          <div className="registration-step-line completed"></div>

          <div className="registration-step active">
            <span>2</span>
            <p>Choose Plan</p>
          </div>

          <div className="registration-step-line"></div>

          <div className="registration-step">
            <span>3</span>
            <p>Payment</p>
          </div>
        </div>

        <div className="choose-plan-header">
          <span className="choose-plan-badge">
            BillFlow Registration
          </span>

          <h1>Choose your BillFlow plan</h1>

          <p>
            Ungaloda business size-ku suitable-aana plan select pannunga.
          </p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`plan-card ${
                  isSelected ? "plan-card-selected" : ""
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <span className="popular-badge">
                    Most Popular
                  </span>
                )}

                <div className="plan-card-top">
                  <div>
                    <h2>{plan.name}</h2>
                    <p>{plan.description}</p>
                  </div>

                  <div className="plan-radio">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={isSelected}
                      onChange={() => setSelectedPlan(plan.id)}
                      aria-label={`Select ${plan.name} plan`}
                    />
                  </div>
                </div>

                <div className="plan-price">
                  <span className="currency">₹</span>

                  <strong>{plan.price}</strong>

                  <span className="billing-cycle">
                    /{plan.billingCycle}
                  </span>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`select-plan-button ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedPlan(plan.id);
                  }}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="choose-plan-footer">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/create-company")}
          >
            Back
          </button>

          <button
            type="button"
            className="continue-payment-button"
            onClick={handleContinue}
          >
            Continue to Payment
          </button>
        </div>
      </section>
    </main>
  );
};

export default ChoosePlan;