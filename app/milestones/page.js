"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import MilestoneList from "../../components/milestones/MilestoneList";
import Button from "../../components/ui/Button";
import MilestoneForm from "../../components/milestones/MilestoneForm";

export default function MilestonesPage() {
  // Store the milestones retrieved from the API.
  const [milestones, setMilestones] = useState([]);

  // Track the initial loading state and any errors when fetching milestones.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Store the projects used to populate the project dropdown in MilestoneForm.
  const [projects, setProjects] = useState([]);

  // Control whether the create milestone modal is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track the creation request and any errors returned by the modal.
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState("");

  // Track whether the project list is being loaded before opening the modal.
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Fetch all milestones from the API.
  // useCallback keeps the function reference stable between renders.
  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/milestones");

      // Support both direct array responses and arrays nested inside data.
      const milestoneData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      // Update React state with the retrieved milestones.
      setMilestones(milestoneData);
    } catch (error) {
      // Display the API error message or a fallback message.
      setError(error.response?.data?.message || "Unable to load milestones.");
    } finally {
      // Stop displaying the loading state whether the request succeeds or fails.
      setLoading(false);
    }
  }, []);

  // Fetch milestones when the page first loads.
  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  // Load available projects before opening the create milestone modal.
  async function openCreateModal() {
    try {
      setModalError("");
      setLoadingProjects(true);

      const response = await api.get("/projects");
      const projectData = response.data.data;

      // Store projects so MilestoneForm can display them in its dropdown.
      setProjects(projectData);

      // Only open the modal once the projects have loaded successfully.
      setIsModalOpen(true);
    } catch (error) {
      // Display an error if the project list cannot be retrieved.
      setModalError(
        error.response?.data?.message || "Unable to load projects.",
      );
    } finally {
      setLoadingProjects(false);
    }
  }

  // Handle the creation of a new milestone.
  async function handleCreateMilestone(milestoneData) {
    try {
      setCreating(true);
      setModalError("");

      // Record the IDs of existing milestones before creating the new one.
      // This helps identify which milestone is newly created during polling.
      const existingIds = milestones.map((milestone) => milestone.id);

      // Send the POST request to create the milestone.
      await api.post("/milestones", milestoneData);

      let createdMilestone = null;

      // The API may take time to make the newly created milestone available.
      // Retry the GET request up to 30 times, waiting two seconds between attempts.
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/milestones");

        // Extract the milestone array from the API response.
        const updatedMilestones = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Find a milestone that did not exist before creation
        // and has the same title as the submitted milestone.
        createdMilestone = updatedMilestones.find(
          (milestone) =>
            !existingIds.includes(milestone.id) &&
            milestone.title === milestoneData.title,
        );

        // Once the new milestone is found, update the page and close the modal.
        if (createdMilestone) {
          setMilestones(updatedMilestones);
          setIsModalOpen(false);
          break;
        }
      }

      // If the milestone was not found after all attempts,
      // display a message explaining that the API has not updated yet.
      if (!createdMilestone) {
        setModalError(
          "The API accepted your milestone, but it hasn't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      // Handle errors from either the creation request or polling requests.
      setModalError(
        error.response?.data?.message || "Unable to create milestone.",
      );
    } finally {
      // Re-enable the form once the creation process has finished.
      setCreating(false);
    }
  }

  // Display a loading message while the initial milestone request is processing.
  if (loading) {
    return (
      <AppShell>
        <p>Loading milestones...</p>
      </AppShell>
    );
  }

  // Display an error message if the initial milestone request fails.
  if (error) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Render the milestones page once the data has loaded successfully.
  return (
    <AppShell>
      <section className="projects-page">
        <div className="page-header">
          <div>
            <h1>Milestones</h1>
            <p>Track important project deadlines and goals.</p>
          </div>

          {/* Open the creation modal after loading the available projects. */}
          <Button
            onClick={openCreateModal}
            loading={loadingProjects}
            loadingText="Loading..."
          >
            + New Milestone
          </Button>
        </div>

        {/* Pass the milestone data to the reusable list component. */}
        <MilestoneList milestones={milestones} />

        {/* Only render the form when the modal is open. */}
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
