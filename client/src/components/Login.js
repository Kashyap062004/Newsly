import React, { useState } from "react";
import { showSuccess, showError } from "./toast";
import ForgotPasswordModal from "./ForgotPasswordModal"; // <-- import the modal
import "./CSS/App.css"; // <-- import your CSS\
// import { useLocation } from "react-router-dom";


import "./CSS/Profile.css"
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false); // <-- modal state
  

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        showSuccess("Login successful!");
        onLogin();
      } else {
        const data = await res.json();
        showError(data.error || "Login failed");
        setError(data.error || "Login failed");
      }
    } catch {
      showError("Network error");
      setError("Network error");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="show-hide-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button type="submit">Log In</button>
        {error && <div className="error">{error}</div>}
        
       
        <button
          type="button"
          className="login-with-google-btn"
          onClick={() => {
            window.location.href = "http://localhost:8000/user/google";
          }}
        >
          Continue with Google
        </button>

        <button
          type="button"
          className="profile-link profile-btn-forgot"
          style={{ marginTop: "10px" }}
          onClick={() => setShowForgotModal(true)}
        >
          Forgot Password?
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <ForgotPasswordModal
          show={showForgotModal}
          onClose={() => setShowForgotModal(false)}
        />
      )}
    </div>
  );
}

export default Login;