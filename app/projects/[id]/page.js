"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "../../../lib/api";
import AppShell from "../../../components/layout/AppShell";
import ProjectForm from "../../../components/projects/ProjectForm";
import Button from "../../../components/ui/Button";
import CommentsSection from "../../../components/comments/CommentsSection";
export default function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch individual project
  async function fetchProject() {
    const response = await api.get(`/projects/${id}`);

    setProject(response.data);

    return response.data;
  }

  useEffect(() => {
    async function loadProject() {
      try {
        await fetchProject();
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load project details.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProject();
    }
  }, [id]);

  // Wait for the updated project to appear
  async function waitForProjectUpdate(updatedData) {
    const maxAttempts = 30;
    const interval = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      try {
        const latestProject = await fetchProject();

        const isUpdated =
          latestProject.name === updatedData.name.trim() &&
          (latestProject.description || "") === updatedData.description.trim();

        if (isUpdated) {
          return true;
        }
      } catch (error) {
        // Continue polling if a temporary request error occurs
      }
    }

    return false;
  }

  // Update project
  async function handleUpdateProject(projectData) {
    if (!projectData.name.trim()) {
      setModalError("Please enter a project name.");
      return;
    }

    try {
      setUpdating(true);
      setModalError("");

      await api.put(`/projects/${id}`, {
        name: projectData.name.trim(),
        description: projectData.description.trim(),
      });

      const projectUpdated = await waitForProjectUpdate(projectData);

      if (projectUpdated) {
        setIsModalOpen(false);
        setModalError("");
      } else {
        setModalError(
          "The API accepted your changes, but the updated project hasn't appeared yet. Please try refreshing shortly.",
        );
      }
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Unable to update project.",
      );
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteProject() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      // Send the DELETE request
      await api.delete(`/projects/${id}`);

      // Wait for the project to disappear from the API
      const maxAttempts = 30;
      const interval = 2000;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, interval));

        try {
          await api.get(`/projects/${id}`);
        } catch (error) {
          if (error.response?.status === 404) {
            // Project has been deleted
            router.replace("/projects");
            return;
          }

          throw error;
        }
      }

      setDeleteError(
        "The API accepted the deletion, but the project is still available. Please check again shortly.",
      );
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "Unable to delete project.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <p>Loading project...</p>
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

  if (!project) {
    return (
      <AppShell>
        <p>Project not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="project-details-page">
        <div className="page-header">
          <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>

          <div className="project-actions">
            <Button
              variant="danger"
              onClick={handleDeleteProject}
              loading={deleting}
              loadingText="Deleting..."
              disabled={updating}
            >
              Delete Project
            </Button>

            <Button
              onClick={() => {
                setModalError("");
                setIsModalOpen(true);
              }}
              disabled={deleting || updating}
            >
              Edit Project
            </Button>
          </div>
        </div>
        <CommentsSection commentableType="project" commentableId={id} />

        {deleteError && <p className="text-danger">{deleteError}</p>}
        {isModalOpen && (
          <ProjectForm
            initialProject={project}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleUpdateProject}
            loading={updating}
            error={modalError}
          />
        )}
      </section>
    </AppShell>
  );
}
