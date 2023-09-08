import Register from "./Register";
import Login from "./Login";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {useContext} from "react";
import {AuthContext} from "../../untitled19/src/context/AuthContext";
import HomePage from "./HomePage";
import Sidebar from "./Sidebar";
import Chats from "./Chats";
import UserProfilePages from "./UserProfilePages";
import FriendsProfilePages from "./FriendsProfilePages";
function App() {
  const{curruser}=useContext(AuthContext)
  return (
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={curruser ?
                <div className='home'>
                  <div className='container'>
                    <HomePage/>
                    <Sidebar/>
                  </div>
                </div>:<Login/>}/>
            <Route exact path="chats" element={curruser ?
                <div className='home'>
                  <div className='container'>
                    <Chats/>
                    <Sidebar/>
                  </div>
                </div>:<Login/>}/>
              <Route exact path="profile" element={curruser ?
                  <div className='home'>
                      <div className='container'>
                          <UserProfilePages/>
                          <Sidebar/>
                      </div>
                  </div>:<Login/>}/>
              <Route exact path="profilefriends" element={curruser ?
                  <div className='home'>
                      <div className='container'>
                          <FriendsProfilePages/>
                          <Sidebar/>
                      </div>
                  </div>:<Login/>}/>
            <Route exact path="login" element={<Login/>}/>
            <Route exact path="register" element={<Register/>}/>
          </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;
