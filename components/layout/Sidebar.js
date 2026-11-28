"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Layers,
  Tags,
  Paperclip,
  UsersRound,
  X,
  LogOut,
} from "lucide-react";

import { logout } from "../../lib/auth";

// Store the sidebar navigation items in an array.
// Each item contains its display name, destination URL and icon component.
const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "My Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "People",
    href: "/people",
    icon: UsersRound,
  },
  {
    name: "Tags",
    href: "/tags",
    icon: Tags,
  },
  {
    name: "Attachments",
    href: "/attachments",
    icon: Paperclip,
  },
];

export default function Sidebar({ isOpen, onClose }) {
  // Retrieve the current URL path to determine which navigation item is active.
  const pathname = usePathname();

  const router = useRouter();

  // Handle logging out of the application.
  function handleLogout() {
    // Clear the user's authentication data.
    logout();

    // Redirect the user to the login page.
    router.replace("/login");
  }

  return (
    <>
      {/* Display an overlay behind the sidebar when it is open. */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      {/* Apply an additional CSS class when the sidebar is open. */}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Layers size={22} />
          </div>

          <span>Workboard</span>

          {/* Button for closing the sidebar, particularly useful on smaller screens. */}
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">WORKSPACE</span>

          <nav className="sidebar-navigation">
            {/* Generate each navigation link from the navigation array. */}
            {navigation.map((item) => {
              // Retrieve the icon component associated with the current item.
              const Icon = item.icon;

              // Check whether the current URL matches this navigation item.
              // Also account for nested routes, such as /projects/123.
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  // Use the destination URL as a unique React key.
                  key={item.href}
                  href={item.href}
                  // Close the sidebar after a navigation link is selected.
                  onClick={onClose}
                  // Apply the active CSS class to the current navigation item.
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <span>WORKBOARD</span>
          <span>Project Management</span>

          {/* Log the user out and return them to the login page. */}
          <button className="sidebar-link" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
