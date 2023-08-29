import React from 'react';
import Navbar from "./Navbar";
import Searchbar from "./Searchbar";
import Chats from "./Chats";
import Messages from "./Messages";

function Sidebar(props) {
    return (
        <div className='sidebar'>
            <Navbar/>
            <Searchbar/>
            <Messages/>
        </div>
    );
}

export default Sidebar;