import { useEffect, useState } from "react";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } else if (Notification.permission !== "denied") {
      requestPermission().then((granted) => {
        if (granted) {
          new Notification(title, {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            ...options,
          });
        }
      });
    }
  };

  const showMatchNotification = (matchedUserName: string) => {
    showNotification("🎉 New Match!", {
      body: `You matched with ${matchedUserName}!`,
      tag: "match",
      requireInteraction: true,
    });
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showMatchNotification,
  };
};
