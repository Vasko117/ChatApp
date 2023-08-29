import React, {useContext, useEffect, useRef} from 'react';
import Add from './image/Testot.png'
import Add1 from './image/Srce.png'
import {AuthContext} from "./context/AuthContext";
import {ChatContext} from "./context/ChatContext";
import {Timestamp} from "firebase/firestore";
import moment from "moment";


function Chat({message}) {
    console.log(message.date)
    const ref=useRef()
    const {curruser}= useContext(AuthContext);
    const {data}= useContext(ChatContext);
    useEffect(()=>{
        ref.current?.scrollIntoView({behavior:"smooth"})
    },[message])
    return (
        <div className={`chatot ${message.senderId===curruser.uid && 'owner'}`}>
            <div className="messageinfo">
                <img src={message.senderId===curruser.uid ? curruser.photoURL:data.user.photoURL}className='prvaslika'/>
                {message.text && <p>{message.text}</p>}
                {message.img && <img className='novaslika' src={message.img}/>}
            </div>
            <div className="messagecontent">
                <span>{moment(message.date.toDate()).calendar()}</span>
            </div>
        </div>
    );
}

export default Chat;