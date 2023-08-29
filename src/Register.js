import React, { useState } from 'react';
import Add from './image/addAvatar.png';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, storage, db } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Add3 from './image/Testot.png';
import Add4 from './image/grr.png';
import Add5 from './image/Sina.png';
function Register(props) {
    const [err, setErr] = useState(false);
    const nav = useNavigate();

    const handlesubmit = async (e) => {
        e.preventDefault();
        const displayName = e.target[0].value;
        const email = e.target[1].value;
        const password = e.target[2].value;
        const gender = e.target[3].value;
        const file = e.target[4].files[0];

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);

            const storageRef = ref(storage, displayName);

            if (file) {
                const uploadTask = uploadBytesResumable(storageRef, file);
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {},
                    (error) => {
                        console.error('Error uploading file:', error);
                        setErr(true);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            console.log('File uploaded. Download URL:', downloadURL);

                            const profileData = {
                                displayName,
                                photoURL: downloadURL,
                            };

                            await updateProfile(res.user, profileData);

                            await setDoc(doc(db, 'users', res.user.uid), {
                                uid: res.user.uid,
                                displayName: displayName,
                                email: email,
                                photoURL: profileData.photoURL,
                            });

                            await setDoc(doc(db, 'userChats', res.user.uid), {});
                            nav('/');
                            console.log('User profile and data updated successfully.');
                            setErr(false);
                        } catch (uploadError) {
                            console.error('Error during download URL or Firestore update:', uploadError);
                            setErr(true);
                        }
                    }
                );
            }
            else {
                const profileData = {
                    displayName,
                };
                if(gender==='male')
                {
                    profileData.photoURL=Add3;
                }
                else
                {
                    profileData.photoURL=Add5;
                }
                await updateProfile(res.user, profileData);

                await setDoc(doc(db, 'users', res.user.uid), {
                    uid: res.user.uid,
                    displayName: displayName,
                    email: email,
                    photoURL: profileData.photoURL,
                });

                await setDoc(doc(db, 'userChats', res.user.uid), {});
                nav('/');
                console.log('User profile and data updated successfully.');
                setErr(false);
            }
        } catch (authError) {
            console.error('Error creating user:', authError);
            setErr(true);
        }
    }

    return (
        <div className='formContainer'>
            <div className='form-wrapper'>
                <h1 className='logo'>Chat app</h1>
                <h2 className='register'>Register</h2>
                <form onSubmit={handlesubmit}>
                    <input type='text' placeholder='display name' />
                    <input type='email' placeholder='email' />
                    <input type='password' placeholder='password' />
                    <select>
                        <option value='male'>Male</option>
                        <option value='female'>Female</option>
                    </select>
                    <input style={{ display: 'none' }} type='file' id='file' className='fileinput' />
                    <label htmlFor='file'>
                        <img id='adnigo' src={Add} alt='' />
                        <span>Add an avatar</span>
                    </label>
                    <button>Sign up</button>
                    {err && <span>Something went wrong</span>}
                </form>
                <p>
                    Do you already have an account?{' '}
                    <button
                        onClick={() => {
                            nav('/login');
                        }}
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;