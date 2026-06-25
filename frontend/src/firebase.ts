// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAufDNQUEEpPRBG-MNBYillCUYZzQSi_o",
  authDomain: "signallab-f90aa.firebaseapp.com",
  projectId: "signallab-f90aa",
  storageBucket: "signallab-f90aa.firebasestorage.app",
  messagingSenderId: "617452705700",
  appId: "1:617452705700:web:bb340b1dc01f26d4d35331"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Authentication: solo se usa el proveedor de Google (OAuth).
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Permite al usuario elegir cuenta en cada inicio de sesión.
googleProvider.setCustomParameters({ prompt: "select_account" });

// Mantiene la sesión tras recargar o cerrar la pestaña.
void setPersistence(auth, browserLocalPersistence);
