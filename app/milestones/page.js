"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import MilestoneList from "../../components/milestones/MilestoneList";
import Button from "../../components/ui/Button";
import MilestoneForm from "../../components/milestones/MilestoneForm";

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/milestones");

      const milestoneData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      setMilestones(milestoneData);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to load milestones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  async function openCreateModal() {
    try {
      setModalError("");
      setLoadingProjects(true);

      const response = await api.get("/projects");
      const projectData = response.data.data;

      setProjects(projectData);
      setIsModalOpen(true);
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Unable to load projects.",
      );
    } finally {
      setLoadingProjects(false);
    }
  }

  async function handleCreateMilestone(milestoneData) {
    try {
      setCreating(true);
      setModalError("");

      const existingIds = milestones.map((milestone) => milestone.id);

      await api.post("/milestones", milestoneData);

      let createdMilestone = null;

      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/milestones");

        const updatedMilestones = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        createdMilestone = updatedMilestones.find(
          (milestone) =>
            !existingIds.includes(milestone.id) &&
            milestone.title === milestoneData.title,
        );

        if (createdMilestone) {
          setMilestones(updatedMilestones);
          setIsModalOpen(false);
          break;
        }
      }

      if (!createdMilestone) {
        setModalError(
          "The API accepted your milestone, but it hasn't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      setModalError(
        error.response?.data?.message || "Unable to create milestone.",
      );
    } finally {
      setCreating(false);
    }
  }
  if (loading) {
    return (
      <AppShell>
        <p>Loading milestones...</p>
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
            <h1>Milestones</h1>
            <p>Track important project deadlines and goals.</p>
          </div>
          <Button
            onClick={openCreateModal}
            loading={loadingProjects}
            loadingText="Loading..."
          >
            + New Milestone
          </Button>
        </div>

        <MilestoneList milestones={milestones} />
        {isModalOpen && (
          <MilestoneForm
            projects={projects}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateMilestone}
            loading={creating}
            error={modalError}
          />
        )}
      </section>
    </AppShell>
  );
}
