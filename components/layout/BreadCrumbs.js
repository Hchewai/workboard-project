"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BreadCrumbs({ currentName }) {
  const pathname = usePathname();

  // Split the URL into individual route segments.
  const segments = pathname.split("/").filter(Boolean);

  // Hide breadcrumbs on top-level pages.
  if (segments.length <= 1) {
    return null;
  }

  // Friendly names for the main application sections.
  const routeLabels = {
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    milestones: "Milestones",
  };

  // Friendly fallback labels for individual record pages.
  const detailLabels = {
    projects: "Project Details",
    tasks: "Task Details",
    milestones: "Milestone Details",
  };

  // Build the breadcrumb items from the URL segments.
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    // Check whether this segment is a recognised application route.
    let label = routeLabels[segment];

    // If it's the final segment and isn't a known route,
    // use the record name or a friendly fallback.
    if (!label && isLast) {
      const parentSegment = segments[index - 1];

      label = currentName || detailLabels[parentSegment] || "Details";
    }

    return {
      label,
      href,
      isLast,
    };
  });

  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb">
        {/* Provide a shortcut back to the dashboard. */}
        <li className="breadcrumb-item">
          <Link href="/dashboard">Dashboard</Link>
        </li>

        {breadcrumbs
          // Avoid displaying Dashboard twice.
          .filter((item) => item.label.toLowerCase() !== "dashboard")
          .map((item, index, filteredItems) => {
            const isLast = index === filteredItems.length - 1;

            return (
              <li
                key={item.href}
                className={`breadcrumb-item ${isLast ? "active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {isLast ? (
                  item.label
                ) : (
                  <Link href={item.href}>{item.label}</Link>
                )}
              </li>
            );
          })}
      </ol>
    </nav>
  );
}
