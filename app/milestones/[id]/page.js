"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AppShell from "../../../components/layout/AppShell";
import Button from "../../../components/ui/Button";
import MilestoneForm from "../../../components/milestones/MilestoneForm";
import api from "../../../lib/api";

export default function MilestoneDetailPage() {
  // Retrieve the dynamic ID from the URL.
  // For example, /milestones/12 gives an ID of 12.
  const { id } = useParams();

  // useRouter allows programmatic navigation to other pages.
  const router = useRouter();

  // Store the milestone being displayed and the projects
  // available for selection when editing it.
  const [milestone, setMilestone] = useState(null);
  const [projects, setProjects] = useState([]);

  // Track the initial loading state and any page-level errors.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Control the edit modal and track its saving state and errors.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Track whether a milestone deletion is currently processing.
  const [deleting, setDeleting] = useState(false);

  // Retrieve the milestone matching the ID in the URL.
  // useCallback keeps the function reference stable unless the ID changes.
  const fetchMilestone = useCallback(async () => {
    try {
      setError("");

      // Send a GET request to retrieve the individual milestone.
      const response = await api.get(`/milestones/${id}`);

      // Store the returned milestone in React state.
      setMilestone(response.data);
    } catch (error) {
      // Display the API error message or a fallback message.
      setError(
        error.response?.data?.message || "Unable to load this milestone.",
      );
    } finally {
      // Stop the initial loading state regardless of the request outcome.
      setLoading(false);
    }
  }, [id]);

  // Fetch the milestone when the page loads or when the URL ID changes.
  useEffect(() => {
    fetchMilestone();
  }, [fetchMilestone]);

  // Retrieve the available projects before opening the edit modal.
  async function openEditModal() {
    try {
      setModalError("");

      const response = await api.get("/projects");

      // Support both direct array responses and arrays nested inside data.
      const projectData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      // Store the projects for the dropdown in MilestoneForm.
      setProjects(projectData);

      // Open the edit modal once the projects have loaded.
      setIsModalOpen(true);
    } catch (error) {
      // Display an error if the project list cannot be retrieved.
      setModalError(
        error.response?.data?.message || "Unable to load projects.",
      );
    }
  }

  // Handle updating the milestone using the data submitted by MilestoneForm.
  async function handleUpdateMilestone(milestoneData) {
    try {
      setSaving(true);
      setModalError("");

      // Send a PUT request containing the updated milestone information.
      await api.put(`/milestones/${id}`, milestoneData);

      let updatedMilestone = null;

      // Poll the API until the updated milestone becomes available.
      // Retry up to 30 times, waiting two seconds between requests.
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get(`/milestones/${id}`);
        const currentMilestone = response.data;

        // Compare the returned values with the submitted values
        // to check whether the update has appeared in the API.
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

      // If the updated milestone is found, refresh the page state
      // and close the edit modal.
      if (updatedMilestone) {
        setMilestone(updatedMilestone);
        setIsModalOpen(false);
      } else {
        // The update request succeeded, but the new values
        // were not visible after all polling attempts.
        setModalError(
          "The API accepted the update, but the changes haven't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      // Handle errors from the update request or subsequent API checks.
      setModalError(
        error.response?.data?.message || "Unable to update milestone.",
      );
    } finally {
      // Re-enable the form after the update process finishes.
      setSaving(false);
    }
  }

  // Handle deleting the current milestone.
  async function handleDeleteMilestone() {
    // Ask the user to confirm before permanently deleting the record.
    const confirmed = window.confirm(
      "Are you sure you want to delete this milestone? This action cannot be undone.",
    );

    // Stop the function if the user cancels the confirmation.
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      // Send a DELETE request for the current milestone.
      await api.delete(`/milestones/${id}`);

      // Assume the milestone still exists until the API confirms otherwise.
      let milestoneStillExists = true;

      // Poll the API to check whether the milestone has been removed.
      // A 404 response indicates that the record can no longer be found.
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          await api.get(`/milestones/${id}`);
        } catch (error) {
          if (error.response?.status === 404) {
            milestoneStillExists = false;
            break;
          }

          // Re-throw errors other than 404 so the outer catch can handle them.
          throw error;
        }
      }

      // Redirect to the milestones list once deletion is confirmed.
      if (!milestoneStillExists) {
        router.replace("/milestones");
      } else {
        // The deletion request succeeded, but the record still appears
        // to exist after all polling attempts.
        setError(
          "The API accepted the deletion, but the milestone still appears to exist. Please refresh shortly.",
        );
        setDeleting(false);
      }
    } catch (error) {
      // Display an error if the deletion or verification request fails.
      setError(error.response?.data?.message || "Unable to delete milestone.");
      setDeleting(false);
    }
  }

  // Display a loading message while the milestone is being retrieved.
  if (loading) {
    return (
      <AppShell>
        <div className="page-container">
          <p>Loading milestone...</p>
        </div>
      </AppShell>
    );
  }

  // If loading failed and no milestone was retrieved,
  // display the error and provide a way back to the milestones list.
  if (error && !milestone) {
    return (
      <AppShell>
        <div className="page-container">
          <p className="ui-form-error">{error}</p>
          <Button onClick={() => router.push("/milestones")}>
            Back to Milestones
          </Button>
        </div>
      </AppShell>
    );
  }

  // Do not render the detail page if no milestone is available.
  if (!milestone) return null;

  // Render the milestone details and management actions.
  return (
    <AppShell>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>{milestone.title}</h1>
            <p>Milestone details and management.</p>
          </div>

          <div className="project-modal-actions">
            {/* Open the edit modal to modify the current milestone. */}
            <Button
              variant="secondary"
              onClick={openEditModal}
              disabled={saving || deleting}
            >
              Edit Milestone
            </Button>

            {/* Delete the milestone after the user confirms the action. */}
            <Button
              variant="danger"
              onClick={handleDeleteMilestone}
              loading={deleting}
              loadingText="Deleting..."
            >
              Delete Milestone
            </Button>
          </div>
        </div>

        {/* Display page-level errors that occur after the milestone loads. */}
        {error && <p className="ui-form-error">{error}</p>}

        {/* Display the individual milestone properties. */}
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

        {/* Only render MilestoneForm when the edit modal is open.
            Pass the existing milestone as initialValues to populate the form. */}
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
