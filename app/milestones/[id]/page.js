"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AppShell from "../../../components/layout/AppShell";
import Button from "../../../components/ui/Button";
import MilestoneForm from "../../../components/milestones/MilestoneForm";
import api from "../../../lib/api";

export default function MilestoneDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [milestone, setMilestone] = useState(null);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const [deleting, setDeleting] = useState(false);

  const fetchMilestone = useCallback(async () => {
    try {
      setError("");

      const response = await api.get(`/milestones/${id}`);
      setMilestone(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load this milestone.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMilestone();
  }, [fetchMilestone]);

  async function openEditModal() {
    try {
      setModalError("");

      const response = await api.get("/projects");
      const projectData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      setProjects(projectData);
      setIsModalOpen(true);
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Unable to load projects.",
      );
    }
  }

  async function handleUpdateMilestone(milestoneData) {
    try {
      setSaving(true);
      setModalError("");

      await api.put(`/milestones/${id}`, milestoneData);

      let updatedMilestone = null;

      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get(`/milestones/${id}`);
        const currentMilestone = response.data;

        if (
          currentMilestone.title === milestoneData.title &&
          currentMilestone.description === milestoneData.description &&
          currentMilestone.due_date === milestoneData.due_date &&
          currentMilestone.project?.id === milestoneData.project_id
        ) {
          updatedMilestone = currentMilestone;
          break;
        }
      }

      if (updatedMilestone) {
        setMilestone(updatedMilestone);
        setIsModalOpen(false);
      } else {
        setModalError(
          "The API accepted the update, but the changes haven't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Unable to update milestone.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMilestone() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this milestone? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/milestones/${id}`);

      let milestoneStillExists = true;

      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          await api.get(`/milestones/${id}`);
        } catch (error) {
          if (error.response?.status === 404) {
            milestoneStillExists = false;
            break;
          }

          throw error;
        }
      }

      if (!milestoneStillExists) {
        router.replace("/milestones");
      } else {
        setError(
          "The API accepted the deletion, but the milestone still appears to exist. Please refresh shortly.",
        );
        setDeleting(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Unable to delete milestone.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="page-container">
          <p>Loading milestone...</p>
        </div>
      </AppShell>
    );
  }

  if (error && !milestone) {
    return (
      <AppShell>
        <div className="page-container">
          <p className="form-error">{error}</p>
          <Button onClick={() => router.push("/milestones")}>
            Back to Milestones
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!milestone) return null;

  return (
    <AppShell>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>{milestone.title}</h1>
            <p>Milestone details and management.</p>
          </div>

          <div className="project-modal-actions">
            <Button variant="secondary" onClick={openEditModal}>
              Edit Milestone
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteMilestone}
              loading={deleting}
            >
              Delete Milestone
            </Button>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="project-detail-card">
          <div className="project-detail-section">
            <h2>Description</h2>
            <p>{milestone.description || "No description provided."}</p>
          </div>

          <div className="project-detail-section">
            <h2>Project</h2>
            <p>{milestone.project?.name || "No project assigned"}</p>
          </div>

          <div className="project-detail-section">
            <h2>Due Date</h2>
            <p>{milestone.due_date || "No due date"}</p>
          </div>

          <div className="project-detail-section">
            <h2>Completion</h2>
            <p>{milestone.completed_at || "Not completed"}</p>
          </div>

          <div className="project-detail-section">
            <h2>Workspace</h2>
            <p>{milestone.workspace?.name || "Unknown workspace"}</p>
          </div>
        </div>

        {isModalOpen && (
          <MilestoneForm
            projects={projects}
            initialValues={milestone}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleUpdateMilestone}
            loading={saving}
            error={modalError}
          />
        )}
      </div>
    </AppShell>
  );
}
