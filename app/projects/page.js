
"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import ProjectList from "../../components/projects/ProjectList";
import AppShell from "../../components/layout/AppShell";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  async function fetchProjects() {
  try {
    const response = await api.get("/projects");

    console.log("Projects API response:", response.data);
    console.log("Is response an array?", Array.isArray(response.data));

    setProjects(response.data.data);
  } catch (error) {
    setError(
      error.response?.data?.message ||
      "Unable to load projects."
    );
  } finally {
    setLoading(false);
  }
}
    fetchProjects();
  }, []);

  if (loading) {
    return <p>Loading projects...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

 return (
  <AppShell>
    <section className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <p>Manage and track your projects.</p>
      </div>

      <ProjectList projects={projects} />
    </section>
  </AppShell>
);
}
