importScripts("https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAsIH1r4iUWLgMG-FrObYbmMGjVZRaem4g",
    authDomain: "lovedashboard.firebaseapp.com",
    projectId: "lovedashboard",
    storageBucket: "lovedashboard.firebasestorage.app",
    messagingSenderId: "118792260540",
    appId: "1:118792260540:web:ba570888511d9f49c239b9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/icons/icon-192.png" // opzionale
    });
});