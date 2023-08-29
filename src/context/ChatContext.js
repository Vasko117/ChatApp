import {createContext, useContext, useEffect, useReducer, useState} from "react";
import {auth} from '../firebase'
import {onAuthStateChanged} from 'firebase/auth'
import {AuthContext} from "./AuthContext";
export const ChatContext=createContext()
// eslint-disable-next-line react-hooks/rules-of-hooks
export const ChatContextProvider=({children})=> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {curruser} = useContext(AuthContext);
    const INITIAL_STATE={
        chatID:null,
        user:{}
    }
    const chatReducer=(state,action)=>{
        switch(action.type){
            case "CHANGE_USER":
                return{
                    user:action.payload,
                    chatId: curruser.uid>action.payload.uid ? curruser.uid+action.payload.uid:action.payload.uid+curruser.uid
                }
            default:
                return state
        }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state,dispatch]=useReducer(chatReducer,INITIAL_STATE)
    return (
        <ChatContext.Provider value={{data:state,dispatch}}>
            {children}
        </ChatContext.Provider>
    )
}