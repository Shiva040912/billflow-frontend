import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  FiAlertTriangle,
  FiBell,
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import api from "../services/axios";
import BusinessAiChat from "../pages/BusinessAiChat";

const Topbar = ({
  onMenuClick,
}) => {
  const navigate =
    useNavigate();

  const notificationRef =
    useRef(null);

  const profileRef =
    useRef(null);

  const [
    companyName,
    setCompanyName,
  ] = useState(
    "Loading..."
  );

  const [
    isNotificationOpen,
    setIsNotificationOpen,
  ] = useState(false);

  const [
    isProfileOpen,
    setIsProfileOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    isNotificationsLoading,
    setIsNotificationsLoading,
  ] = useState(false);

  const user = useMemo(() => {
    const storedUser =
      localStorage.getItem(
        "billFlowUser"
      );

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(
        storedUser
      );
    } catch {
      return null;
    }
  }, []);

  const userName =
    user?.name || "Owner";

  const userRole =
    user?.role
      ? user.role
          .replace(/_/g, " ")
          .replace(
            /\b\w/g,
            (character) =>
              character.toUpperCase()
          )
      : "Business Owner";

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map(
        (word) => word[0]
      )
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const clearAuthentication =
    useCallback(() => {
      localStorage.removeItem(
        "billFlowAccessToken"
      );

      localStorage.removeItem(
        "billFlowUser"
      );

      localStorage.removeItem(
        "billFlowCompany"
      );

      sessionStorage.removeItem(
        "billFlowNotificationPopupShown"
      );
    }, []);

  useEffect(() => {
    const fetchCompanyName =
      async () => {
        try {
          const response =
            await api.get(
              "/company/settings"
            );

          const fetchedCompanyName =
            response.data
              ?.companyName ||
            "Company";

          setCompanyName(
            fetchedCompanyName
          );

          localStorage.setItem(
            "billFlowCompany",
            JSON.stringify(
              response.data
            )
          );
        } catch (error) {
          console.error(
            "Company name fetch error:",
            error
          );

          if (
            error.response
              ?.status === 401
          ) {
            clearAuthentication();

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          const storedCompany =
            localStorage.getItem(
              "billFlowCompany"
            );

          if (storedCompany) {
            try {
              const parsedCompany =
                JSON.parse(
                  storedCompany
                );

              setCompanyName(
                parsedCompany
                  ?.companyName ||
                  "Company"
              );

              return;
            } catch {
              setCompanyName(
                "Company"
              );

              return;
            }
          }

          setCompanyName(
            "Company"
          );
        }
      };

    fetchCompanyName();
  }, [
    clearAuthentication,
    navigate,
  ]);

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
        ) {
          setIsNotificationOpen(
            false
          );
        }

        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {
          setIsProfileOpen(
            false
          );
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

  const showNotificationPopup =
    useCallback(
      (
        notificationItems
      ) => {
        if (
          notificationItems.length ===
          0
        ) {
          return;
        }

        const hasShownNotificationPopup =
          sessionStorage.getItem(
            "billFlowNotificationPopupShown"
          );

        if (
          hasShownNotificationPopup
        ) {
          return;
        }

        const firstNotification =
          notificationItems[0];

        toast(
          (toastItem) => (
            <button
              type="button"
              className="notification-toast-content"
              onClick={() => {
                toast.dismiss(
                  toastItem.id
                );

                navigate(
                  firstNotification.route
                );
              }}
            >
              <span className="notification-toast-icon">
                <FiBell />
              </span>

              <span className="notification-toast-text">
                <strong>
                  {
                    firstNotification.title
                  }
                </strong>

                <small>
                  {
                    firstNotification.message
                  }
                </small>
              </span>
            </button>
          ),
          {
            id:
              "billflow-business-notification",

            duration: 5000,

            position:
              "top-right",

            className:
              "notification-toast",
          }
        );

        sessionStorage.setItem(
          "billFlowNotificationPopupShown",
          "true"
        );
      },
      [navigate]
    );

  const fetchNotifications =
    useCallback(
      async ({
        showPopup = false,
      } = {}) => {
        try {
          setIsNotificationsLoading(
            true
          );

          const response =
            await api.get(
              "/dashboard/summary"
            );

          const dashboardData =
            response.data || {};

          const notificationItems =
            [];

          if (
            dashboardData
              .lowStockProducts
              ?.length > 0
          ) {
            dashboardData
              .lowStockProducts
              .forEach(
                (product) => {
                  notificationItems.push(
                    {
                      id:
                        product.id ||
                        product._id,

                      type:
                        "warning",

                      title:
                        "Low Stock Alert",

                      message:
                        `${product.name} has only ${
                          product.stock ??
                          0
                        } stock left.`,

                      route:
                        "/inventory",
                    }
                  );
                }
              );
          }

          if (
            Number(
              dashboardData
                .todaySales || 0
            ) > 0
          ) {
            notificationItems.push(
              {
                id:
                  "today-sales",

                type:
                  "success",

                title:
                  "Today's Sales",

                message:
                  `₹${Number(
                    dashboardData.todaySales
                  ).toLocaleString(
                    "en-IN"
                  )} sales recorded today.`,

                route:
                  "/reports",
              }
            );
          }

          setNotifications(
            notificationItems
          );

          if (showPopup) {
            showNotificationPopup(
              notificationItems
            );
          }
        } catch (error) {
          console.error(
            "Notification fetch error:",
            error
          );

          if (
            error.response
              ?.status === 401
          ) {
            clearAuthentication();

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          setNotifications([]);
        } finally {
          setIsNotificationsLoading(
            false
          );
        }
      },
      [
        clearAuthentication,
        navigate,
        showNotificationPopup,
      ]
    );

  useEffect(() => {
    fetchNotifications({
      showPopup: true,
    });
  }, [
    fetchNotifications,
  ]);

  const handleNotificationToggle =
    () => {
      const nextState =
        !isNotificationOpen;

      setIsNotificationOpen(
        nextState
      );

      setIsProfileOpen(
        false
      );

      if (nextState) {
        fetchNotifications({
          showPopup: false,
        });
      }
    };

  const handleProfileToggle =
    () => {
      setIsProfileOpen(
        (
          currentState
        ) =>
          !currentState
      );

      setIsNotificationOpen(
        false
      );
    };

  const handleContactClick =
    () => {
      setIsNotificationOpen(
        false
      );

      setIsProfileOpen(
        false
      );

      navigate(
        "/contact"
      );
    };

  const handleNotificationClick =
    (notification) => {
      setIsNotificationOpen(
        false
      );

      navigate(
        notification.route
      );
    };

  const handleLogout = () => {
    clearAuthentication();

    toast.dismiss();

    navigate(
      "/",
      {
        replace: true,
      }
    );
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="topbar-menu-btn"
            onClick={
              onMenuClick
            }
            aria-label="Open sidebar"
          >
            <FiMenu />
          </button>

          <div className="topbar-company">
            <div className="topbar-company-icon">
              <FiBriefcase />
            </div>

            <div className="topbar-company-details">
              <span>
                Current Business
              </span>

              <strong>
                {
                  companyName
                }
              </strong>
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={
              handleContactClick
            }
            aria-label="Contact Admin"
            title="Contact Admin"
          >
            <FiHelpCircle />
          </button>

          <div
            className="topbar-dropdown-wrapper"
            ref={
              notificationRef
            }
          >
            <button
              type="button"
              className={`topbar-icon-btn ${
                isNotificationOpen
                  ? "active"
                  : ""
              }`}
              onClick={
                handleNotificationToggle
              }
              aria-label="Notifications"
              title="Notifications"
            >
              <FiBell />

              {notifications.length >
                0 && (
                <span className="notification-dot" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="topbar-dropdown notification-dropdown">
                <div className="topbar-dropdown-header">
                  <div>
                    <strong>
                      Notifications
                    </strong>

                    <span>
                      Business alerts
                    </span>
                  </div>

                  <FiBell />
                </div>

                <div className="notification-list">
                  {isNotificationsLoading ? (
                    <div className="topbar-dropdown-empty">
                      <span className="topbar-notification-loader" />

                      <strong>
                        Checking alerts
                      </strong>

                      <span>
                        Loading latest
                        notifications...
                      </span>
                    </div>
                  ) : notifications.length >
                    0 ? (
                    notifications.map(
                      (
                        notification
                      ) => (
                        <button
                          key={
                            notification.id
                          }
                          type="button"
                          className="notification-item"
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                        >
                          <span
                            className={`notification-item-icon ${notification.type}`}
                          >
                            {notification.type ===
                            "success" ? (
                              <FiCheckCircle />
                            ) : (
                              <FiAlertTriangle />
                            )}
                          </span>

                          <span className="notification-item-content">
                            <strong>
                              {
                                notification.title
                              }
                            </strong>

                            <small>
                              {
                                notification.message
                              }
                            </small>
                          </span>
                        </button>
                      )
                    )
                  ) : (
                    <div className="topbar-dropdown-empty">
                      <FiCheckCircle />

                      <strong>
                        All caught up
                      </strong>

                      <span>
                        Your business
                        looks good.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className="topbar-dropdown-wrapper"
            ref={
              profileRef
            }
          >
            <button
              type="button"
              className={`topbar-profile ${
                isProfileOpen
                  ? "active"
                  : ""
              }`}
              onClick={
                handleProfileToggle
              }
            >
              <div className="profile-avatar">
                {
                  initials ||
                  "O"
                }
              </div>

              <div className="profile-details">
                <strong>
                  {
                    userName
                  }
                </strong>

                <span>
                  {
                    userRole
                  }
                </span>
              </div>

              <FiChevronDown
                className={
                  isProfileOpen
                    ? "profile-chevron open"
                    : "profile-chevron"
                }
              />
            </button>

            {isProfileOpen && (
              <div className="topbar-dropdown profile-dropdown">
                <div className="profile-dropdown-user">
                  <div className="profile-avatar large">
                    {
                      initials ||
                      "O"
                    }
                  </div>

                  <div>
                    <strong>
                      {
                        userName
                      }
                    </strong>

                    <span>
                      {
                        user?.email ||
                        ""
                      }
                    </span>
                  </div>
                </div>

                <div className="profile-dropdown-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(
                        false
                      );

                      navigate(
                        "/settings"
                      );
                    }}
                  >
                    <FiUser />
                    Profile Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(
                        false
                      );

                      navigate(
                        "/settings"
                      );
                    }}
                  >
                    <FiSettings />
                    Application Settings
                  </button>
                </div>

                <div className="profile-dropdown-footer">
                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <BusinessAiChat />
    </>
  );
};

export default Topbar;