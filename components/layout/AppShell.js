
"use client";

import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import MainContent from "./MainContent";

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleSidebar() {
    setSidebarOpen((previous) => !previous);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="app-wrapper">
        <Header onMenuClick={toggleSidebar} />

        <MainContent>
          {children}
        </MainContent>
      </div>
    </div>
  );
}
