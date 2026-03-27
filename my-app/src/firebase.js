import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyA46kSYHa9hx6toKq3ndVrwz7UZ8mSrJBw",
    authDomain: "our-space-b4490.firebaseapp.com",
    projectId: "our-space-b4490",
    storageBucket: "our-space-b4490.firebasestorage.app",
    messagingSenderId: "105549816436",
    appId: "1:105549816436:web:8aa05eb2a70761d28d6721"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default app