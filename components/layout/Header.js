
"use client";

import { Menu, Bell, UserRound } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="app-header">
      <button
        className="menu-toggle"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      <div className="header-title">
        <span>Workspace</span>
      </div>

      <div className="header-actions">
        <button
          className="header-icon"
          aria-label="Notifications"
        >
          <Bell size={19} />
        </button>

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
