import React, { useEffect, useState, useRef } from "react";
import TopNavBar from "./TopNavBar";
import { Link } from "react-router-dom";
import "./CSS/Profile.css";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { showSuccess, showError } from "./toast";
import { isValidPassword } from "../utils/passwordValidation";
import PaymentButton from "./PaymentButton";
import config from "../config";
const ALL_CATEGORIES = [
  "India", "World", "Business", "Tech", "Cricket", "Sports", "Entertainment", "Astro", "TV", "Education", "Life & Style"
];
export default function Profile({ category, setCategory, search, setSearch }) {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [stats, setStats] = useState({ liked: 0, bookmarked: 0, read: 0 });
  const fileInputRef = useRef();
  const [showForgotModal, setShowForgotModal] = useState(false);
   const [interests, setInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);
const [showPassword, setShowPassword] = useState({ old: false, new: false });


  


  useEffect(() => {
    fetch(`${config.BACKEND_API}/user/profile`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setNewName(data.name);
        if (data.showWelcome) {
        showSuccess("Welcome to Newsly! Your password is 123456. You can change it from the Profile section.");
      }
      });
       
    
    fetch(`${config.BACKEND_API}/user/stats`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch(`${config.BACKEND_API}/user/avatar`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    setProfile((prev) => ({ ...prev, avatarUrl: data.avatarUrl }));
    setUploading(false);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    const res = await fetch(`${config.BACKEND_API}/user/profile`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    setProfile((prev) => ({ ...prev, name: data.name }));
    setEditMode(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
     if (!isValidPassword(passwords.new)) {
    showError("Password must be at least 8 characters, include a number and a special character.");
    return;
  }
    const res = await fetch(`${config.BACKEND_API}/user/change-password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwords),
    });
    const data = await res.json();
    if (data.success) {
      showSuccess("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswords({ old: "", new: "" });
    } else {
      showError(data.error || "Failed to change password.");
    }
  };
  useEffect(() => {
    fetch(`${config.BACKEND_API}/user/profile`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setNewName(data.name);
        setInterests(data.interests || []);
      });
    // ...existing stats fetch...
  }, []);

  // Handle interest checkbox change
  const handleInterestChange = (cat) => {
    setInterests((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  // Save interests to backend
  // Update handleSaveInterests
const handleSaveInterests = async (e) => {
  e.preventDefault();
  if (interests.length > 0 && interests.length < 3) {
    showError("Please select at least 3 categories.");
    return;
  }
  setSavingInterests(true);
  try {
    const res = await fetch(`${config.BACKEND_API}/user/interests`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests }),
    });
    const data = await res.json();
    if (data.success) {
      showSuccess(interests.length === 0 ? "Successfully unsubscribed " : "Interests updated!");
      setShowInterestsModal(false); // Close modal after success
    } else {
      showError(data.error || "Failed to update interests.");
    }
  } catch (error) {
    showError("Failed to update interests.");
  } finally {
    setSavingInterests(false);
  }
};
const handleUnsubscribe = () => {
  setInterests([]);
  // Trigger form submission with empty interests
  const event = new Event('submit', { cancelable: true });
  document.querySelector('.profile-modal-form').dispatchEvent(event);
};
  if (!profile) return <div className="profile-loading">Loading...</div>;

  return (
    <div>
      <TopNavBar
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        onSearch={() => {}}
      />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <img
              className="profile-avatar"
              src={
                profile.avatarUrl
                  ? `${config.BACKEND_API}` + profile.avatarUrl
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`
              }
              alt="avatar"
            />
            <br />
            <button
              className="profile-avatar-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Change Avatar"}
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Edit Profile Section */}
          <div className="profile-field">
            <b>Name:</b>
            {editMode ? (
              <form onSubmit={handleEditProfile} className="profile-edit-form">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                />
                <button type="submit" className="profile-btn profile-btn-save">
                  Save
                </button>
                <button
                  type="button"
                  className="profile-btn profile-btn-cancel"
                  onClick={() => { setEditMode(false); setNewName(profile.name); }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="profile-value">{profile.name}</span>
                <button
                  className="profile-btn profile-btn-edit"
                  onClick={() => setEditMode(true)}
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <div className="profile-field">
            <b>Email:</b>
            <span className="profile-value">{profile.email}</span>
          </div>

          {/* Statistics */}
          <div className="profile-stats">
            <div>
              <b>
                <Link to="/liked" className="profile-link">
                  Liked Articles:
                </Link>
              </b>
              <span className="profile-stat-num">{stats.liked}</span>
            </div>
            <div>
              <b>
                <Link to="/bookmarks" className="profile-link">
                  Bookmarked Articles:
                </Link>
              </b>
              <span className="profile-stat-num">{stats.bookmarked}</span>
            </div>
            <div>
              <b>Total Articles Read:</b>
              <span className="profile-stat-num">{stats.read}</span>
            </div>
          </div>
          {/* <div className="profile-field">
  <b>Subscription:</b>
  <span className="profile-value">
    {profile.subscribe ? "Active (Unlimited Chatbot)" : "Not Subscribed"}
  </span>
  {!profile.subscribe &&  <PaymentButton email={profile.email}  />}
</div> */}


<div className="profile-field">
  <b>Subscription:</b>
  <span className="profile-value">
    {profile.subscribe
      ? `Active (Unlimited Chatbot)${
          profile.subscriptionExpires
            ? ` — Expires on ${new Date(profile.subscriptionExpires).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}`
            : ""
        }`
      : "Not Subscribed"}
  </span>
  {!profile.subscribe && <PaymentButton email={profile.email} />}
</div>


<div className="profile-field">
  <b>Interested Categories:</b>
  {interests.length === 0 ? (
    <button
      className="profile-btn profile-btn-edit"
      onClick={() => setShowInterestsModal(true)}
    >
      Add Interests
    </button>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span className="profile-value">
        {interests.join(', ')}
      </span>
      <button
        className="profile-btn profile-btn-edit"
        onClick={() => setShowInterestsModal(true)}
      >
        Edit
      </button>
    </div>
  )}
</div>

{/* Add this Interests Modal */}
{showInterestsModal && (
  <div className="profile-modal-bg">
    <form className="profile-modal-form" onSubmit={handleSaveInterests}>
      <h3>Select Interested Categories</h3>
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "10px",
        maxHeight: "300px",
        overflowY: "auto",
        padding: "10px 0"
      }}>
        {ALL_CATEGORIES.map((cat) => (
          <label key={cat} style={{ 
            Width: 10,
            display: 'flex',
            flexDirection:'row',
            alignItems: 'center',
            gap: '5px' 
          }}>
            <input
              type="checkbox"
              checked={interests.includes(cat)}
              onChange={() => handleInterestChange(cat)}
              disabled={savingInterests}
            />
            {cat}
          </label>
        ))}
      </div>
      <div style={{ color: "#d32f2f", marginTop: 4, fontSize: 13 }}>
        {interests.length < 3 && "Please select at least 3 categories."}
      </div>
      <div className="profile-modal-actions" >
        <button
          type="button"
          className="profile-btn profile-btn-cancel"
          onClick={() => setShowInterestsModal(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="profile-btn profile-btn-save"
          disabled={savingInterests || (interests.length >0 && interests.length <3)}
        >
          {savingInterests ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          className="profile-btn profile-btn-cancel"
          onClick={handleUnsubscribe}
          style={{ 
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none'
          }}
        >
          Unsubscribe All
        </button>
      </div>
    </form>
  </div>
)}

          {/* Change Password */}
          <button
            className="profile-btn profile-btn-password"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="profile-modal-bg">
          <form className="profile-modal-form" onSubmit={handleChangePassword}>
            <h3>Change Password</h3>
            <div className="password-wrapper">
              <input
                type={showPassword.old ? "text" : "password"}
                placeholder="Old Password"
                value={passwords.old}
                onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))}
                required
              />
              <button
                type="button"
                className="show-hide-btn"
                onClick={() => setShowPassword(p => ({ ...p, old: !p.old }))}
                tabIndex={-1}
              >
                {showPassword.old ? "Hide" : "Show"}
              </button>
            </div>

            <div className="password-wrapper">
              <input
                type={showPassword.new ? "text" : "password"}
                placeholder="New Password"
                value={passwords.new}
                onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                required
              />
              <button
                type="button"
                className="show-hide-btn"
                onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                tabIndex={-1}
              >
                {showPassword.new ? "Hide" : "Show"}
              </button>
            </div>

            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-btn profile-btn-cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-btn profile-btn-save"
              >
                Save
              </button>
              <button
                type="button"
                className="profile-link profile-btn-forgot"
                onClick={() => { setShowPasswordModal(false); setShowForgotModal(true); }}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      )}

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