import React, {useContext, useState} from 'react';
import {collection, query, where, getDocs, setDoc, doc,updateDoc,serverTimestamp,getDoc} from "firebase/firestore";
import { db } from './firebase';
import {AuthContext} from "./context/AuthContext";
import {ChatContext} from "./context/ChatContext";
import { useNavigate } from 'react-router-dom';

function Searchbar(props) {
    const nav=useNavigate()
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);
    const [err, setErr] = useState(false);
    const {curruser}=useContext(AuthContext)
    const {dispatch}=useContext(ChatContext)
    const handleSearch = async () => {
        try {
            const q = query(collection(db, 'users'), where("displayName", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setUser(doc.data());
                });

                setErr(false); // Reset error state if user is found
            } else {
                setErr(true);
            }
        } catch (error) {
            console.error('Error during search:', error);
            setErr(true);
        }
    }

    const handleKey = (e) => {
        if (e.code === "Enter") {
            handleSearch();
        }
    }

    const handleSelect=async ()=> {
        const combinedId=curruser.uid>user.uid ? curruser.uid+user.uid:user.uid+curruser.uid
        try {
            const res=await getDoc(doc(db,"chats",combinedId))
            if(!res.exists())
            {
                await setDoc(doc(db,"chats",combinedId),{messages:[]})
                await updateDoc(doc(db,"userChats",curruser.uid),{
                    [combinedId+".userInfo"]:{
                        uid:user.uid,
                        displayName:user.displayName,
                        photoURL:user.photoURL
                    },
                    [combinedId+".date"]:serverTimestamp()
                })
                await updateDoc(doc(db,"userChats",user.uid),{
                    [combinedId+".userInfo"]:{
                        uid:curruser.uid,
                        displayName:curruser.displayName,
                        photoURL:curruser.photoURL
                    },
                    [combinedId+".date"]:serverTimestamp()
                })

            }

        }
        catch (err){

        }
        setUser(null)
        setUsername("")
        dispatch({type:"CHANGE_USER",payload:user})
        nav('/chats')
    }

    return (
        <div className='search'>
            <div className='searchform'>
                <input type='text' className='searchinput' placeholder='find a user' onKeyDown={handleKey} onChange={e => setUsername(e.target.value)} value={username}  />
            </div>
            {err && <span>User not found</span>}
            {user && (
                <div className="userchat" onClick={()=>handleSelect(user)}>
                    <img src={user.photoURL} className='searchimg' alt='User' />
                    <div className="usechatinfo">
                        <span>{user.displayName}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Searchbar;