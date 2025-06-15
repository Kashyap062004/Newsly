import React, { useState } from "react";
import { showSuccess, showError } from "./toast";
import { isValidPassword } from "../utils/passwordValidation";
function Signup({ onSignup }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
    const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!isValidPassword(form.password)) {
    setError("Password must be at least 8 characters, include a number and a special character.");
    showError("Password must be at least 8 characters, include a number and a special character.");
    return;
  }
    const res = await fetch("http://localhost:8000/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setStep(2);
      setSuccess("OTP sent to your email.");
      showSuccess("OTP sent to your email.");
    } else {
      setError(data.error || "Signup failed");
      showError(data.error || "Signup failed");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("http://localhost:8000/user/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Signup successful! Please login.");
      showSuccess("Signup successful! Please login.");
      setStep(1);
      setForm({ name: "", email: "", password: "" });
      setOtp("");
      onSignup();
    } else {
      setError(data.error || "OTP verification failed");
      showError(data.error || "OTP verification failed");
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      {step === 1 ? (
        <form onSubmit={handleSignup}>
          <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
         <div className="password-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        required
      />
      <button
        type="button"
        className="show-hide-btn"
        onClick={() => setShowPassword(prev => !prev)}
        tabIndex={-1}
      >
        {showPassword ? "Hide" : "Show"}
      </button>
    </div>
          <button type="submit">Sign Up</button>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} required />
          <button type="submit">Verify OTP</button>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
        </form>
      )}
    </div>
  );
}

export default Signup;




