import React, { useContext, useState } from 'react';
import Img from './image/img.png';
import Attach from './image/attach.png';
import { AuthContext } from './context/AuthContext';
import { ChatContext } from './context/ChatContext';
import {doc, updateDoc, arrayUnion, Timestamp, setDoc, serverTimestamp} from 'firebase/firestore';
import { db, storage } from './firebase';
import { v4 as uuid } from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

function Input(props) {
    const [text, setText] = useState('');
    const [imag, setImag] = useState(null);
    const { curruser } = useContext(AuthContext);
    const { data } = useContext(ChatContext);

    const handleSend = async () => {
        if (imag) {
            const storageRef = ref(storage, uuid());
            const uploadTask = uploadBytesResumable(storageRef, imag);
            uploadTask.on(
                'state_changed',
                (snapshot) => {},
                (error) => {
                    console.error('Error uploading file:', error);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('File uploaded. Download URL:', downloadURL);
                        await updateDoc(doc(db, 'chats', data.chatId), {
                            messages: arrayUnion({
                                id: uuid(),
                                senderId: curruser.uid,
                                date: Timestamp.now(),
                                img: downloadURL,
                            }),
                        });
                    } catch (uploadError) {
                        console.error('Error during download URL or Firestore update:', uploadError);
                    }
                }
            );
        } else {
            try {
                await updateDoc(doc(db, 'chats', data.chatId), {
                    messages: arrayUnion({
                        id: uuid(),
                        text:text,
                        senderId: curruser.uid,
                        date: Timestamp.now(),
                    }),
                });
            } catch (error) {
                console.error('Error during Firestore update:', error);
            }
        }
        await updateDoc(doc(db,"userChats",curruser.uid),{
            [data.chatId+".lastMessage"]:{
                text
            },
            [data.chatId+".date"]:serverTimestamp(),

        })
        await updateDoc(doc(db,"userChats",data.user.uid),{
            [data.chatId+".lastMessage"]:{
                text
            },
            [data.chatId+".date"]:serverTimestamp(),

        })
        setText("")
        setImag(null)
    }

    return (
        <div className='inputot'>
            <input type='text' placeholder='Write a text' onChange={(e) => setText(e.target.value)} value={text} />
            <div className='send'>
                <img src={Attach} />
                <input type='file' id='file' style={{ display: 'none' }} onChange={(e) => setImag(e.target.files[0])} />
                <label htmlFor='file'>
                    <img src={Img} />
                </label>
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}

export default Input;