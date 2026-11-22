
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import api from "../../../lib/api";
import AppShell from "../../../components/layout/AppShell";

export default function ProjectDetailsPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await api.get(`/projects/${id}`);

        setProject(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load project details."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProject();
    }
  }, [id]);

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
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>

        <div className="project-details-panel">
          <h2>Project Information</h2>

          <div className="project-detail-item">
            <span>Project ID</span>
            <p>{project.id}</p>
          </div>

          <div className="project-detail-item">
            <span>Created</span>
            <p>{project.created?.human || "Unknown"}</p>
          </div>

          <div className="project-detail-item">
            <span>Workspace</span>
            <p>{project.workspace?.name || "Unknown"}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
