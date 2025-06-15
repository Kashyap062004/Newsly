import React, { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import NewsFeed from "./NewsFeed";


function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

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

  if (checking) return <div>Loading...</div>;

  return (
    <>
      {!isLoggedIn ? (
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
        <div>
          <NewsFeed />
        </div>
      )}
    </>
  );
}

export default App;