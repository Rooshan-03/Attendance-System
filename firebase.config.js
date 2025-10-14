// Import Firebase core and services
import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase } from "firebase/database";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGYnXIxxFQisMT5cv17BgkfejbGAvgDAk",
  authDomain: "attendance-373ea.firebaseapp.com",
  databaseURL: "https://attendance-373ea-default-rtdb.firebaseio.com",
  projectId: "attendance-373ea",
  storageBucket: "attendance-373ea.firebasestorage.app",
  messagingSenderId: "611172617339",
  appId: "1:611172617339:web:afe3c1ffa4fdb27a1ae6de",
  measurementId: "G-PTZH9NYW75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with persistence (AsyncStorage for React Native)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// ✅ Initialize Realtime Database
const database = getDatabase(app);

// Export for use in your app
export { auth, database };
export default app;
