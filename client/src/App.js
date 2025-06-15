import React, { useState, useEffect,useRef } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import NewsFeed from "./components/NewsFeed";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Profile from "./components/Profile";
import LikedArticles from "./components/LikedArticles";
import BookmarkedArticles from "./components/BookmarkedArticles";
import DarkModeToggle from "./components/DarkModeToggle";
import { ToastContainer } from "react-toastify";
import ChatBot from "./components/ChatBot";

// import PaymentButton from './components/PaymentButton';
function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [category, setCategory] = useState("Home");
  const [search, setSearch] = useState("");
  const chatBotRef = useRef();
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("darkMode") === "true";
});
const handleChatBotRequest = (msg) => {
    if (chatBotRef.current && chatBotRef.current.receiveExternalMessage) {
      chatBotRef.current.receiveExternalMessage(msg);
    }
  };
  
 
useEffect(() => {
  // Check login status on mount
  fetch("http://localhost:8000/user/me", {
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      setIsLoggedIn(data.loggedIn);
      setChecking(false);
    })
    .catch(() => setChecking(false));
}, []);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("newuser") === "1") {
    localStorage.setItem("showWelcomeAlert", "1");
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

useEffect(() => {
  if (localStorage.getItem("showWelcomeAlert") === "1") {
    alert("Welcome to Newsly! Your current password is 123456. We recommend you change it from the profile section.");
    localStorage.removeItem("showWelcomeAlert");
  }
}, []);
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  if (checking) return <div>Loading...</div>;

  return (
    <div className={darkMode ? "dark" : ""}>
      <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
       <ToastContainer position="top-right" autoClose={2500} />
      {/* ...rest of your app... */}
    
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <div className="main-container">
                <div className="switcher">
                  <button onClick={() => setShowLogin(true)} className={showLogin ? "active" : ""}>Login</button>
                  <button onClick={() => setShowLogin(false)} className={!showLogin ? "active" : ""}>Sign Up</button>
                </div>
                {showLogin
                  ? <Login onLogin={() => setIsLoggedIn(true)} />
                  : <Signup onSignup={() => setShowLogin(true)} />}
              </div>
            ) : (
              <Navigate to="/feed" />
            )
          }
              />
            <Route
        path="/feed"
        element={
          isLoggedIn ? (
            <NewsFeed
              category={category}
              setCategory={setCategory}
              search={search}
              setSearch={setSearch}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onChatBotRequest={handleChatBotRequest}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isLoggedIn ? (
            <Profile
              category={category}
              setCategory={setCategory}
              search={search}
              setSearch={setSearch}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/liked"
        element={
          isLoggedIn ? (
            <LikedArticles
              category={category}
              setCategory={setCategory}
              search={search}
              setSearch={setSearch}
              onChatBotRequest={handleChatBotRequest}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/bookmarks"
        element={
          isLoggedIn ? (
            <BookmarkedArticles
              category={category}
              setCategory={setCategory}
              search={search}
              setSearch={setSearch}
              onChatBotRequest={handleChatBotRequest}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/" />} />
        <Route path="/liked" element={isLoggedIn ? <LikedArticles /> : <Navigate to="/" />} />
        <Route path="/bookmarks" element={isLoggedIn ? <BookmarkedArticles /> : <Navigate to="/" />} />
      </Routes>
    </Router>
    {isLoggedIn && (
      <ChatBot
      ref={chatBotRef}
        onSend={async (message) => {
          const res = await fetch('http://localhost:8000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
            credentials: 'include'
          });
          const data = await res.json();
          return data.response || "Sorry, I couldn't process that.";
        }}
      />
    )}
    {/* <div>
        {isLoggedIn&&(
            <div>
          <h2>Welcome to Payments</h2>
          <PaymentButton />
        </div>
      )}
      </div> */}
      </div>
      
      
  );
}

export default App;