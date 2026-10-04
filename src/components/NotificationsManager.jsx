import React, { useMemo, useState } from "react";

import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaRedo,
  FaVolumeUp,
  FaDesktop,
  FaMoon,
  FaExclamationTriangle,
  FaShieldAlt,
  FaInbox,
} from "react-icons/fa";

import {
  NOTIFICATION_CATEGORIES,
  useNotificationPreferences,
} from "../context/NotificationPreferencesContext";

import useNotification from "../hooks/useNotification";

import "./NotificationsManager.css";

/*
=========================================================
PERMISSION COPY

The browser permission can be in three states, and each
one needs different wording plus a different way out.
=========================================================
*/

const PERMISSION_COPY = {
  granted: {
    label: "Allowed",
    hint: "This browser will show desktop popups.",
  },

  denied: {
    label: "Blocked",
    hint:
      "Desktop alerts are blocked for this site. Re-enable them from the lock icon in the address bar.",
  },

  default: {
    label: "Not asked",
    hint: "Allow desktop alerts to get popups.",
  },

  unsupported: {
    label: "Unavailable",
    hint:
      "This browser does not support desktop notifications.",
  },
};

/*
=========================================================
RELATIVE TIME
=========================================================
*/

const timeAgo = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TYPE_LABELS = {
  info: "Notice",
  success: "Update",
  warning: "Warning",
  danger: "Urgent",
};

const VALID_KEYS = NOTIFICATION_CATEGORIES.map(
  (category) => category.key
);

/*
Notices posted before the category field existed, and any
notice whose category is not one we know about, is treated
as a general notice. This is the same fallback the backend
uses when it stores a notice.
*/

const categoryOf = (item) =>
  VALID_KEYS.includes(item?.category)
    ? item.category
    : "notices";

/*
=========================================================
NOTIFICATIONS MANAGER
=========================================================
*/

