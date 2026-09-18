import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpl1u--gq9Ev29b8IWb_y9BzZwptO0xF4",
  authDomain: "maytri-19e25.firebaseapp.com",
  projectId: "maytri-19e25",
  storageBucket: "maytri-19e25.firebasestorage.app",
  messagingSenderId: "325568251873",
  appId: "1:325568251873:web:5036e123ba5d3fbca5b4a0",
  measurementId: "G-48GJE6NNF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { analytics, signInWithPopup, signOut };
export default app;
