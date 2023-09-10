import React, {useState} from 'react';
import Add from "./image/addAvatar.png";
import {useNavigate} from "react-router-dom";
import {createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {auth, db, storage} from "./firebase";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {doc, setDoc} from "firebase/firestore";
import {  signInWithEmailAndPassword } from "firebase/auth";


function Login(props) {
    const [err, setErr] = useState(false);
    const nav=useNavigate()
    const handlesubmit= async (e)=>{
        e.preventDefault()
        const email=e.target[0].value
        const password=e.target[1].value

        try {
            await signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    nav('/')
                    // ...
                })
                .catch((error) => {
                    setErr(true)
                    const errorCode = error.code;
                    const errorMessage = error.message;
                });
        } catch (authError) {
            console.error('Error creating user:', authError);
            setErr(true); // Handle the error appropriately in your UI
        }
    }
    return (
        <div className='logink'>
            <div className='loginkwrapper'>
                <h1 className='logo'>DialogDynamo</h1>
                <h2 className='register'>Login</h2>
                <form onSubmit={handlesubmit}>
                    <input type='email' placeholder='email'/>
                    <input type='password' placeholder='password'/>
                    <button>Log in</button>
                </form>
                {err &&<span>Something went wrong</span>}
                <p>Do you not have an account? <button onClick={()=>{
                    nav('/register')
                }
                }>Register</button></p>
            </div>
        </div>
    );
}

export default Login;