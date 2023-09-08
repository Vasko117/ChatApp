import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBydiE3eEH6Vg5b8xDvkxjjxc8eDqLfKfU",
    authDomain: "chatoj-cbcef.firebaseapp.com",
    projectId: "chatoj-cbcef",
    storageBucket: "chatoj-cbcef.appspot.com",
    messagingSenderId: "1040374293040",
    appId: "1:1040374293040:web:ee33c2a605609b6d3983f5"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth =getAuth()
export const storage = getStorage();
export const db=getFirestore();
