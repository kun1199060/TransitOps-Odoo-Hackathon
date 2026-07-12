import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👉 STEP: Go to https://console.firebase.google.com → Create Project
// → Project Settings → General → scroll to "Your apps" → Web app (</>) → copy config here
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0i_oac1_-RDhpUiipVx9QFJ2hdLBUzo8",
  authDomain: "transitops-hackathon.firebaseapp.com",
  projectId: "transitops-hackathon",
  storageBucket: "transitops-hackathon.firebasestorage.app",
  messagingSenderId: "470171340300",
  appId: "1:470171340300:web:83329bbb33cee2528c6829",
  measurementId: "G-BGXS227BFZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