const NotificationsManager = ({ onClose }) => {
  const {
    preferences,
    permission,
    supportsDesktop,
    setEnabled,
    setPreference,
    setCategory,
    requestDesktopPermission,
    resetPreferences,
    notify,
  } = useNotificationPreferences();

  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
    loading,
  } = useNotification();

  /*
  Which category the user is filtering the preview list
  by. "all" shows everything.
  */

  const [filter, setFilter] = useState("all");

  const permissionCopy = PERMISSION_COPY[permission] ||
    PERMISSION_COPY.default;

  /*
  =========================================================
  DERIVED COUNTS
  =========================================================
  */

  const counts = useMemo(() => {
    const result = { all: 0, unread: 0 };

    NOTIFICATION_CATEGORIES.forEach((category) => {
      result[category.key] = 0;
    });

    const list = Array.isArray(notifications)
      ? notifications
      : [];

    list.forEach((item) => {
      result[categoryOf(item)] += 1;

      if (item.read === false) {
        result.unread += 1;
      }
    });

    return result;
  }, [notifications]);

  /*
  The preview list. The active filter is resolved here in one
  place so the empty state and the rendered list can never
  disagree, which is what happens if the filter is applied
  in both places independently.
  */

  const visible = useMemo(() => {
    const list = Array.isArray(notifications)
      ? [...notifications]
      : [];

    if (filter === "all") {
      return list;
    }

    if (filter === "unread") {
      return list.filter((item) => item.read === false);
    }

    return list.filter(
      (item) => categoryOf(item) === filter
    );
  }, [notifications, filter]);

  const enabledCount = NOTIFICATION_CATEGORIES.filter(
    (category) => preferences.categories[category.key]
  ).length;

  const canClearAll = !loading && notifications.length > 0;

  /*
  =========================================================
  DESKTOP TOGGLE

  Permission can only be requested from a user gesture, so
  this asks first and stores the preference once granted.
  =========================================================
  */

  const handleDesktopToggle = async () => {
    if (preferences.desktop) {
      setPreference("desktop", false);
      return;
    }

    const result = await requestDesktopPermission();

    if (result === "denied") {
      return;
    }

    setPreference("desktop", true);
  };

  /*
  =========================================================
  CATEGORY BULK ACTIONS
  =========================================================
  */

  const setAllCategories = (value) => {
    NOTIFICATION_CATEGORIES.forEach((category) => {
      setCategory(category.key, value);
    });
  };

  /*
  =========================================================
  TEST ALERT

  Sends a real desktop popup through the same code path a
  live notice uses, so a user can confirm permission works
  before waiting for an actual notice.
  =========================================================
  */

  const handleTest = () => {
    notify([
      {
        _id: "test-alert",

        title: "Test notification",

        message:
          "Desktop alerts are working. You will only see this while the NEXUS ERP tab is open.",

        category: filter === "all" ? "notices" : filter,

        read: false,
      },
    ]);
  };

  const testBlocked =
    preferences.desktop &&
    supportsDesktop &&
    permission === "denied";

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <div
      className="nm-overlay"
      onClick={onClose}
    >
      <div
        className="nm-shell"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}

        <div className="nm-header">
          <div className="nm-title">
            <FaBell />

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Choose what NEXUS ERP is allowed to
                interrupt you about
              </p>
            </div>
          </div>

          <button
            type="button"
            className="nm-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>


        {/* Master switch */}

        <div className="nm-master">
          <div className="nm-master-info">
            <h3>
              Enable notifications
            </h3>

            <p>
              {preferences.enabled
                ? "NEXUS ERP is checking for new notices every 30 seconds."
                : "Nothing is being fetched. The bell badge stays hidden."}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.enabled}
            aria-label="Enable notifications"
            className={`nm-switch ${
              preferences.enabled ? "on" : ""
            }`}
            onClick={() =>
              setEnabled(!preferences.enabled)
            }
          >
            <span />
          </button>
        </div>


        {/* Everything below is inert while muted */}

        <div
          className={`nm-body ${
            preferences.enabled ? "" : "nm-disabled"
          }`}
        >


          {/* Delivery channels */}

          <section className="nm-section">
            <h3 className="nm-section-title">
              How you get alerted
            </h3>

            <div className="nm-row">
              <div className="nm-row-icon">
                <FaBell />
              </div>

              <div className="nm-row-info">
                <h4>
                  In-app alerts
                </h4>

                <p>
                  Counters and badges inside the ERP
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={preferences.inApp}
                aria-label="In-app alerts"
                disabled={!preferences.enabled}
                className={`nm-switch ${
                  preferences.inApp ? "on" : ""
                }`}
                onClick={() =>
                  setPreference(
                    "inApp",
                    !preferences.inApp
                  )
                }
              >
                <span />
              </button>
            </div>


            <div className="nm-row">
              <div className="nm-row-icon">
                <FaVolumeUp />
              </div>

              <div className="nm-row-info">
                <h4>
                  Alert sound
                </h4>

                <p>
                  Short chime while the tab is open
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={preferences.sound}
                aria-label="Alert sound"
                disabled={!preferences.enabled}
                className={`nm-switch ${
                  preferences.sound ? "on" : ""
                }`}
                onClick={() =>
                  setPreference(
                    "sound",
                    !preferences.sound
                  )
                }
              >
                <span />
              </button>
            </div>


            <div className="nm-row">
              <div className="nm-row-icon">
                <FaDesktop />
              </div>

              <div className="nm-row-info">
                <h4>
                  Desktop popups
                </h4>

                <p className={`nm-hint nm-hint-${permission}`}>
                  {permissionCopy.hint}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={preferences.desktop}
                aria-label="Desktop popups"
                disabled={
                  !preferences.enabled ||
                  !supportsDesktop ||
                  permission === "denied"
                }
                className={`nm-switch ${
                  preferences.desktop ? "on" : ""
                }`}
                onClick={handleDesktopToggle}
              >
                <span />
              </button>
            </div>


            <div className="nm-row">
              <div className="nm-row-icon">
                <FaMoon />
              </div>

              <div className="nm-row-info">
                <h4>
                  Only when tab is hidden
                </h4>

                <p>
                  Stay quiet while you are already
                  looking at the ERP
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={
                  preferences.backgroundOnly
                }
                aria-label="Only when tab is hidden"
                disabled={!preferences.enabled}
                className={`nm-switch ${
                  preferences.backgroundOnly ? "on" : ""
                }`}
                onClick={() =>
                  setPreference(
                    "backgroundOnly",
                    !preferences.backgroundOnly
                  )
                }
              >
                <span />
              </button>
            </div>

            {testBlocked && (
              <p className="nm-warning">
                <FaExclamationTriangle />
                Popups are blocked for this site.
                Unblock them from the address bar,
                then switch desktop popups back on.
              </p>
            )}

            {preferences.desktop &&
              !testBlocked &&
              permission === "granted" && (
                <button
                  type="button"
                  className="nm-test"
                  onClick={handleTest}
                >
                  <FaBell />
                  Send a test popup
                </button>
              )}
          </section>


          {/* Categories */}

          <section className="nm-section">
            <div className="nm-section-head">
              <h3 className="nm-section-title">
                What you hear about
              </h3>

              <div className="nm-bulk">
                <button
                  type="button"
                  disabled={!preferences.enabled}
                  onClick={() =>
                    setAllCategories(true)
                  }
                >
                  All
                </button>

                <button
                  type="button"
                  disabled={!preferences.enabled}
                  onClick={() =>
                    setAllCategories(false)
                  }
                >
                  None
                </button>
              </div>
            </div>

            <p className="nm-section-note">
              {enabledCount} of{" "}
              {NOTIFICATION_CATEGORIES.length} areas
              selected
            </p>

            <div className="nm-categories">
              {NOTIFICATION_CATEGORIES.map(
                (category) => (
                  <div
                    className="nm-category"
                    key={category.key}
                  >
                    <div className="nm-row-info">
                      <h4>
                        {category.label}

                        {counts[category.key] >
                          0 && (
                            <span className="nm-count">
                              {counts[category.key]}
                            </span>
                          )}
                      </h4>

                      <p>
                        {category.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={
                        preferences.categories[
                          category.key
                        ]
                      }
                      aria-label={category.label}
                      disabled={
                        !preferences.enabled
                      }
                      className={`nm-switch ${
                        preferences.categories[
                          category.key
                        ]
                          ? "on"
                          : ""
                      }`}
                      onClick={() =>
                        setCategory(
                          category.key,
                          !preferences.categories[
                            category.key
                          ]
                        )
                      }
                    >
                      <span />
                    </button>
                  </div>
                )
              )}
            </div>
          </section>


          {/* Live inbox */}

          <section className="nm-section">
            <div className="nm-section-head">
              <h3 className="nm-section-title">
                Inbox
              </h3>

              <div className="nm-inbox-actions">
                <button
                  type="button"
                  disabled={
                    unreadCount === 0 ||
                    !preferences.enabled
                  }
                  onClick={markAllAsRead}
                >
                  <FaCheckDouble />
                  Mark all read
                </button>

                <button
                  type="button"
                  disabled={
                    !canClearAll ||
                    !preferences.enabled
                  }
                  onClick={() => {
                    if (
                      window.confirm(
                        "Clear every notification from this device?"
                      )
                    ) {
                      clearNotifications();
                    }
                  }}
                >
                  <FaTrash />
                  Clear
                </button>
              </div>
            </div>

            <div className="nm-filters">
              <button
                type="button"
                className={
                  filter === "all" ? "active" : ""
                }
                onClick={() => setFilter("all")}
              >
                All
                <span>{counts.all}</span>
              </button>

              <button
                type="button"
                className={
                  filter === "unread" ? "active" : ""
                }
                onClick={() =>
                  setFilter("unread")
                }
              >
                Unread
                <span>{counts.unread}</span>
              </button>

              {NOTIFICATION_CATEGORIES.map(
                (category) =>
                  counts[category.key] > 0 && (
                    <button
                      type="button"
                      key={category.key}
                      className={
                        filter === category.key
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setFilter(category.key)
                      }
                    >
                      {category.label}
                      <span>
                        {counts[category.key]}
                      </span>
                    </button>
                  )
              )}
            </div>

            {loading ? (
              <div className="nm-empty">
                <p>Loading notifications...</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="nm-empty">
                <FaInbox />

                <p>
                  {!preferences.enabled
                    ? "Notifications are turned off."
                    : filter === "all"
                      ? "No notifications yet."
                      : filter === "unread"
                        ? "Nothing unread."
                        : "Nothing in this filter."}
                </p>
              </div>
            ) : (
              <ul className="nm-list">
                {visible.slice(0, 25).map((item) => (
                  <li
                    key={item._id}
                    className={`nm-item nm-item-${item.type} ${
                      item.read === false
                        ? "nm-item-unread"
                        : ""
                    }`}
                  >
                    <div className="nm-item-top">
                      <span className="nm-item-title">
                        {item.title}
                        </span>

                        <span className="nm-item-badge">
                          {TYPE_LABELS[item.type] ||
                            "Notice"}
                        </span>
                      </div>

                      <p className="nm-item-message">
                        {item.message}
                      </p>

                      <div className="nm-item-meta">
                        <span>
                          {timeAgo(item.createdAt)}
                        </span>

                        {item.read === false ? (
                          <span className="nm-unread">
                            <FaBell />
                            New
                          </span>
                        ) : (
                          <span className="nm-read">
                            <FaCheck />
                            Read
                          </span>
                        )}
                      </div>
                    </li>
                ))}
              </ul>
            )}
          </section>

        </div>


        {/* Footer */}

        <div className="nm-footer">
          <span className="nm-privacy">
            <FaShieldAlt />
            Preferences are stored on this device
            only
          </span>

          <div className="nm-footer-actions">
            <button
              type="button"
              className="nm-reset"
              onClick={resetPreferences}
            >
              <FaRedo />
              Reset
            </button>

            <button
              type="button"
              className="nm-done"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationsManager;