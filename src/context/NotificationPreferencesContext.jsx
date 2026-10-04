import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/*
=========================================================
NOTIFICATION PREFERENCES

The old Settings toggle wrote "notificationsEnabled" to
localStorage and nothing ever read it back, so it had no
effect on the app at all.

These preferences are now the single source of truth for
two things:

  1. NotificationContext, which stops polling, stops the
     bell badge and stops raising desktop alerts.
  2. The Notifications manager on the Settings page.
=========================================================
*/

const STORAGE_KEY = "nexusNotificationPrefs";

/*
=========================================================
CATEGORIES

Each one maps to a real module of the ERP, so turning a
category off actually silences that area instead of
being decorative.
=========================================================
*/

export const NOTIFICATION_CATEGORIES = [
  {
    key: "notices",
    label: "Notices & Announcements",
    description:
      "Circulars, exam announcements and college wide updates",
    type: "info",
  },
  {
    key: "attendance",
    label: "Attendance",
    description:
      "Low attendance warnings and daily register changes",
    type: "warning",
  },
  {
    key: "marks",
    label: "Marks & Results",
    description:
      "New mark entries, GPA updates and rank changes",
    type: "success",
  },
  {
    key: "fees",
    label: "Fees & Payments",
    description:
      "Payment confirmations, dues and due date reminders",
    type: "danger",
  },
  {
    key: "assignments",
    label: "Assignments",
    description:
      "New assignments, submissions and grading results",
    type: "info",
  },
  {
    key: "requests",
    label: "Leave & Requests",
    description:
      "Leave and bonafide request approvals or rejections",
    type: "success",
  },
  {
    key: "library",
    label: "Library",
    description:
      "Book due dates, renewals and reservation updates",
    type: "warning",
  },
];

const CATEGORY_KEYS = NOTIFICATION_CATEGORIES.map(
  (category) => category.key
);

const DEFAULT_PREFERENCES = {
  // Master switch. When off, nothing is polled and the
  // bell badge stays hidden.
  enabled: true,

  // In-app banner alerts.
  inApp: true,

  // Native desktop popups, which need browser permission.
  desktop: false,

  // Short beep on a new alert.
  sound: false,

  // Ask again when the tab is in the background.
  backgroundOnly: false,

  categories: CATEGORY_KEYS.reduce((accumulator, key) => {
    accumulator[key] = true;
    return accumulator;
  }, {}),
};

/*
=========================================================
STORAGE
=========================================================
*/

// Merge stored values over the defaults so a preference
// added in a later release still has a value for users who
// saved their settings before it existed.
const readPreferences = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,

      categories: {
        ...DEFAULT_PREFERENCES.categories,
        ...(parsed.categories || {}),
      },
    };
  } catch (error) {
    console.error(
      "Failed to read notification preferences:",
      error
    );

    return DEFAULT_PREFERENCES;
  }
};

const writePreferences = (preferences) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error(
      "Failed to save notification preferences:",
      error
    );
  }
};

/*
=========================================================
SOUND

A short two tone chime built with the Web Audio API so the
app does not have to ship or fetch an audio file.
=========================================================
*/

const playChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();

    const gain = context.createGain();

    gain.gain.setValueAtTime(0.0001, context.currentTime);

    gain.gain.exponentialRampToValueAtTime(
      0.08,
      context.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.32
    );

    gain.connect(context.destination);

    [880, 1320].forEach((frequency, index) => {
      const oscillator = context.createOscillator();

      oscillator.type = "sine";

      oscillator.frequency.value = frequency;

      oscillator.connect(gain);

      oscillator.start(
        context.currentTime + index * 0.09
      );

      oscillator.stop(
        context.currentTime + 0.32 + index * 0.09
      );
    });

    /* Release the hardware once the chime has finished. */
    setTimeout(() => context.close(), 800);
  } catch (error) {
    console.error("Notification chime error:", error);
  }
};

/*
=========================================================
CONTEXT
=========================================================
*/

const NotificationPreferencesContext =
  createContext();

