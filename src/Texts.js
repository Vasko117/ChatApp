import React, {useContext, useEffect, useState} from 'react';
import Messages from "./Messages";
import Chat from "./Chat";
import {ChatContext} from "./context/ChatContext";
import {doc, onSnapshot, Timestamp} from "firebase/firestore";
import {db} from "./firebase";

function Texts(props) {
    const [messages, setMessages] = useState([]);
    const {data} = useContext(ChatContext);
    useEffect(()=>{
        try{
            const unsub=onSnapshot(doc(db,"chats",data.chatId),(doc)=>{
                doc.exists() && setMessages(doc.data().messages)
            })
            return()=>{
                unsub()
            }
        }
        catch (err){
            console.log("Tuka e problemot")
        }
    },[data.chatId])
    return (
        <div className='texts'>
            {messages.map((m)=>(
                <Chat message={m} key={m.id}/>
            ))}
        </div>
    );
}

export default Texts;