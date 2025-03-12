// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAO1KIBOESsJnLr-9-J8N2LlIM0uYdBhvk",
  authDomain: "techtrends-bb524.firebaseapp.com",
  projectId: "techtrends-bb524",
  storageBucket: "techtrends-bb524.firebasestorage.app",
  messagingSenderId: "221751008232",
  appId: "1:221751008232:web:b9abfd8551ac7965ffe25d",
  measurementId: "G-QYMTTHZP03",
  databaseURL: "https://techtrends-bb524.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Log Firebase initialization in development
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase initialized with project:', firebaseConfig.projectId);
}

export { db }; 