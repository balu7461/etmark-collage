import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgmUeGFJ23YRNBxzFLYA3XobZwmtZzcRs",
  authDomain: "etmark-collage.firebaseapp.com",
  projectId: "etmark-collage",
  storageBucket: "etmark-collage.firebasestorage.app",
  messagingSenderId: "147028938102",
  appId: "1:147028938102:web:269d620cfdf455cb3b3e57",
  measurementId: "G-RVBGWXLX25"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;