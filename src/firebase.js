import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBmC4WRHRCtbMXxzqwg_W59QxckPaF1AX4",
    authDomain: "chatappfinal-2aed2.firebaseapp.com",
    projectId: "chatappfinal-2aed2",
    storageBucket: "chatappfinal-2aed2.appspot.com",
    messagingSenderId: "514890520359",
    appId: "1:514890520359:web:9ea3180f9163235ce77b02"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth =getAuth()
export const storage = getStorage();
export const db=getFirestore();
