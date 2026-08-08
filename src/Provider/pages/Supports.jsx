// Support.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiHeadphones,
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  deleteSupport,
  getSupports,
  updateSupport,
} from "../services/supportApi";

import {
  showErrorToast,
  showSuccessToast,
} from "../../Reciver/utils/toast";

import "../styles/support.css";

const Support = () => {
  const [supports, setSupports] = useState([]);
  const [selectedSupport, setSelectedSupport] =
    useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [reply, setReply] = useState("");
  const [status, setStatus] =
    useState("in_progress");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [processingId, setProcessingId] =
    useState("");

  const fetchSupports = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await getSupports();

      setSupports(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Support fetch error:",
        error
      );

      showErrorToast(
        error,
        "Support requests load panna mudiyala."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupports();
  }, [fetchSupports]);

  useEffect(() => {
    if (!selectedSupport) {
      return undefined;
    }

    document.body.style.overflow =
      "hidden";

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !isUpdating
      ) {
        closeSupport();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = "";

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [selectedSupport, isUpdating]);

  const filteredSupports = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return supports.filter((support) => {
      const matchesSearch =
        !normalizedSearch ||
        support.companyName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        support.requesterName
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        support.requesterEmail
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        support.subject
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        support.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    supports,
    searchTerm,
    statusFilter,
  ]);

  const summary = useMemo(() => {
    return {
      total: supports.length,

      open: supports.filter(
        (support) =>
          support.status === "open"
      ).length,

      inProgress: supports.filter(
        (support) =>
          support.status ===
          "in_progress"
      ).length,

      resolved: supports.filter(
        (support) =>
          support.status === "resolved"
      ).length,
    };
  }, [supports]);

  const openSupport = (support) => {
    setSelectedSupport(support);

    setReply(
      support.adminReply || ""
    );

    setStatus(
      support.status || "in_progress"
    );
  };

  const closeSupport = () => {
    if (isUpdating) {
      return;
    }

    setSelectedSupport(null);
    setReply("");
    setStatus("in_progress");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!selectedSupport) {
      return;
    }

    try {
      setIsUpdating(true);

      const response =
        await updateSupport(
          selectedSupport._id,
          {
            status,
            reply: reply.trim(),
          }
        );

      showSuccessToast(
        response?.message ||
          "Support request updated successfully"
      );

      closeSupport();

      await fetchSupports();
    } catch (error) {
      console.error(
        "Support update error:",
        error
      );

      showErrorToast(
        error,
        "Support request update panna mudiyala."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (
    support
  ) => {
    const isConfirmed =
      window.confirm(
        `Delete support request from ${support.companyName}?`
      );

    if (!isConfirmed) {
      return;
    }

    try {
      setProcessingId(
        support._id
      );

      const response =
        await deleteSupport(
          support._id
        );

      showSuccessToast(
        response?.message ||
          "Support request deleted successfully"
      );

      await fetchSupports();
    } catch (error) {
      console.error(
        "Support delete error:",
        error
      );

      showErrorToast(
        error,
        "Support request delete panna mudiyala."
      );
    } finally {
      setProcessingId("");
    }
  };

  const formatLabel = (value) => {
    if (!value) {
      return "Not available";
    }

    return value
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "-";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  };

  const getCompanyInitial = (
    support
  ) => {
    return (
      support.companyName
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "S"
    );
  };

  return (
    <main className="provider-support-page">
      <section className="provider-support-header">
        <div>
          <span>
            Customer Assistance
          </span>

          <h1>
            Support Requests
          </h1>

          <p>
            Review shop owner issues,
            respond to requests and
            manage resolution status.
          </p>
        </div>
      </section>

      <section className="provider-support-summary">
        <article className="provider-support-summary-card total">
          <div className="provider-support-summary-icon">
            <FiHeadphones />
          </div>

          <div>
            <span>
              Total Requests
            </span>

            <strong>
              {summary.total}
            </strong>

            <small>
              All support tickets
            </small>
          </div>
        </article>

        <article className="provider-support-summary-card open">
          <div className="provider-support-summary-icon">
            <FiMessageSquare />
          </div>

          <div>
            <span>Open</span>

            <strong>
              {summary.open}
            </strong>

            <small>
              Awaiting response
            </small>
          </div>
        </article>

        <article className="provider-support-summary-card progress">
          <div className="provider-support-summary-icon">
            <FiClock />
          </div>

          <div>
            <span>
              In Progress
            </span>

            <strong>
              {summary.inProgress}
            </strong>

            <small>
              Currently being handled
            </small>
          </div>
        </article>

        <article className="provider-support-summary-card resolved">
          <div className="provider-support-summary-icon">
            <FiCheckCircle />
          </div>

          <div>
            <span>Resolved</span>

            <strong>
              {summary.resolved}
            </strong>

            <small>
              Completed requests
            </small>
          </div>
        </article>
      </section>

      <section className="provider-support-card">
        <div className="provider-support-toolbar">
          <div className="provider-support-toolbar-info">
            <span>Support Queue</span>

            <strong>
              {filteredSupports.length}{" "}
              Request
              {filteredSupports.length ===
              1
                ? ""
                : "s"}
            </strong>
          </div>

          <div className="provider-support-toolbar-actions">
            <div className="provider-support-search">
              <FiSearch />

              <input
                type="search"
                placeholder="Search company, subject or requester..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear support search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="open">
                Open
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="closed">
                Closed
              </option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="provider-support-state">
            <span className="provider-support-loader" />

            <h3>
              Loading requests...
            </h3>

            <p>
              Support requests are being
              loaded.
            </p>
          </div>
        ) : filteredSupports.length ===
          0 ? (
          <div className="provider-support-state">
            <div className="provider-support-empty-icon">
              <FiHeadphones />
            </div>

            <h3>
              No support requests
            </h3>

            <p>
              No requests match the
              current search or status.
            </p>
          </div>
        ) : (
          <>
            <div className="provider-support-desktop-table">
              <div className="provider-support-table-wrapper">
                <table className="provider-support-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSupports.map(
                      (support) => (
                        <tr
                          key={
                            support._id
                          }
                        >
                          <td>
                            <div className="provider-support-company">
                              <div className="provider-support-company-avatar">
                                {getCompanyInitial(
                                  support
                                )}
                              </div>

                              <div>
                                <strong>
                                  {support.companyName ||
                                    "Not available"}
                                </strong>

                                <span>
                                  {support.requesterEmail ||
                                    "No email"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="provider-support-subject">
                              <strong>
                                {support.subject ||
                                  "No subject"}
                              </strong>

                              <span>
                                {support.requesterName ||
                                  "Not available"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="provider-support-category">
                              {formatLabel(
                                support.category
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`provider-support-priority ${
                                support.priority ||
                                "low"
                              }`}
                            >
                              {formatLabel(
                                support.priority
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`provider-support-status ${
                                support.status ||
                                "open"
                              }`}
                            >
                              <span className="provider-support-status-dot" />

                              {formatLabel(
                                support.status
                              )}
                            </span>
                          </td>

                          <td>
                            <span className="provider-support-date">
                              {formatDate(
                                support.createdAt
                              )}
                            </span>
                          </td>

                          <td>
                            <div className="provider-support-actions">
                              <button
                                type="button"
                                className="view"
                                onClick={() =>
                                  openSupport(
                                    support
                                  )
                                }
                                title="View support"
                              >
                                <FiEye />
                              </button>

                              <button
                                type="button"
                                className="delete"
                                onClick={() =>
                                  handleDelete(
                                    support
                                  )
                                }
                                disabled={
                                  processingId ===
                                  support._id
                                }
                                title="Delete support"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="provider-support-mobile-list">
              {filteredSupports.map(
                (support) => (
                  <article
                    key={support._id}
                    className="provider-support-mobile-card"
                  >
                    <div className="provider-support-mobile-head">
                      <div className="provider-support-company">
                        <div className="provider-support-company-avatar">
                          {getCompanyInitial(
                            support
                          )}
                        </div>

                        <div>
                          <strong>
                            {support.companyName ||
                              "Not available"}
                          </strong>

                          <span>
                            {support.requesterName ||
                              "Not available"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`provider-support-status ${
                          support.status ||
                          "open"
                        }`}
                      >
                        <span className="provider-support-status-dot" />

                        {formatLabel(
                          support.status
                        )}
                      </span>
                    </div>

                    <div className="provider-support-mobile-subject">
                      <span>
                        Subject
                      </span>

                      <strong>
                        {support.subject ||
                          "No subject"}
                      </strong>
                    </div>

                    <div className="provider-support-mobile-grid">
                      <div>
                        <span>
                          Category
                        </span>

                        <strong>
                          {formatLabel(
                            support.category
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Priority
                        </span>

                        <strong>
                          {formatLabel(
                            support.priority
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Date</span>

                        <strong>
                          {formatDate(
                            support.createdAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Email</span>

                        <strong>
                          {support.requesterEmail ||
                            "-"}
                        </strong>
                      </div>
                    </div>

                    <div className="provider-support-mobile-actions">
                      <button
                        type="button"
                        onClick={() =>
                          openSupport(
                            support
                          )
                        }
                      >
                        <FiEye />
                        View Request
                      </button>

                      <button
                        type="button"
                        className="delete"
                        onClick={() =>
                          handleDelete(
                            support
                          )
                        }
                        disabled={
                          processingId ===
                          support._id
                        }
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          </>
        )}
      </section>

      {selectedSupport && (
        <div
          className="provider-support-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeSupport();
            }
          }}
        >
          <section className="provider-support-modal">
            <header>
              <div className="provider-support-modal-heading">
                <span>
                  Support Ticket
                </span>

                <h2>
                  {
                    selectedSupport.subject
                  }
                </h2>

                <p>
                  {
                    selectedSupport.companyName
                  }{" "}
                  ·{" "}
                  {
                    selectedSupport.requesterEmail
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={closeSupport}
                disabled={isUpdating}
                aria-label="Close support modal"
              >
                <FiX />
              </button>
            </header>

            <div className="provider-support-details">
              <div>
                <span>
                  Category
                </span>

                <strong>
                  {formatLabel(
                    selectedSupport.category
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Priority
                </span>

                <strong>
                  {formatLabel(
                    selectedSupport.priority
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Current Status
                </span>

                <strong>
                  {formatLabel(
                    selectedSupport.status
                  )}
                </strong>
              </div>
            </div>

            <div className="provider-support-user-message">
              <div className="provider-support-message-label">
                <FiMessageSquare />

                <span>
                  Shop Owner Message
                </span>
              </div>

              <p>
                {
                  selectedSupport.message
                }
              </p>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="provider-support-form-grid">
                <div className="provider-support-form-group">
                  <label>
                    Update Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value
                      )
                    }
                  >
                    <option value="open">
                      Open
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="resolved">
                      Resolved
                    </option>

                    <option value="closed">
                      Closed
                    </option>
                  </select>
                </div>

                <div className="provider-support-form-group provider-support-reply-group">
                  <label>
                    Admin Reply
                  </label>

                  <textarea
                    rows={6}
                    value={reply}
                    onChange={(event) =>
                      setReply(
                        event.target.value
                      )
                    }
                    placeholder="Write a clear response to the shop owner..."
                    maxLength={3000}
                  />

                  <span className="provider-support-character-count">
                    {reply.length}/3000
                  </span>
                </div>
              </div>

              <footer>
                <button
                  type="button"
                  className="cancel"
                  onClick={closeSupport}
                  disabled={isUpdating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit"
                  disabled={isUpdating}
                >
                  <FiSend />

                  {isUpdating
                    ? "Updating..."
                    : "Send Reply"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default Support;