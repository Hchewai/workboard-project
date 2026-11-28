"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import Header from "./Header";
import MainContent from "./MainContent";
import { getToken } from "../../lib/auth";

export default function AppShell({ children }) {
  const router = useRouter();

  // Track whether the mobile sidebar is currently open or closed.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Track whether the user has passed the authentication check.
  const [authenticated, setAuthenticated] = useState(false);

  // Check whether the user has an authentication token when the component mounts.
  useEffect(() => {
    const token = getToken();

    // Redirect unauthenticated users to the login page.
    if (!token) {
      router.replace("/login");
      return;
    }

    // Allow the application layout to render once a token is found.
    setAuthenticated(true);
  }, [router]);

  // Toggle the sidebar between its open and closed states.
  function toggleSidebar() {
    // Use the previous state to calculate the next state.
    setSidebarOpen((previous) => !previous);
  }

  // Close the sidebar, for example when a navigation link is selected.
  function closeSidebar() {
    setSidebarOpen(false);
  }

  // Display a temporary message while the authentication check is running.

  return authenticated ? (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="app-wrapper">
        <Header onMenuClick={toggleSidebar} />

        <MainContent>{children}</MainContent>
      </div>
    </div>
  ) : (
    <p>Checking authentication...</p>
  );
}