export const NotificationPreferencesProvider = ({
  children,
}) => {
  const [preferences, setPreferences] =
    useState(readPreferences);

  /*
  =========================================================
  PERSIST ON EVERY CHANGE
  =========================================================
  */

  useEffect(() => {
    writePreferences(preferences);
  }, [preferences]);

  /*
  =========================================================
  BROWSER PERMISSION

  Defaults to "default" on mount, which is the state
  before the browser has been asked. Reading it lazily
  avoids a stale value when the user answers the prompt
  from the address bar.
  =========================================================
  */

  const [permission, setPermission] =
    useState(
      typeof window !== "undefined" &&
        "Notification" in window
        ? Notification.permission
        : "unsupported"
    );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    const sync = () =>
      setPermission(Notification.permission);

    sync();

    window.addEventListener(
      "focus",
      sync
    );

    return () =>
      window.removeEventListener(
        "focus",
        sync
      );
  }, []);

  const supportsDesktop =
    typeof window !== "undefined" &&
    "Notification" in window;

  /*
  =========================================================
  UPDATERS
  =========================================================
  */

  const setPreference = useCallback((key, value) => {
    setPreferences((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  const setCategory = useCallback(
    (categoryKey, value) => {
      setPreferences((previous) => ({
        ...previous,

        categories: {
          ...previous.categories,

          [categoryKey]: value,
        },
      }));
    },
    []
  );

  /*
  Turning the master switch off also drops the desktop
  popups, otherwise a user who muted everything would
  still get a popup the next time the browser is granted
  permission on its own.
  */

  const setEnabled = useCallback((value) => {
    setPreferences((previous) => ({
      ...previous,

      enabled: value,

      ...(value
        ? {}
        : {
            inApp: false,
            desktop: false,
            sound: false,
          }),
    }));
  }, []);

  /*
  =========================================================
  ASK FOR DESKTOP PERMISSION

  Requesting is a user gesture, so this can only be called
  from a click handler. Turning desktop alerts on implies
  asking for permission.
  =========================================================
  */

  const requestDesktopPermission =
    useCallback(async () => {
      if (!supportsDesktop) {
        return "unsupported";
      }

      if (Notification.permission === "granted") {
        setPreference("desktop", true);

        return "granted";
      }

      if (Notification.permission === "denied") {
        setPermission("denied");

        return "denied";
      }

      const result = await Notification.requestPermission();

      setPermission(result);

      if (result === "granted") {
        setPreference("desktop", true);
      }

      return result;
    }, [supportsDesktop, setPreference]);

  /*
  =========================================================
  RESET
  =========================================================
  */

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  /*
  =========================================================
  ALERTING

  Called by NotificationContext when new unread
  notifications arrive. Honours the category, channel and
  background rules that were set in Settings.
  =========================================================
  */

  const notify = useCallback(
    (items = []) => {
      if (!preferences.enabled) {
        return;
      }

      const relevant = items.filter((item) => {
        const category =
          item?.category && CATEGORY_KEYS.includes(item.category)
            ? item.category
            : "notices";

        return preferences.categories[category] !== false;
      });

      if (relevant.length === 0) {
        return;
      }

      const hidden = document.hidden;

      if (
        preferences.backgroundOnly &&
        !hidden
      ) {
        return;
      }

      if (
        preferences.sound &&
        !hidden
      ) {
        playChime();
      }

      if (
        !preferences.desktop ||
        !supportsDesktop ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      const newest = relevant[0];

      try {
        const alert = new Notification(
          newest.title || "New notification",
          {
            body: relevant.length > 1
              ? `${newest.message} (+${relevant.length - 1} more)`
              : newest.message || "",

            icon: "/favicon.ico",

            tag: newest._id || "nexus-notification",

            silent: true,
          }
        );

        alert.onclick = () => {
          window.focus();

          alert.close();
        };
      } catch (error) {
        console.error(
          "Desktop notification error:",
          error
        );
      }
    },
    [preferences, supportsDesktop]
  );

  const value = useMemo(
    () => ({
      preferences,

      permission,

      supportsDesktop,

      notify,

      setEnabled,

      setPreference,

      setCategory,

      requestDesktopPermission,

      resetPreferences,
    }),
    [
      preferences,
      permission,
      supportsDesktop,
      notify,
      setEnabled,
      setPreference,
      setCategory,
      requestDesktopPermission,
      resetPreferences,
    ]
  );

  return (
    <NotificationPreferencesContext.Provider
      value={value}
    >
      {children}
    </NotificationPreferencesContext.Provider>
  );
};

export const useNotificationPreferences = () => {
  const context = useContext(
    NotificationPreferencesContext
  );

  if (!context) {
    throw new Error(
      "useNotificationPreferences must be used inside NotificationPreferencesProvider"
    );
  }

  return context;
};

export default NotificationPreferencesContext;