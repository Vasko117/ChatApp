import React, {useContext, useEffect, useState} from 'react';
import Add3 from './image/Testot.png';
import {AuthContext} from "./context/AuthContext";
import {
    arrayRemove,
    collection, deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc, Timestamp,
    updateDoc,
    where
} from "firebase/firestore";
import {db, storage} from "./firebase";
import moment from "moment/moment";
import Add from "./image/addAvatar.png";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {v4 as uuid} from "uuid";

function UserProfilePage(props) {
    const [reply, setReply] = useState('');
    const {curruser}=useContext(AuthContext)
    const [novfile, setNovfile] = useState(null);
    const [profilepost, setProfilepost] = useState([]);
    const [likesarray, setLikesarray] = useState([]);

    const [post, setPost] = useState([]);
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
        const postRef = doc(db, "posts", "homepagepostovi"); // Reference to the document containing the post collection


        const profileRef = doc(db, "profilepages", curruser.uid); // Reference to the document containing the profileinfos collection

        let itemtoremove = null;

        try {
            // Remove the element from both collections
            await updateDoc(profileRef, {
                "profileinfos": arrayRemove(po)
            });
            post.filter((pro) => (
                pro.uid === po.uid
            )).map((pro) => (
                    itemtoremove = pro
                )
            );
            await updateDoc(postRef, {
                postovi: arrayRemove(itemtoremove)
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
                console.log('Updated Like Status:', currentUserLikeStatus);
                console.log(likesarray)
                console.log("po.uid:", po.uid);
                let debook = likesarray.find((book) => book.id === po.uid && book.uid === curruser.uid);
                console.log("debook:", debook);
                await updateDoc(postRef, {
                    "postovi": post.map((postItem) =>
                        postItem.uid === po.uid
                            ? { ...postItem, count: (postItem.count || 0) + (debook.liked ? -1 : 1), }
                            : postItem
                    ),
                });

                await updateDoc(postRef2, {
                    "profileinfos": profilepost.map((propostItem) =>
                        propostItem.uid === po.uid
                            ? { ...propostItem, count: (propostItem.count || 0) + (debook.liked ? -1 : 1), }
                            : propostItem
                    ),
                });
            }

        } catch (error) {
            console.error('Error updating likes:', error);
        }
    };
    const handlereplys= async(po)=> {
        const postRef2 = doc(db, "profilepages", curruser.uid);
        await updateDoc(postRef2, {
            "profileinfos": profilepost.map((propostItem) =>
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
            const postRef = doc(db, "profilepages", curruser.uid);
            await updateDoc(postRef, {
                "profileinfos": post.map((propostItem) =>
                    propostItem.uid === po.uid
                        ? {...propostItem, liked: false}
                        : propostItem
                ),
            });
            return
        }
        const postRef2 = doc(db, "posts", "homepagepostovi");
        const postRef3 = doc(db, "profilepages", curruser.uid);

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
                    const postDoc2 = await getDoc(postRef3);
                    if (postDoc2.exists()) {
                        const postData = postDoc2.data();
                        const updatedPostovi = postData.profileinfos.map((propostItem) => {
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
                        await updateDoc(postRef3, { profileinfos: updatedPostovi });
                    }
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
                            const postDoc2 = await getDoc(postRef3);
                            if (postDoc2.exists()) {
                                const postData = postDoc2.data();
                                const updatedPostovi = postData.profileinfos.map((propostItem) => {
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
                                await updateDoc(postRef3, { profileinfos: updatedPostovi });
                            }
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
        const postRef = doc(db, "profilepages", curruser.uid);
        await updateDoc(postRef, {
            "profileinfos": profilepost.map((propostItem) =>
                propostItem.uid === po.uid
                    ? {...propostItem, liked: false}
                    : propostItem
            ),
        });
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
                            <div className="dolen">

                            </div>
                            {likesarray.some((book) => book.id === pro.uid) ? (
                                likesarray.find((book) => book.id === pro.uid && book.uid===curruser.uid)?.liked ? (
                                    <button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => handleLikes(pro)}>Unlike</button>
                                ) : (
                                    <button onClick={() => handleLikes(pro)}>Like</button>
                                )
                            ) : (
                                <button onClick={() => handleLikes(pro)}>Like</button>
                            )}
                            <span>Likes: {pro.count}</span>
                            {pro.senderId===curruser.uid && <button onClick={()=>handledelete(pro)}>Delete</button>}
                            <button onClick={()=>handlereplys(pro)}>Reply</button>
                            <div className="dolen">

                            </div>
                            {pro.liked &&
                                <div className="postreply">
                                    <div className='spanslika'>
                                        <img src={curruser.photoURL}  className='searchimg2'/>
                                    </div>
                                    <input type='text' placeholder='Reply' onChange={(e)=>{setReply(e.target.value)}} value={reply}/>
                                    <input style={{display:"none"}} type='file' id='file2' onChange={(e)=>{setNovfile(e.target.files[0])}} />
                                    <label htmlFor='file2'>
                                        <img id='adnigo' src={Add} alt='' className='fileinputhomepage' />
                                    </label>
                                    <button onClick={()=>handlecancel(pro)} >Cancel</button>
                                    <button onClick={()=>handlesend(pro)} >Send</button>
                                </div> }
                        </div>
                        {pro.replyArray && pro.replyArray.sort((b,a)=>a.date-b.date).reverse().map(rep=>(
                            <div className="replyot">
                                <img src={rep.photoURL} className='searchimg2'/>
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

export default UserProfilePage;