import { useEffect, useMemo, useRef, useState } from "react";

import {
  FiBell,
  FiCheckCircle,
  FiHeadphones,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiX,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import { getSupports } from "../services/supportApi";

const ProviderTopbar = ({ openSidebar }) => {
  const navigate = useNavigate();

  const notificationRef = useRef(null);

  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  const [supportRequests, setSupportRequests] =
    useState([]);

  const [isNotificationLoading, setIsNotificationLoading] =
    useState(false);

  const handleSupportClick = () => {
    navigate("/provider/support");
  };

  const handleLogout = () => {
    localStorage.removeItem("billFlowProviderAccessToken");
    localStorage.removeItem("billFlowProviderUser");

    navigate("/provider/login", {
      replace: true,
    });
  };

  const fetchNotifications = async () => {
    try {
      setIsNotificationLoading(true);

      const response = await getSupports();

      setSupportRequests(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );

      setSupportRequests([]);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const notifications = useMemo(() => {
    return supportRequests
      .filter(
        (support) =>
          support.status === "open" ||
          support.status === "in_progress"
      )
      .sort(
        (firstSupport, secondSupport) =>
          new Date(
            secondSupport.createdAt || 0
          ).getTime() -
          new Date(
            firstSupport.createdAt || 0
          ).getTime()
      )
      .slice(0, 6);
  }, [supportRequests]);

  const notificationCount =
    notifications.length;

  const handleNotificationClick = async () => {
    const nextState =
      !isNotificationOpen;

    setIsNotificationOpen(nextState);

    if (nextState) {
      await fetchNotifications();
    }
  };

  const handleNotificationItemClick = (
    support
  ) => {
    setIsNotificationOpen(false);

    navigate("/provider/support");
  };

  const handleViewAllNotifications = () => {
    setIsNotificationOpen(false);

    navigate("/provider/support");
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const formatNotificationDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    ).format(date);
  };

  return (
    <header className="provider-topbar">
      <div className="provider-topbar-left">
        <button
          type="button"
          className="provider-menu-btn"
          onClick={openSidebar}
          aria-label="Open sidebar"
        >
          <FiMenu />
        </button>

        <div className="provider-page-heading">
          <span className="provider-page-eyebrow">
            OVERVIEW
          </span>

          <h2>Dashboard</h2>
        </div>
      </div>

      <div className="provider-topbar-right">
        <div className="provider-search-box">
          <FiSearch />

          <input
            type="text"
            placeholder="Search anything..."
            aria-label="Search"
          />
        </div>

        <div className="provider-header-actions">
          <button
            type="button"
            className="provider-action-btn"
            onClick={handleSupportClick}
            aria-label="Support Requests"
            title="Support Requests"
          >
            <FiHeadphones />
          </button>

          <div
            className="provider-notification-wrapper"
            ref={notificationRef}
          >
            <button
              type="button"
              className={`provider-action-btn provider-notification-btn ${
                isNotificationOpen
                  ? "active"
                  : ""
              }`}
              onClick={
                handleNotificationClick
              }
              aria-label="Notifications"
              title="Notifications"
              aria-expanded={
                isNotificationOpen
              }
            >
              <FiBell />

              {notificationCount > 0 && (
                <>
                  <span className="provider-notification-dot" />

                  <span className="provider-notification-count">
                    {notificationCount > 9
                      ? "9+"
                      : notificationCount}
                  </span>
                </>
              )}
            </button>

            {isNotificationOpen && (
              <div className="provider-notification-popup">
                <div className="provider-notification-popup-header">
                  <div>
                    <span>
                      Notifications
                    </span>

                    <h3>
                      Recent Activity
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsNotificationOpen(
                        false
                      )
                    }
                    aria-label="Close notifications"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="provider-notification-popup-body">
                  {isNotificationLoading ? (
                    <div className="provider-notification-state">
                      <span className="provider-notification-loader" />

                      <p>
                        Checking notifications...
                      </p>
                    </div>
                  ) : notifications.length ===
                    0 ? (
                    <div className="provider-notification-state">
                      <div className="provider-notification-empty-icon">
                        <FiCheckCircle />
                      </div>

                      <h4>
                        You're all caught up
                      </h4>

                      <p>
                        No new notifications
                        available.
                      </p>
                    </div>
                  ) : (
                    <div className="provider-notification-list">
                      {notifications.map(
                        (notification) => (
                          <button
                            type="button"
                            className="provider-notification-item"
                            key={
                              notification._id
                            }
                            onClick={() =>
                              handleNotificationItemClick(
                                notification
                              )
                            }
                          >
                            <div className="provider-notification-item-icon">
                              <FiHeadphones />
                            </div>

                            <div className="provider-notification-item-content">
                              <div className="provider-notification-item-top">
                                <strong>
                                  {notification.companyName ||
                                    "Support Request"}
                                </strong>

                                <span>
                                  {formatNotificationDate(
                                    notification.createdAt
                                  )}
                                </span>
                              </div>

                              <p>
                                {notification.subject ||
                                  "New support request"}
                              </p>

                              <small>
                                {notification.status ===
                                "open"
                                  ? "New support request"
                                  : "Support request in progress"}
                              </small>
                            </div>

                            <span className="provider-notification-unread-dot" />
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {notifications.length >
                  0 && (
                  <button
                    type="button"
                    className="provider-notification-view-all"
                    onClick={
                      handleViewAllNotifications
                    }
                  >
                    View all support requests
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="provider-signout-btn"
            onClick={handleLogout}
          >
            <FiLogOut />

            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ProviderTopbar;