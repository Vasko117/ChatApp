import React, {useContext, useEffect, useState} from 'react';
import Add from './image/addAvatar.png';
import Add1
    from "./image/Testot.png";
import Add2
    from "./image/Srce.png";
import {AuthContext} from "./context/AuthContext";
import {
    arrayUnion,
    doc,
    getDoc,
    onSnapshot,
    setDoc,
    Timestamp,
    updateDoc,
    deleteField,
    arrayRemove,
    deleteDoc,
    collection, where, query, getDocs
} from "firebase/firestore";
import {db, storage} from "./firebase";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {v4 as uuid} from "uuid";
import moment from "moment";
import {useNavigate} from "react-router-dom";
import {ChatContext} from "./context/ChatContext";

function HomePage(props) {
    const nav=useNavigate()
    const [text, setText] = useState('');
    const [fileot, setFileot] = useState(null);
    const { curruser } = useContext(AuthContext);
    const [post, setPost] = useState([]);
    const [profilepost, setProfilepost] = useState([]);
    const [likesarray, setLikesarray] = useState([]);
    const [uniqot, setUniqot] = useState("");
    const {dispatch}=useContext(ChatContext)
    const [user, setUser] = useState(null);
    useEffect(() => {
        try {
            const updateLikes = async () => {
                for (const postche of post) {
                    try {
                        const res = await getDoc(doc(db, "likes", postche.uid + curruser.uid));
                        if (!res.exists()) {
                            await setDoc(doc(db, "likes", postche.uid + curruser.uid), {
                                uid: curruser.uid,
                                liked: false,
                                text: postche.text,
                                id: postche.uid
                            });
                        }
                    } catch (error) {
                        console.log("Error updating likes:", error);
                    }
                }
            };
            updateLikes();
        } catch (err) {
            console.log("Tuka e problemot");
        }
    }, [curruser.uid, post]);
    useEffect(() => {
        try {
            const likesCollectionRef = collection(db, "likes");
            const unsub = onSnapshot(likesCollectionRef, (querySnapshot) => {
                const likesojArray = [];
                querySnapshot.forEach((doc) => {
                    likesojArray.push(doc.data());
                });
                setLikesarray(likesojArray);
            });
            return () => {
                unsub();
            };
        } catch (err) {
            console.log("Error in useEffect:", err);
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


    const handleLikes = async (po) => {
        const postRef = doc(db, "posts", "homepagepostovi");
        const postRef2 = doc(db, "profilepages", curruser.uid);
        try {
            const docRef = doc(db, 'likes', po.uid+curruser.uid); // Replace 'uniqot' with the document ID you want to fetch
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                let currentUserLikeStatus = data.liked;
                console.log('Current Like Status:', currentUserLikeStatus);
                await updateDoc(docRef, {
                        liked:!currentUserLikeStatus
                });
                currentUserLikeStatus = data.liked;
                let debook = likesarray.find((book) => book.id === po.uid && book.uid === curruser.uid);
                await updateDoc(postRef, {
                    "postovi": post.map((postItem) =>
                        postItem.uid === po.uid
                            ? { ...postItem, count: (postItem.count || 0) + (debook.liked ? -1 : 1), }
                            : postItem
                    ),
                });
                // const profileQuery = query(collection(db, 'profilepages'),where("profileinfos", "array-contains", { uid: po.uid }));
                // const querySnapshot = await getDocs(profileQuery);
                // if (querySnapshot.empty) {
                //     console.log("No documents found matching the query.");
                // }
                // console.log("VLaga")
                // querySnapshot.forEach(async (doc) => {
                //     console.log("VLaga2")
                //     const profileinfos = doc.data().profileinfos;
                //     const postRef3 = doc(db, "profilepages", doc.id);
                //     await updateDoc(postRef3, {
                //         "profileinfos": profileinfos.map((propostItem) =>
                //             propostItem.uid === po.uid
                //                 ? { ...propostItem, count: (propostItem.count || 0) + (debook.liked ? -1 : 1), }
                //                 : propostItem
                //         ),
                //     });
                //
                // });


                // await updateDoc(postRef2, {
                //     "profileinfos": profilepost.map((propostItem) =>
                //         propostItem.uid === po.uid
                //             ? { ...propostItem, count: (propostItem.count || 0) + (debook.liked ? -1 : 1), }
                //             : propostItem
                //     ),
                // });
            }

        } catch (error) {
            console.error('Error updating likes:', error);
        }
    };



    const handledelete = async (po) => {
        const postRef = doc(db, "posts", "homepagepostovi"); // Reference to the document containing the post collection


        const profileRef = doc(db, "profilepages", curruser.uid); // Reference to the document containing the profileinfos collection

        let itemtoremove = null;

        try {
            // Remove the element from both collections
            await updateDoc(postRef, {
                "postovi": arrayRemove(po)
            });

            profilepost.filter((pro) => (
                pro.text === po.text
            )).map((pro) => (
                    itemtoremove = pro
                )
            );
            await updateDoc(profileRef, {
                profileinfos: arrayRemove(itemtoremove)
            });

            const likesCollectionRef = collection(db, "likes");
            const q = query(likesCollectionRef, where("id", "==", po.uid));

            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (docSnapshot) => {
                const docRef = doc(db, "likes", docSnapshot.id);
                console.log(docSnapshot.id)
                console.log("Deleting docRef:", docRef);

                await deleteDoc(docRef);
            });

            console.log("Documents deleted successfully.");
        } catch {
            console.error("Error deleting post:");
        }
    };

    const handlesubmit = async ()=>{
        setUniqot(uuid())
        if(uniqot==="")
        {
            setUniqot(uuid())
        }
        if (typeof uniqot === "string" && uniqot.trim() !== "") {

        }
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

        if(uniqot)
        {
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
                                    uid: uniqot,
                                    senderId:curruser.uid,
                                    displayName: curruser.displayName,
                                    text:text,
                                    count:0,
                                    liked: false,
                                    img:downloadURL,
                                    photoURL: curruser.photoURL,
                                    date:Timestamp.now()
                                }),
                            });
                            await updateDoc(doc(db, 'profilepages', curruser.uid), {
                                profileinfos: arrayUnion({
                                    uid: uniqot,
                                    senderId:curruser.uid,
                                    displayName: curruser.displayName,
                                    text:text,
                                    count:0,
                                    liked: false,
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
                        uid: uniqot,
                        displayName: curruser.displayName,
                        senderId:curruser.uid,
                        text:text,
                        liked: false,
                        count:0,
                        photoURL: curruser.photoURL,
                        date:Timestamp.now()
                    }),
                });
                await updateDoc(doc(db, 'profilepages', curruser.uid), {
                    profileinfos: arrayUnion({
                        uid: uniqot,
                        senderId:curruser.uid,
                        displayName: curruser.displayName,
                        text:text,
                        liked: false,
                        count:0,
                        photoURL: curruser.photoURL,
                        date:Timestamp.now()
                    }),
                });
            }
            setText("")
            setFileot(null)
        }
    }
    const handleprofile=()=>{
        nav('/profile')
    }
    const handleSearch = async (po) => {
        try {
            const q = query(collection(db, 'users'), where("displayName", "==", po.displayName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setUser(doc.data());
                });

                // Reset error state if user is found
            }
            console.log(user)
            if(user)
            {
                dispatch({type:"CHANGE_USER",payload:user})
                nav('/profilefriends')
            }
        } catch (error) {
            console.error('Error during search:', error);
        }
    }
    return (
        <div className='homepage'>
           <div className="borderhomepage">
               <div className='homepage2'>
                   <div className='spanslika'>
                       <img src={curruser.photoURL} onClick={handleprofile} className='searchimg'/>
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
                            <img src={po.photoURL} onClick={()=>handleSearch(po)} className='searchimg'/>
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
                            {likesarray.some((book) => book.id === po.uid) ? (
                                likesarray.find((book) => book.id === po.uid && book.uid===curruser.uid)?.liked ? (
                                    <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => handleLikes(po)}>Unlike</button>
                                ) : (
                                    <button onClick={() => handleLikes(po)}>Like</button>
                                )
                            ) : (
                                <button onClick={() => handleLikes(po)}>Like</button>
                            )}
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