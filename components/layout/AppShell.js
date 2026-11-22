
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "./Sidebar";
import Header from "./Header";
import MainContent from "./MainContent";
import { getToken } from "../../lib/auth";

export default function AppShell({ children }) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
  }, [router]);

  function toggleSidebar() {
    setSidebarOpen((previous) => !previous);
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  if (!authenticated) {
    return <p>Checking authentication...</p>;
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
