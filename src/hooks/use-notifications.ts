import { useEffect, useState, useCallback } from "react";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          setServiceWorkerRegistration(registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Listen for navigation messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NAVIGATE_TO_MESSAGE') {
          window.location.href = `/messages?matchId=${event.data.matchId}`;
        }
      });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      // Use service worker for background notifications if available
      if (serviceWorkerRegistration) {
        serviceWorkerRegistration.active?.postMessage({
          type: 'SHOW_NOTIFICATION',
          title,
          body: options?.body,
          tag: options?.tag,
          icon: options?.icon || '/favicon.ico',
          url: (options as any)?.data?.url
        });
      } else {
        // Fallback to regular notification
        new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
      }
    } else if (Notification.permission !== "denied") {
      requestPermission().then((granted) => {
        if (granted) {
          showNotification(title, options);
        }
      });
    }
  }, [requestPermission, serviceWorkerRegistration]);

  const showMatchNotification = useCallback((matchedUserName: string) => {
    showNotification("🎉 New Match!", {
      body: `You matched with ${matchedUserName}!`,
      tag: "match",
      requireInteraction: true,
    });
  }, [showNotification]);

  const showMessageNotification = useCallback((senderName: string, messageContent: string, matchId: string) => {
    showNotification(`💬 ${senderName}`, {
      body: messageContent,
      tag: `message-${matchId}`,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: {
        url: `/messages?matchId=${matchId}`
      }
    } as any);
  }, [showNotification]);

  return {
    permission,
    requestPermission,
    showNotification,
    showMatchNotification,
    showMessageNotification,
  };
};
