import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvmjHaixGvd1JcR5pKRrp1WMIT7HQQ5Xc",
  authDomain: "stemm-lab-6535f.firebaseapp.com",
  projectId: "stemm-lab-6535f",
  storageBucket: "stemm-lab-6535f.firebasestorage.app",
  messagingSenderId: "374386966535",
  appId: "1:374386966535:web:6f057b71805b6b35e12aa2",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);