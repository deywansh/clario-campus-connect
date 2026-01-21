import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

// Firebase configuration - for demo purposes
// In production, these would be environment variables
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "clario-demo.firebaseapp.com",
  projectId: "clario-demo",
  storageBucket: "clario-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get messaging instance (only works in browser with service worker)
let messaging: ReturnType<typeof getMessaging> | null = null;

export const initializeMessaging = async () => {
  try {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      messaging = getMessaging(app);
      return messaging;
    }
  } catch (error) {
    console.log("Firebase messaging not supported:", error);
  }
  return null;
};

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      return true;
    }
    console.log("Notification permission denied");
    return false;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });

export { app, messaging };
