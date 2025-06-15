import React from "react";
import { showSuccess } from "./toast";
import "./CSS/App.css"
export default function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
  className="profile-btn darkmode-toggle-btn"
  onClick={() => {
    setDarkMode((d) => !d);
    showSuccess(`Switched to ${!darkMode ? "Dark" : "Light"} mode`);
  }}
  aria-label="Toggle dark mode"
>
  {darkMode ? "🌙 Dark" : "☀️ Light"}
</button>
  );
}
