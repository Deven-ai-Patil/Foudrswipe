// Service Worker for background notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();

  // Get the match ID from the notification tag
  const matchId = event.notification.tag.replace('message-', '');

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus().then((client) => {
            // Navigate to messages with the match ID
            client.postMessage({
              type: 'NAVIGATE_TO_MESSAGE',
              matchId: matchId
            });
            return client;
          });
        }
      }
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(`/messages?matchId=${matchId}`);
      }
    })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, icon } = event.data;
    
    self.registration.showNotification(title, {
      body,
      tag,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: {
        url: event.data.url || '/messages'
      }
    });
  }
});
