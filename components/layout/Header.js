"use client";

import { Menu, Bell, UserRound } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="app-header">
      <button
        className="menu-toggle"
        // Call the parent's handler to open or close the sidebar.
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      <div className="header-title">
        <span>Workspace</span>
      </div>

      <div className="header-actions">
        {/* Notification button with an accessible label. */}
        <button className="header-icon" aria-label="Notifications">
          <Bell size={19} />
        </button>

        {/* Display the account icon and user profile label. */}
        <div className="user-profile">
          <div className="user-avatar">
            <UserRound size={18} />
          </div>

          <span>My Account</span>
        </div>
      </div>
    </header>
  );
}
