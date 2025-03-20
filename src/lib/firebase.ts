import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDzLyTPK-kvmPNKKFufD0CTZHTI6NWq3QE",
  authDomain: "aktwgs-65f34.firebaseapp.com",
  projectId: "aktwgs-65f34",
  storageBucket: "aktwgs-65f34.firebasestorage.app",
  messagingSenderId: "762157998257",
  appId: "1:762157998257:web:508f6bc6a63e2161ce4290"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);