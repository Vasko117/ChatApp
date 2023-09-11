import React, {useContext} from 'react';
import Cam from './image/cam.png'
import Add from './image/add.png'
import More from './image/more.png'
import Messages from "../../untitled19/src/Messages";
import Input from "../../untitled19/src/Input";
import Texts from "../../untitled19/src/Texts";
import {ChatContext} from "./context/ChatContext";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "./firebase";
import {useNavigate} from "react-router-dom";
function Chats(props) {
    const {data} = useContext(ChatContext);
    const nav=useNavigate()
    return (
        <div className='chat'>
            <div className="chatinfo">
                <span onClick={()=>nav('/profilefriends')}>{data.user?.displayName}</span>
                <div className="chatIcons">
                    <img src={Cam}/>
                    <img src={Add}/>
                    <img src={More}/>
                </div>
            </div>
            <Texts/>
            <Input/>
        </div>
    );
}

export default Chats;