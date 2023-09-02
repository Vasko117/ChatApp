import React, {useContext, useEffect, useState} from 'react';
import Add from './image/addAvatar.png';
import Add1
    from "./image/Testot.png";
import Add2
    from "./image/Srce.png";
import {AuthContext} from "./context/AuthContext";
import {arrayUnion, doc, getDoc, onSnapshot, setDoc, Timestamp, updateDoc,deleteField,arrayRemove } from "firebase/firestore";
import {db, storage} from "./firebase";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {v4 as uuid} from "uuid";
import moment from "moment";

function HomePage(props) {
    const [text, setText] = useState('');
    const [fileot, setFileot] = useState(null);
    const { curruser } = useContext(AuthContext);
    const [post, setPost] = useState([]);
    const [profilepost, setProfilepost] = useState([]);
    const [likeStatus, setLikeStatus] = useState({});
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
                    postItem.uid === po.uid
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
    const handledelete = async (po) => {
        const postRef = doc(db, "posts", "homepagepostovi");
        const profileRef = doc(db, "profilepages", curruser.uid);
        let itemtoremove=null

        try {
            // Remove the element from both collections
            await updateDoc(postRef, {
                "postovi": arrayRemove(po)
            });

            profilepost.filter((pro)=>(
                pro.text===po.text
            )).map((pro)=>(
                itemtoremove=pro
                )
            )
            await updateDoc(profileRef, {
                profileinfos: arrayRemove(itemtoremove)
            })

        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }
    const handlesubmit = async ()=>{
        if(text==='' && fileot===null)
        {
            return
        }
        const res=await getDoc(doc(db,"posts","homepagepostovi"))
        if(!res.exists())
        {
            await setDoc(doc(db,"posts","homepagepostovi"),{postovi:[]})
        }
        const res2=await getDoc(doc(db,"profilepages",curruser.uid))
        if(!res2.exists())
        {
            await setDoc(doc(db,"profilepages",curruser.uid),{profileinfos:[]})
        }
        if(fileot)
        {
            const storageRef = ref(storage, uuid());
            const uploadTask = uploadBytesResumable(storageRef, fileot);
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
                        await updateDoc(doc(db, 'posts', "homepagepostovi"), {
                            postovi: arrayUnion({
                                uid: uuid(),
                                senderId:curruser.uid,
                                displayName: curruser.displayName,
                                text:text,
                                count:0,
                                liked:false,
                                img:downloadURL,
                                photoURL: curruser.photoURL,
                                date:Timestamp.now()
                            }),
                        });
                        await updateDoc(doc(db, 'profilepages', curruser.uid), {
                            profileinfos: arrayUnion({
                                uid: uuid(),
                                senderId:curruser.uid,
                                displayName: curruser.displayName,
                                text:text,
                                count:0,
                                liked:false,
                                img:downloadURL,
                                photoURL: curruser.photoURL,
                                date:Timestamp.now()
                            }),
                        });
                    } catch (uploadError) {
                        console.error('Error during download URL or Firestore update:', uploadError);
                    }
                }
            );
        }
        else
        {
            await updateDoc(doc(db, 'posts', "homepagepostovi"), {
                postovi: arrayUnion({
                    uid: uuid(),
                    displayName: curruser.displayName,
                    senderId:curruser.uid,
                    text:text,
                    liked:false,
                    count:0,
                    photoURL: curruser.photoURL,
                    date:Timestamp.now()
                }),
            });
            await updateDoc(doc(db, 'profilepages', curruser.uid), {
                profileinfos: arrayUnion({
                    uid: uuid(),
                    senderId:curruser.uid,
                    displayName: curruser.displayName,
                    text:text,
                    liked:false,
                    count:0,
                    photoURL: curruser.photoURL,
                    date:Timestamp.now()
                }),
            });
        }
        console.log(post)
        setText("")
        setFileot(null)
    }
    return (
        <div className='homepage'>
           <div className="borderhomepage">
               <div className='homepage2'>
                   <div className='spanslika'>
                       <img src={curruser.photoURL} className='searchimg'/>
                       <span><b>{curruser.displayName}</b></span>
                   </div>
                   <input type='text' placeholder='Write a post' onChange={(e)=>{setText(e.target.value)}} value={text}/>
                   <input style={{display:"none"}} type='file' id='file' onChange={(e)=>{setFileot(e.target.files[0])}} />
                   <label htmlFor='file'>
                       <img id='adnigo' src={Add} alt='' className='fileinputhomepage' />
                   </label>
                   <button onClick={handlesubmit}>Post</button>
               </div>
           </div>
            {post && post.sort((b,a)=>a.date-b.date).map((po)=>(
                <div className="borderhomepage2" key={po.uid}>
                    <div className="postdetails">
                        <div className="spanslika">
                            <img src={po.photoURL} className='searchimg'/>
                        </div>
                        <div className="datenname">
                            <span><b>{po.displayName}</b></span>
                            <span>{moment(po.date.toDate()).calendar()}</span>
                        </div>
                    </div>
                    <div className="postcontent">
                        {po.text}
                        {po.img && <img src={po.img} alt="Posted Image" className='postimage'/>}
                        <div className="postbutton">
                            {!po.liked && <button onClick={() => handlelikes(po)}>Like</button>}
                            {po.liked && <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => handlelikes(po)}>Unlike</button>}
                            <span>Likes: {po.count}</span>
                            {po.senderId===curruser.uid && <button onClick={()=>handledelete(po)}>Delete</button>}
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default HomePage;