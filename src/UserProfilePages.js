import React, {useContext, useEffect, useState} from 'react';
import Add3 from './image/Testot.png';
import {AuthContext} from "./context/AuthContext";
import {arrayRemove, doc, onSnapshot, updateDoc} from "firebase/firestore";
import {db} from "./firebase";
import moment from "moment/moment";

function UserProfilePage(props) {
    const {curruser}=useContext(AuthContext)
    const [profilepost, setProfilepost] = useState([]);
    const [post, setPost] = useState([]);
    const [likeStatus, setLikeStatus] = useState({});
    useEffect(() => {
        try {
            const unsub = onSnapshot(doc(db, "posts", "homepagepostovi"), (doc) => {
                setPost(doc.data()?.postovi || []);
            });
            return () => {
                unsub();
            };
        } catch (err) {
            console.log("Tuka e problemot");
        }
    }, []);
    useEffect(() => {
        try {
            const unsub = onSnapshot(doc(db, "profilepages", curruser.uid), (doc) => {
                setProfilepost(doc.data()?.profileinfos || []);
            });
            return () => {
                unsub();
            };
        } catch (err) {
            console.log("Tuka e problemot");
        }
    }, []);
    const handledelete = async (po) => {
        const postRef = doc(db, "posts", "homepagepostovi");
        const profileRef = doc(db, "profilepages", curruser.uid);
        let itemtoremove=null

        try {
            // Remove the element from both collections
            await updateDoc(profileRef, {
                "profileinfos": arrayRemove(po)
            });

            post.filter((pro)=>(
                pro.text===po.text
            )).map((pro)=>(
                    itemtoremove=pro
                )
            )
            await updateDoc(postRef, {
                postovi: arrayRemove(itemtoremove)
            })

        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }
    const handlelikes = async (po) => {
        const postRef = doc(db, "posts", "homepagepostovi");
        const postRef2 = doc(db, "profilepages", curruser.uid);
        try {
            // Toggle the like/unlike status for the specific post
            const updatedLikeStatus = { ...likeStatus };
            if (!updatedLikeStatus[po.uid]) {
                // If it's not liked, mark as liked
                updatedLikeStatus[po.uid] = true;
            } else {
                // If it's liked, mark as unliked
                updatedLikeStatus[po.uid] = false;
            }

            // Update the Firestore document
            await updateDoc(postRef, {
                "postovi": post.map((postItem) =>
                    postItem.text === po.text
                        ? { ...postItem, count: (postItem.count || 0) + (updatedLikeStatus[po.uid] ? 1 : -1) }
                        : postItem
                ),
            });
            await updateDoc(postRef2, {
                "profileinfos": profilepost.map((propostItem) =>
                    propostItem.text === po.text
                        ? { ...propostItem, count: (propostItem.count || 0) + (updatedLikeStatus[po.uid] ? 1 : -1) }
                        : propostItem
                ),
            });


            // Update the local state to reflect the new like/unlike status
            setLikeStatus(updatedLikeStatus);

        } catch (error) {
            console.error("Error updating likes:", error);
        }
    }
    return (
        <div className='userprofilepage'>
            <div className="background">
                <img src={curruser.photoURL} className='deprofilephoto'/>
                <span><b>{curruser.displayName}</b></span>
            </div>
            {profilepost && profilepost.sort((b,a)=>a.date-b.date).map((pro)=>(
                <div className="borderhomepage2" key={pro.uid}>
                    <div className="postdetails">
                        <div className="spanslika">
                            <img src={pro.photoURL} className='searchimg'/>
                        </div>
                        <div className="datenname">
                            <span><b>{pro.displayName}</b></span>
                            <span>{moment(pro.date.toDate()).calendar()}</span>
                        </div>
                    </div>
                    <div className="postcontent">
                        {pro.text}
                        {pro.img && <img src={pro.img} alt="Posted Image" className='postimage'/>}
                        <div className="postbutton">
                            {!likeStatus[pro.uid] && <button onClick={() => handlelikes(pro)}>Like</button>}
                            {likeStatus[pro.uid] && <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => handlelikes(pro)}>Unlike</button>}
                            <span>Likes: {pro.count}</span>
                            {pro.senderId===curruser.uid && <button onClick={()=>handledelete(pro)}>Delete</button>}
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default UserProfilePage;