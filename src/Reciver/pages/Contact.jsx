import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheckCircle,
  FiClock,
  FiHeadphones,
  FiMail,
  FiMessageSquare,
  FiPhone,
  FiRefreshCw,
  FiSend,
} from "react-icons/fi";

import {
  createSupport,
  getMySupports,
} from "../services/supportApi";

import {
  showErrorToast,
  showSuccessToast,
} from "../utils/toast";

import "../styles/contact.css";

const initialFormData = {
  category: "technical",
  priority: "medium",
  subject: "",
  message: "",
};

const Contact = () => {
  const [formData, setFormData] =
    useState(initialFormData);

  const [supports, setSupports] =
    useState([]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isLoadingSupports,
    setIsLoadingSupports,
  ] = useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const fetchMySupports =
    useCallback(
      async (showLoader = true) => {
        try {
          if (showLoader) {
            setIsLoadingSupports(true);
          } else {
            setIsRefreshing(true);
          }

          const response =
            await getMySupports();

          setSupports(
            Array.isArray(response?.data)
              ? response.data
              : []
          );
        } catch (error) {
          console.error(
            "Support history fetch error:",
            error
          );

          showErrorToast(
            error,
            "Unable to load your support requests."
          );
        } finally {
          setIsLoadingSupports(false);
          setIsRefreshing(false);
        }
      },
      []
    );

  useEffect(() => {
    fetchMySupports();
  }, [fetchMySupports]);

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setIsSubmitting(true);

        const response =
          await createSupport({
            category:
              formData.category,

            priority:
              formData.priority,

            subject:
              formData.subject.trim(),

            message:
              formData.message.trim(),
          });

        showSuccessToast(
          response?.message ||
            "Support request submitted successfully."
        );

        setFormData(
          initialFormData
        );

        await fetchMySupports(
          false
        );
      } catch (error) {
        console.error(
          "Support request error:",
          error
        );

        showErrorToast(
          error,
          "Unable to submit support request."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  const formatLabel = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return value
      .split("_")
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const summary =
    useMemo(() => {
      return {
        total:
          supports.length,

        open:
          supports.filter(
            (support) =>
              support.status ===
              "open"
          ).length,

        inProgress:
          supports.filter(
            (support) =>
              support.status ===
              "in_progress"
          ).length,

        resolved:
          supports.filter(
            (support) =>
              support.status ===
              "resolved"
          ).length,
      };
    }, [supports]);

  return (
    <section className="contact-page">
      <header className="contact-page-header">
        <div>
          <span className="contact-header-label">
            Help & Support
          </span>

          <h1>
            Contact Support
          </h1>

          <p>
            Send your issue to the BillFlow team and
            track every request from one place.
          </p>
        </div>

        <div className="contact-header-status">
          <span className="contact-header-status-icon">
            <FiHeadphones />
          </span>

          <div>
            <span>
              Support Center
            </span>

            <strong>
              Available
            </strong>
          </div>
        </div>
      </header>

      <section className="contact-summary-grid">
        <article className="contact-summary-card total">
          <div className="contact-summary-card-top">
            <span className="contact-summary-icon">
              <FiMessageSquare />
            </span>

            <span className="contact-summary-badge">
              All
            </span>
          </div>

          <div>
            <p>
              Total Requests
            </p>

            <strong>
              {summary.total}
            </strong>

            <small>
              Support tickets raised
            </small>
          </div>
        </article>

        <article className="contact-summary-card open">
          <div className="contact-summary-card-top">
            <span className="contact-summary-icon">
              <FiHeadphones />
            </span>

            <span className="contact-summary-badge">
              Open
            </span>
          </div>

          <div>
            <p>
              Open Requests
            </p>

            <strong>
              {summary.open}
            </strong>

            <small>
              Waiting for review
            </small>
          </div>
        </article>

        <article className="contact-summary-card progress">
          <div className="contact-summary-card-top">
            <span className="contact-summary-icon">
              <FiClock />
            </span>

            <span className="contact-summary-badge">
              Active
            </span>
          </div>

          <div>
            <p>
              In Progress
            </p>

            <strong>
              {summary.inProgress}
            </strong>

            <small>
              Currently being handled
            </small>
          </div>
        </article>

        <article className="contact-summary-card resolved">
          <div className="contact-summary-card-top">
            <span className="contact-summary-icon">
              <FiCheckCircle />
            </span>

            <span className="contact-summary-badge">
              Done
            </span>
          </div>

          <div>
            <p>
              Resolved
            </p>

            <strong>
              {summary.resolved}
            </strong>

            <small>
              Completed requests
            </small>
          </div>
        </article>
      </section>

      <section className="contact-main-grid">
        <div className="contact-left-column">
          <article className="contact-info-card">
            <div className="contact-info-heading">
              <span className="contact-main-icon">
                <FiHeadphones />
              </span>

              <div>
                <span>
                  Support Center
                </span>

                <h2>
                  Need assistance?
                </h2>
              </div>
            </div>

            <p className="contact-info-description">
              Describe your issue clearly and our
              support team can review your request
              faster.
            </p>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <span className="contact-info-item-icon">
                  <FiMail />
                </span>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    support@billflow.com
                  </strong>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-info-item-icon">
                  <FiPhone />
                </span>

                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    +91 98765 43210
                  </strong>
                </div>
              </div>

              <div className="contact-info-item">
                <span className="contact-info-item-icon">
                  <FiClock />
                </span>

                <div>
                  <span>
                    Response Time
                  </span>

                  <strong>
                    Usually within 24 hours
                  </strong>
                </div>
              </div>
            </div>
          </article>

          <form
            className="contact-form-card"
            onSubmit={
              handleSubmit
            }
          >
            <div className="contact-form-heading">
              <div>
                <span>
                  New Request
                </span>

                <h2>
                  Send Message
                </h2>

                <p>
                  Tell us what you need help with.
                </p>
              </div>

              <span className="contact-form-heading-icon">
                <FiSend />
              </span>
            </div>

            <div className="contact-form-row">
              <div className="contact-form-group">
                <label htmlFor="support-category">
                  Category
                </label>

                <select
                  id="support-category"
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="technical">
                    Technical
                  </option>

                  <option value="billing">
                    Billing
                  </option>

                  <option value="payment">
                    Payment
                  </option>

                  <option value="account">
                    Account
                  </option>

                  <option value="feature_request">
                    Feature Request
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div className="contact-form-group">
                <label htmlFor="support-priority">
                  Priority
                </label>

                <select
                  id="support-priority"
                  name="priority"
                  value={
                    formData.priority
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="urgent">
                    Urgent
                  </option>
                </select>
              </div>
            </div>

            <div className="contact-form-group">
              <label htmlFor="support-subject">
                Subject
              </label>

              <input
                id="support-subject"
                type="text"
                name="subject"
                placeholder="Enter a clear subject"
                value={
                  formData.subject
                }
                onChange={
                  handleChange
                }
                maxLength={180}
                required
              />
            </div>

            <div className="contact-form-group">
              <div className="contact-message-label">
                <label htmlFor="support-message">
                  Message
                </label>

                <span>
                  {formData.message.length}/3000
                </span>
              </div>

              <textarea
                id="support-message"
                rows={6}
                name="message"
                placeholder="Describe your issue in detail..."
                value={
                  formData.message
                }
                onChange={
                  handleChange
                }
                maxLength={3000}
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <span className="contact-button-loader" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        <article className="contact-history-card">
          <div className="contact-history-header">
            <div>
              <span>
                Request History
              </span>

              <h2>
                My Support Requests
              </h2>

              <p>
                Track status, messages and replies
                from the BillFlow support team.
              </p>
            </div>

            <button
              type="button"
              className="contact-refresh-btn"
              onClick={() =>
                fetchMySupports(
                  false
                )
              }
              disabled={
                isRefreshing
              }
              title="Refresh requests"
            >
              <FiRefreshCw
                className={
                  isRefreshing
                    ? "spinning"
                    : ""
                }
              />
            </button>
          </div>

          {isLoadingSupports ? (
            <div className="contact-empty-state">
              <span className="contact-history-loader" />

              <h3>
                Loading requests
              </h3>

              <p>
                Fetching your latest support activity.
              </p>
            </div>
          ) : supports.length === 0 ? (
            <div className="contact-empty-state">
              <span className="contact-empty-icon">
                <FiMessageSquare />
              </span>

              <h3>
                No support requests yet
              </h3>

              <p>
                Your submitted support requests
                will appear here.
              </p>
            </div>
          ) : (
            <div className="contact-request-list">
              {supports.map(
                (
                  support
                ) => (
                  <article
                    key={
                      support._id
                    }
                    className="contact-request-card"
                  >
                    <div className="contact-request-top">
                      <div>
                        <div className="contact-request-badges">
                          <span
                            className={`contact-status-badge ${support.status}`}
                          >
                            {formatLabel(
                              support.status
                            )}
                          </span>

                          <span
                            className={`contact-priority-badge ${support.priority}`}
                          >
                            {formatLabel(
                              support.priority
                            )}
                          </span>
                        </div>

                        <h3>
                          {
                            support.subject
                          }
                        </h3>
                      </div>

                      <span className="contact-request-date">
                        {formatDate(
                          support.createdAt
                        )}
                      </span>
                    </div>

                    <div className="contact-request-meta">
                      <span>
                        {formatLabel(
                          support.category
                        )}
                      </span>
                    </div>

                    <div className="contact-request-message">
                      <span>
                        Your Message
                      </span>

                      <p>
                        {
                          support.message
                        }
                      </p>
                    </div>

                    {support.adminReply ? (
                      <div className="contact-admin-reply">
                        <div className="contact-admin-reply-heading">
                          <span className="contact-admin-icon">
                            <FiHeadphones />
                          </span>

                          <div>
                            <span>
                              BillFlow Support
                            </span>

                            <small>
                              {formatDate(
                                support.repliedAt
                              )}
                            </small>
                          </div>
                        </div>

                        <p>
                          {
                            support.adminReply
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="contact-awaiting-reply">
                        <FiClock />

                        <span>
                          Waiting for support response
                        </span>
                      </div>
                    )}

                    {support.resolvedAt && (
                      <div className="contact-resolved-info">
                        <FiCheckCircle />

                        <span>
                          Resolved on{" "}
                          {formatDate(
                            support.resolvedAt
                          )}
                        </span>
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </article>
      </section>
    </section>
  );
};

export default Contact;