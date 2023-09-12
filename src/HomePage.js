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
    const [reply, setReply] = useState('');
    const [fileot, setFileot] = useState(null);
    const [novfile, setNovfile] = useState(null);
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
                let dali=false
                let idto=""
                const profileQuery = collection(db, 'profilepages');
                onSnapshot(profileQuery, (querySnapshot) => {
                    querySnapshot.forEach(async (docsnapshot) => {
                        const profileinfos = docsnapshot.data().profileinfos;
                        profileinfos.map(prost=>{
                            if(prost.uid===po.uid)
                            {
                                console.log("GO najde")
                                dali=true
                                idto=docsnapshot.id;
                                console.log(dali)
                                console.log(idto)
                                console.log(prost.uid)
                            }
                        })
                    });
                });

                setTimeout(async () => {
                    if (dali) {
                        console.log("VLAGA")
                        const postRef3 = doc(db, "profilepages", idto);
                        const docSnapshot = await getDoc(postRef3);

                        if (docSnapshot.exists()) {
                            console.log("VLAGA")
                            const data = docSnapshot.data();
                            const profileinfos = data.profileinfos;
                            await updateDoc(postRef3, {
                                "profileinfos": profileinfos.map((propostItem) =>
                                    propostItem.uid === po.uid
                                        ? {...propostItem, count: (propostItem.count || 0) + (debook.liked ? -1 : 1)}
                                        : propostItem
                                ),
                            });
                        }
                    }
                },1000)
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
                                    dalidolenborder:false,
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
                                    dalidolenborder:false,
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
                        dalidolenborder:false,
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
                        dalidolenborder:false,
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

     const handlereplys= async(po)=> {
        const postRef2 = doc(db, "posts", "homepagepostovi");
        await updateDoc(postRef2, {
            "postovi": post.map((propostItem) =>
                propostItem.uid === po.uid
                    ? {...propostItem, liked: true}
                    : propostItem
            ),
        });

    }

    const handlesend= async(po)=> {
        if(!reply && !novfile)
        {
            console.log("Kurtashak")
            const postRef = doc(db, "posts", "homepagepostovi");
            await updateDoc(postRef, {
                "postovi": post.map((propostItem) =>
                    propostItem.uid === po.uid
                        ? {...propostItem, liked: false}
                        : propostItem
                ),
            });
            return
        }
        const postRef2 = doc(db, "posts", "homepagepostovi");

        try {
            if(!novfile)
            {
                if(reply)
                {
                    const postDoc = await getDoc(postRef2);
                    if (postDoc.exists()) {
                        const postData = postDoc.data();
                        const updatedPostovi = postData.postovi.map((propostItem) => {
                            if (propostItem.uid === po.uid) {
                                // Initialize replyArray if it doesn't exist
                                const replyArray = propostItem.replyArray || [];

                                // Modify the post with the new reply
                                const updatedReplyArray = [
                                    ...replyArray,
                                    {
                                        senderId: curruser.uid,
                                        displayName: curruser.displayName,
                                        text: reply,
                                        photoURL: curruser.photoURL,
                                        date: Timestamp.now(),
                                    },
                                ];

                                return {
                                    ...propostItem,
                                    liked: false,
                                    replyArray: updatedReplyArray,
                                };
                            }
                            return propostItem;
                        });

                        // Update the document with the modified postovi array
                        await updateDoc(postRef2, { postovi: updatedPostovi });
                    }
                    let dali=false
                    let idto=""
                    const profileQuery = collection(db, 'profilepages');
                    onSnapshot(profileQuery, (querySnapshot) => {
                        querySnapshot.forEach(async (docsnapshot) => {
                            const profileinfos = docsnapshot.data().profileinfos;
                            profileinfos.map(prost=>{
                                if(prost.uid===po.uid)
                                {
                                    console.log("GO najde")
                                    dali=true
                                    idto=docsnapshot.id;
                                    console.log(dali)
                                    console.log(idto)
                                    console.log(prost.uid)
                                }
                            })
                        });
                    });

                    setTimeout(async () => {
                        if (dali) {
                            console.log("VLAGA")
                            const postRef3 = doc(db, "profilepages", idto);
                            const docSnapshot = await getDoc(postRef3);

                            if (docSnapshot.exists()) {
                                console.log("VLAGA")
                                const data = docSnapshot.data();
                                const profileinfosss = data.profileinfos;
                                const updatedPostovi = profileinfosss.map((propostItem) => {
                                    if (propostItem.uid === po.uid) {
                                        // Initialize replyArray if it doesn't exist
                                        const replyArray = propostItem.replyArray || [];

                                        // Modify the post with the new reply
                                        const updatedReplyArray = [
                                            ...replyArray,
                                            {
                                                senderId: curruser.uid,
                                                displayName: curruser.displayName,
                                                text: reply,
                                                photoURL: curruser.photoURL,
                                                date: Timestamp.now(),
                                            },
                                        ];

                                        return {
                                            ...propostItem,
                                            liked: false,
                                            replyArray: updatedReplyArray,
                                        };
                                    }
                                    return propostItem;
                                });
                                await updateDoc(postRef3, { profileinfos: updatedPostovi });

                            }
                        }
                    },100)
                    setReply('')
                }

            }
            if(novfile)
            {
                console.log("FILEOT@POSTOIIII")
                const storageRef = ref(storage, uuid());
                const uploadTask = uploadBytesResumable(storageRef, novfile);
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {},
                    (error) => {
                        console.error('Error uploading file:', error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            const postDoc = await getDoc(postRef2);
                            if (postDoc.exists()) {
                                const postData = postDoc.data();
                                const updatedPostovi = postData.postovi.map((propostItem) => {
                                    if (propostItem.uid === po.uid) {
                                        // Initialize replyArray if it doesn't exist
                                        const replyArray = propostItem.replyArray || [];

                                        // Modify the post with the new reply
                                        const updatedReplyArray = [
                                            ...replyArray,
                                            {
                                                senderId: curruser.uid,
                                                displayName: curruser.displayName,
                                                text: reply,
                                                img:downloadURL,
                                                photoURL: curruser.photoURL,
                                                date: Timestamp.now(),
                                            },
                                        ];

                                        return {
                                            ...propostItem,
                                            liked: false,
                                            replyArray: updatedReplyArray,
                                        };
                                    }
                                    return propostItem;
                                });

                                // Update the document with the modified postovi array
                                await updateDoc(postRef2, { postovi: updatedPostovi });
                            }
                            let dali=false
                            let idto=""
                            const profileQuery = collection(db, 'profilepages');
                            onSnapshot(profileQuery, (querySnapshot) => {
                                querySnapshot.forEach(async (docsnapshot) => {
                                    const profileinfos = docsnapshot.data().profileinfos;
                                    profileinfos.map(prost=>{
                                        if(prost.uid===po.uid)
                                        {
                                            console.log("GO najde")
                                            dali=true
                                            idto=docsnapshot.id;
                                            console.log(dali)
                                            console.log(idto)
                                            console.log(prost.uid)
                                        }
                                    })
                                });
                            });

                            setTimeout(async () => {
                                if (dali) {
                                    console.log("VLAGA")
                                    const postRef3 = doc(db, "profilepages", idto);
                                    const docSnapshot = await getDoc(postRef3);

                                    if (docSnapshot.exists()) {
                                        console.log("VLAGA")
                                        const data = docSnapshot.data();
                                        const profileinfosss = data.profileinfos;
                                        const updatedPostovi = profileinfosss.map((propostItem) => {
                                            if (propostItem.uid === po.uid) {
                                                // Initialize replyArray if it doesn't exist
                                                const replyArray = propostItem.replyArray || [];

                                                // Modify the post with the new reply
                                                const updatedReplyArray = [
                                                    ...replyArray,
                                                    {
                                                        senderId: curruser.uid,
                                                        displayName: curruser.displayName,
                                                        img:downloadURL,
                                                        text: reply,
                                                        photoURL: curruser.photoURL,
                                                        date: Timestamp.now(),
                                                    },
                                                ];

                                                return {
                                                    ...propostItem,
                                                    liked: false,
                                                    replyArray: updatedReplyArray,
                                                };
                                            }
                                            return propostItem;
                                        });
                                        await updateDoc(postRef3, { profileinfos: updatedPostovi });

                                    }
                                }
                            },100)
                            setReply('')
                            setNovfile(null);
                        } catch (uploadError) {
                            console.error('Error during download URL or Firestore update:', uploadError);
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Error updating postovi:", error);
        }
    }

    const handlecancel=async (po) => {
        const postRef = doc(db, "posts", "homepagepostovi");
        await updateDoc(postRef, {
            "postovi": post.map((propostItem) =>
                propostItem.uid === po.uid
                    ? {...propostItem, liked: false}
                    : propostItem
            ),
        });
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
                   <button onClick={handlesubmit} >Post</button>
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
                            <div className="dolen">

                            </div>
                            {likesarray.some((book) => book.id === po.uid) ? (
                                likesarray.find((book) => book.id === po.uid && book.uid===curruser.uid)?.liked ? (
                                    <button style={{ backgroundColor: '#457373', color: 'white' }} onClick={() => handleLikes(po)}>Unlike</button>
                                ) : (
                                    <button onClick={() => handleLikes(po)}>Like</button>
                                )
                            ) : (
                                <button onClick={() => handleLikes(po)}>Like</button>
                            )}
                            <span>Likes: {po.count}</span>
                            {po.senderId===curruser.uid && <button onClick={()=>handledelete(po)}>Delete</button>}
                            <button onClick={()=>handlereplys(po)}>Reply</button>
                            <div className="dolen">

                            </div>
                            {po.liked &&
                                <div className="postreply">
                                    <div className='spanslika'>
                                        <img src={curruser.photoURL} onClick={handleprofile} className='searchimg2'/>
                                    </div>
                                    <input type='text' placeholder='Reply' onChange={(e)=>{setReply(e.target.value)}} value={reply}/>
                                    <input style={{display:"none"}} type='file' id='file2' onChange={(e)=>{setNovfile(e.target.files[0])}} />
                                    <label htmlFor='file2'>
                                        <img id='adnigo' src={Add} alt='' className='fileinputhomepage' />
                                    </label>
                                    <button onClick={()=>handlecancel(po)} >Cancel</button>
                                    <button onClick={()=>handlesend(po)} >Send</button>
                                </div> }

                        </div>
                        {po.replyArray && po.replyArray.sort((b,a)=>a.date-b.date).reverse().map(rep=>(
                            <div className="replyot">
                                <img src={rep.photoURL} onClick={()=>handleSearch(rep)} className='searchimg2'/>
                                <div className="chatbubble">
                                    <span><b>{rep.displayName}</b></span>
                                    {rep.text && <p>{rep.text}</p>}
                                    {rep.img && <img src={rep.img} alt="Image" className='postimage2'/>}
                                    <span className='datereply'>{moment(rep.date.toDate()).calendar()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            ))}
        </div>
    );
}

export default HomePage;