// Import the Firebase scripts for Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker using your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAmdlCrDZDKKnC5EzXGldPKIJkZi6YREn8",
  authDomain: "chat-notification-c4f7e.firebaseapp.com",
  projectId: "chat-notification-c4f7e",
  storageBucket: "chat-notification-c4f7e.appspot.com",
  messagingSenderId: "468614911686",
  appId: "1:468614911686:web:af387ad70c4035a608e9c7",
  measurementId: "G-VEGDM5HMYR"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance to handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://mail.google.com/mail/u/0?ui=2&ik=0f675db839&attid=0.1&permmsgid=msg-a:r-785725266765602002&th=1926c79c3e3c0ab0&view=att&disp=safe&realattid=1926c799d3ff61999ff1'
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes('http://localhost:4200/chat') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('http://localhost:4200/chat');
      }
    })
  );
});