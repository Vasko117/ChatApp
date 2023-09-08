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
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import {db} from "./firebase";
import moment from "moment/moment";

function UserProfilePage(props) {
    const {curruser}=useContext(AuthContext)
    const [profilepost, setProfilepost] = useState([]);
    const [likesarray, setLikesarray] = useState([]);

    const [post, setPost] = useState([]);
    const [likeStatus, setLikeStatus] = useState({});
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
                        propostItem.text === po.text
                            ? { ...propostItem, count: (propostItem.count || 0) + (debook.liked ? -1 : 1), }
                            : propostItem
                    ),
                });
            }

        } catch (error) {
            console.error('Error updating likes:', error);
        }
    };
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
                            {likesarray.some((book) => book.id === pro.uid) ? (
                                likesarray.find((book) => book.id === pro.uid && book.uid===curruser.uid)?.liked ? (
                                    <button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => handleLikes(pro)}>Unlike</button>
                                ) : (
                                    <button onClick={() => handleLikes(pro)}>Like</button>
                                )
                            ) : (
                                <button onClick={() => handleLikes(pro)}>Like</button>
                            )}
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