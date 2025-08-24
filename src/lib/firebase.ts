import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebaseの設定（storageBucketを修正）
const firebaseConfig = {
  apiKey: "AIzaSyBR2pE0umvtYdxFKoEqk4mawr63brlUFuk",
  authDomain: "ya-management.firebaseapp.com",
  projectId: "ya-management",
  storageBucket: "ya-management.appspot.com", // ←修正
  messagingSenderId: "1023524554375",
  appId: "1:1023524554375:web:04b1bd212525075dbbda22",
  measurementId: "G-KKD7P70X6H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
