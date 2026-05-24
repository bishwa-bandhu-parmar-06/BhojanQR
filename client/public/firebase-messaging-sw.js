// 1. Service Worker me importScripts use hota hai, normal import nahi
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// 2. Yahan aapko apni actual keys manually dalni hain (import.meta.env yahan kaam nahi karta)
const firebaseConfig = {
  apiKey: "AIzaSyDGKHBUKpiaMvD_Mr6OIL3-5ZcbOFKGkjI",
  authDomain: "bhojanqr-a18ff.firebaseapp.com",
  projectId: "bhojanqr-a18ff",
  storageBucket: "bhojanqr-a18ff.firebasestorage.app",
  messagingSenderId: "44325942288",
  appId: "1:44325942288:web:b0f15d4fc5ad7115374695",
  measurementId: "G-5BQ7NP3Y2S"
};

// 3. Initialize Firebase inside Service Worker
firebase.initializeApp(firebaseConfig);

// 4. Background messaging handler setup
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification?.title || "BhojanQR Update";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification.",
    icon: "/BhojanQR-removebg.png", 
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});