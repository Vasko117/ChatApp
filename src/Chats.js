import React, {useContext} from 'react';
import Cam from './image/cam.png'
import Add from './image/add.png'
import More from './image/more.png'
import Messages from "../../untitled19/src/Messages";
import Input from "../../untitled19/src/Input";
import Texts from "../../untitled19/src/Texts";
import {ChatContext} from "./context/ChatContext";
function Chats(props) {
    const {data} = useContext(ChatContext);
    return (
        <div className='chat'>
            <div className="chatinfo">
                <span>{data.user?.displayName}</span>
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