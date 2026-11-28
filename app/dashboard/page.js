"use client";

import { useEffect, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import StatCard from "../../components/dashboard/StatCard";
import RecentProjects from "../../components/dashboard/RecentProjects";
import UpcomingTasks from "../../components/dashboard/UpcomingTasks";

import api from "../../lib/api";

export default function DashboardPage() {
  // State variables store the data retrieved from the API.
  // Each collection starts as an empty array until the API responds.
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);

  // Track whether the dashboard is loading or has encountered an error.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect runs after the component first renders.
  // The empty dependency array means the dashboard data is fetched on mount.
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Promise.all sends all three API requests concurrently.
        // This avoids waiting for each request to finish before starting the next.
        const [projectsResponse, tasksResponse, milestonesResponse] =
          await Promise.all([
            api.get("/projects"),
            api.get("/tasks"),
            api.get("/milestones"),
          ]);

        // Extract the actual data arrays from the API responses.
        // The Array.isArray checks support both direct arrays and
        // responses where the records are nested inside a data property.
        const projectData = Array.isArray(projectsResponse.data)
          ? projectsResponse.data
          : projectsResponse.data.data;

        const taskData = Array.isArray(tasksResponse.data)
          ? tasksResponse.data
          : tasksResponse.data.data;

        const milestoneData = Array.isArray(milestonesResponse.data)
          ? milestonesResponse.data
          : milestonesResponse.data.data;

        // Update React state with the retrieved data.
        // Updating state causes the component to render again with the new values.
        setProjects(projectData);
        setTasks(taskData);
        setMilestones(milestoneData);
      } catch (error) {
        // If any API request fails, store the server's error message.
        // Use a fallback message if the server does not provide one.
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard information.",
        );
      } finally {
        // Runs whether the requests succeed or fail.
        // This ensures the loading indicator is removed.
        setLoading(false);
      }
    }

    // Execute the function to retrieve the dashboard information.
    fetchDashboardData();
  }, []);

  // Calculate the statistics displayed across the dashboard.
  // The values are derived from the data stored in React state.
  const dashboardStats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: "folder",
    },
    {
      // filter() creates a new array containing only tasks
      // whose status is "in_progress". length gives the total count.
      title: "Active Tasks",
      value: tasks.filter((task) => task.status === "in_progress").length,
      icon: "list",
    },
    {
      // Count tasks that have been marked as completed.
      title: "Completed Tasks",
      value: tasks.filter((task) => task.status === "done").length,
      icon: "check",
    },
    {
      title: "Milestones",
      value: milestones.length,
      icon: "flag",
    },
  ];

  // Create a copy of the projects array before sorting.
  // This prevents sort() from directly modifying the original state array.
  // Projects are sorted by creation date, newest first, then limited to three.
  const recentProjects = [...projects]
    .sort((a, b) => {
      return (
        new Date(b.created?.string || 0) - new Date(a.created?.string || 0)
      );
    })
    .slice(0, 3);

  // Create a list of upcoming tasks.
  // Exclude tasks without a due date and tasks already marked as completed.
  // Sort the remaining tasks by due date, earliest first, and return three.
  const upcomingTasks = [...tasks]
    .filter((task) => task.due_date && task.status !== "done")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  // Display a loading message while the dashboard data is being retrieved.
  if (loading) {
    return (
      <AppShell>
        <p>Loading dashboard...</p>
      </AppShell>
    );
  }

  // Display an error message if the API requests failed.
  if (error) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Render the dashboard once the data has loaded successfully.
  return (
    <AppShell>
      <div className="dashboard-page">
        <div className="dashboard-heading">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back! Here&apos;s what&apos;s happening with your
              workspace.
            </p>
          </div>
        </div>

        {/* Render a StatCard for each statistic in the dashboardStats array. */}
        <section className="dashboard-stats">
          {dashboardStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </section>

        {/* Pass the processed project and task data to their respective components. */}
        <section className="dashboard-content">
          <RecentProjects projects={recentProjects} />
          <UpcomingTasks tasks={upcomingTasks} />
        </section>
      </div>
    </AppShell>
  );
}
