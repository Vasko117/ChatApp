import React, {useContext, useEffect, useState} from 'react';
import Add
    from "./image/grr.png";

import { doc, onSnapshot } from "firebase/firestore";
import {db} from './firebase'
import {AuthContext} from "./context/AuthContext";
import {ChatContext} from "./context/ChatContext";
import {useNavigate} from "react-router-dom";

function Messages(props) {
    const nav=useNavigate()
    const [chats, setChats] = useState([]);
    const {curruser}=useContext(AuthContext)
    const {dispatch}=useContext(ChatContext)
    useEffect(()=>{
        const getChats=()=>{
            const unsub = onSnapshot(doc(db, "userChats", curruser.uid), (doc) => {
                console.log("Current data: ", doc.data());
                setChats(doc.data())
            });
            return()=>{
                unsub()
            }
        }
        curruser.uid && getChats()
    },[curruser.uid])
    const handleselect=(u)=>{
        dispatch({type:"CHANGE_USER",payload:u})
        nav('/chats')
    }
    return (
        <div className='msg'>
            { chats && Object.entries(chats)?.sort((b,a)=>a[1].date-b[1].date).map((chat)=>(
                <div className="userchat" key={chat[0]} onClick={()=>handleselect(chat[1].userInfo)}>
                    <img src={chat[1].userInfo.photoURL} className='searchimg'/>
                    <div className="usechatinfo">
                        <span>{chat[1].userInfo.displayName}</span>
                        <p>{chat[1].lastMessage?.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Messages;