// firebase-messaging-sw.js

// Import compat SDK (necessario per i Service Worker)
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');

// Config Firebase
firebase.initializeApp({
  apiKey: "AIzaSyAsIH1r4iUWLgMG-FrObYbmMGjVZRaem4g",
  authDomain: "lovedashboard.firebaseapp.com",
  projectId: "lovedashboard",
  storageBucket: "lovedashboard.firebasestorage.app",
  messagingSenderId: "118792260540",
  appId: "1:118792260540:web:ba570888511d9f49c239b9"
});

// Recupera messaging
const messaging = firebase.messaging();

// Notifiche in background
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Ricevuta notifica in background:', payload);

  const notificationTitle = payload.notification?.title || 'Nuova notifica ❤️';
  const notificationOptions = {
    body: payload.notification?.body || 'Apri l’app per vedere i dettagli!',
    icon: payload.notification?.icon || '40+ Cute Valentine’s Day Wallpaper Ideas _ Mixed Cute Stuffs.jpeg',
    badge: payload.notification?.badge || '/Love-Dashboard/icons/icon-192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Gestione click sulla notifica
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/Love-Dashboard/');
    })
  );
});
