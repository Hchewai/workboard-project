
"use client";

import { useEffect, useState } from "react";

import AppShell from "../../components/layout/AppShell";
import StatCard from "../../components/dashboard/StatCard";
import RecentProjects from "../../components/dashboard/RecentProjects";
import UpcomingTasks from "../../components/dashboard/UpcomingTasks";

import api from "../../lib/api";
import ProjectForm from "../../components/projects/ProjectForm";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [projectsResponse, tasksResponse, milestonesResponse] =
          await Promise.all([
            api.get("/projects"),
            api.get("/tasks"),
            api.get("/milestones"),
          ]);

        // Extract arrays from API responses
        const projectData = Array.isArray(projectsResponse.data)
          ? projectsResponse.data
          : projectsResponse.data.data;

        const taskData = Array.isArray(tasksResponse.data)
          ? tasksResponse.data
          : tasksResponse.data.data;

        const milestoneData = Array.isArray(milestonesResponse.data)
          ? milestonesResponse.data
          : milestonesResponse.data.data;

        setProjects(projectData);
        setTasks(taskData);
        setMilestones(milestoneData);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load dashboard information."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Calculate dashboard statistics
  const dashboardStats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: "folder",
    },
    {
      title: "Active Tasks",
      value: tasks.filter((task) => task.status === "in_progress").length,
      icon: "list",
    },
    {
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

  // Get the three most recently created projects
  const recentProjects = [...projects]
    .sort((a, b) => {
      return new Date(b.created?.string || 0) -
        new Date(a.created?.string || 0);
    })
    .slice(0, 3);

  // Get the next three tasks with a due date that are not completed
  const upcomingTasks = [...tasks]
    .filter((task) => task.due_date && task.status !== "done")
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  if (loading) {
    return (
      <AppShell>
        <p>Loading dashboard...</p>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="dashboard-page">
        <div className="dashboard-heading">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back! Here's what's happening with your workspace.
            </p>
          </div>
        </div>

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

        <section className="dashboard-content">
          <RecentProjects projects={recentProjects} />
          <UpcomingTasks tasks={upcomingTasks} />
        </section>
      </div>
    </AppShell>
  );
}
