import React, { useState } from "react";
import "./CSS/Profile.css";
import "./CSS/App.css"
import { showSuccess, showError } from "./toast";
import { isValidPassword } from "../utils/passwordValidation";
import config from "../config";
export default function ForgotPasswordModal({ show, onClose }) {
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
   const [showPassword, setShowPassword] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  

  if (!show) return null;

  return (
    <div className="profile-modal-bg">
      <form
        className="profile-modal-form"
        onSubmit={async e => {
          e.preventDefault();
          if (forgotStep === 1) {
            // Request OTP
            const res = await fetch(`${config.BACKEND_API}/user/forgot-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: forgotEmail }),
            });
            const data = await res.json();
            if (res.ok) {
              setForgotStep(2);
              setForgotMsg("OTP sent to your email.");
            } else {
              setForgotMsg(data.error || "Failed to send OTP.");
            }
          } else if (forgotStep === 2) {
            // Verify OTP and set new password
            if (!isValidPassword(forgotNewPass)) {
              setForgotMsg("Password must be at least 8 characters, include a number and a special character.");
              showError("Password must be at least 8 characters, include a number and a special character.");
              return;
            }
            const res = await fetch(`${config.BACKEND_API}/user/reset-password`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, password: forgotNewPass }),
            });
            const data = await res.json();
            if (res.ok) {
              setForgotMsg("Password changed successfully!");
              showSuccess("Password changed successfully!");
              setTimeout(() => {
                onClose();
                setForgotStep(1);
                setForgotEmail("");
                setForgotOtp("");
                setForgotNewPass("");
                setForgotMsg("");
              }, 1500);
            } else {
              setForgotMsg(data.error || "Failed to reset password.");
              showError(data.error || "Failed to reset password.");
            }
          }
        }}
      >
        <h3>Forgot Password</h3>
        {forgotStep === 1 ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="profile-btn profile-btn-save"
            >
              Send OTP
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={forgotOtp}
              onChange={e => setForgotOtp(e.target.value)}
              required
            />
            <div className="password-wrapper">
              <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={forgotNewPass}
              onChange={e => setForgotNewPass(e.target.value)}
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
            
            <button
              type="submit"
              className="profile-btn profile-btn-save"
            >
              Reset Password
            </button>
          </>
        )}
        {forgotMsg && <div className="profile-forgot-msg">{forgotMsg}</div>}
        <button
          type="button"
          className="profile-btn profile-btn-cancel"
          onClick={() => {
            onClose();
            setForgotStep(1);
            setForgotMsg("");
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}