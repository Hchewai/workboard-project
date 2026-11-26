"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import ProjectList from "../../components/projects/ProjectList";
import ProjectForm from "../../components/projects/ProjectForm";
import Button from "../../components/ui/Button";

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  // Fetch projects from the API
  const fetchProjects = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/projects");
      const projectData = response.data.data;

      setProjects(projectData);

      return projectData;
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load projects.");

      return null;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  async function waitForProject(projectData, existingProjectIds) {
    const maxAttempts = 30;
    const interval = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Wait two seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, interval));

      const latestProjects = await fetchProjects(false);

      if (!latestProjects) {
        continue;
      }

      // Look for the newly created project
      const newProject = latestProjects.find(
        (project) =>
          !existingProjectIds.has(project.id) &&
          project.name === projectData.name.trim() &&
          (project.description || "") === projectData.description.trim(),
      );

      if (newProject) {
        return true;
      }
    }

    return false;
  }

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Create a new project
  async function handleCreateProject(projectData) {
    if (!projectData.name.trim()) {
      setModalError("Please enter a project name.");
      return;
    }

    try {
      setCreating(true);
      setModalError("");

      // Record the IDs of projects that already exist
      const existingProjectIds = new Set(projects.map((project) => project.id));

      // Send the POST request
      await api.post("/projects", {
        name: projectData.name.trim(),
        description: projectData.description.trim(),
      });

      // Wait for the new project to appear
      const projectAppeared = await waitForProject(
        projectData,
        existingProjectIds,
      );

      if (projectAppeared) {
        setIsModalOpen(false);
        setModalError("");
      } else {
        setModalError(
          "The API accepted your project, but it hasn't appeared yet. Please refresh the project list shortly.",
        );
      }
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Unable to create project.",
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p>Loading projects...</p>
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
      <section className="projects-page">
        <div className="page-header">
          <div>
            <h1>Projects</h1>
            <p>Manage and track your projects.</p>
          </div>

          <Button
            onClick={() => {
              setModalError("");
              setIsModalOpen(true);
            }}
          >
            + New Project
          </Button>
        </div>

        {isModalOpen && (
          <ProjectForm
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateProject}
            loading={creating}
            error={modalError}
          />
        )}

        <ProjectList projects={projects} />
      </section>
    </AppShell>
  );
}
