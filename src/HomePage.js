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
    const [dali, setDali] = useState(false);
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

        try {
            if(!dali)
            {
                await updateDoc(postRef, {
                    "postovi": post.map((postItem) =>
                        postItem.uid === po.uid
                            ? { ...postItem, count: (postItem.count || 0) + 1 }
                            : postItem
                    ),
                });
                setDali(true)
            }
            else {
                await updateDoc(postRef, {
                    "postovi": post.map((postItem) =>
                        postItem.uid === po.uid
                            ? { ...postItem, count: (postItem.count || 0) - 1 }
                            : postItem
                    ),
                });
                setDali(false)
            }

            // Update the local state to reflect the new count

        } catch (error) {
            console.error("Error updating likes:", error);
        }
    };
    const handledelete= async (po)=>{
        await updateDoc(doc(db,"posts","homepagepostovi"), {
            postovi: arrayRemove(po)
        });
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
                            {!dali && <button onClick={()=>handlelikes(po)}>Like</button>}
                            {dali && <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={()=>handlelikes(po)}>Unlike</button>}
                            <span>{po.count}</span>
                            {po.senderId===curruser.uid && <button onClick={()=>handledelete(po)}>Delete</button>}
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );
}

export default HomePage;