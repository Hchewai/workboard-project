"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "../../../lib/api";
import AppShell from "../../../components/layout/AppShell";
import ProjectForm from "../../../components/projects/ProjectForm";
import Button from "../../../components/ui/Button";
import CommentsSection from "../../../components/comments/CommentsSection";

export default function ProjectDetailsPage() {
  // Retrieve the project ID from the dynamic URL.
  // For example, /projects/5 gives an ID of 5.
  const { id } = useParams();

  // Store the project retrieved from the API.
  const [project, setProject] = useState(null);

  // Track the initial loading state and whether an update is processing.
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Store page-level errors and errors related to the edit modal.
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  // Control the visibility of the edit project modal.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useRouter allows navigation after actions such as deleting a project.
  const router = useRouter();

  // Track the deletion process and any errors returned during deletion.
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch the individual project using its ID.
  async function fetchProject() {
    const response = await api.get(`/projects/${id}`);

    // Store the returned project in React state.
    setProject(response.data);

    // Return the project so other functions can inspect its properties.
    return response.data;
  }

  // Retrieve the project when the page loads or the URL ID changes.
  useEffect(() => {
    async function loadProject() {
      try {
        await fetchProject();
      } catch (error) {
        // Display the API error message or a fallback message.
        setError(
          error.response?.data?.message || "Unable to load project details.",
        );
      } finally {
        // Stop the loading state regardless of the request outcome.
        setLoading(false);
      }
    }

    // Only fetch the project once a valid ID is available.
    if (id) {
      loadProject();
    }
  }, [id]);

  // Check whether the updated project information has appeared in the API.
  async function waitForProjectUpdate(updatedData) {
    const maxAttempts = 30;
    const interval = 2000;

    // Retry the API request up to 30 times, waiting two seconds each time.
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      try {
        const latestProject = await fetchProject();

        // Compare the latest API values against the submitted form values.
        // trim() removes any accidental whitespace around the input values.
        const isUpdated =
          latestProject.name === updatedData.name.trim() &&
          (latestProject.description || "") === updatedData.description.trim();

        // Stop polling once the updated information is found.
        if (isUpdated) {
          return true;
        }
      } catch (error) {
        // Continue polling if a temporary request error occurs.
      }
    }

    // Return false if the updated project was not found after all attempts.
    return false;
  }

  // Handle updating the current project.
  async function handleUpdateProject(projectData) {
    // Validate that the project name is not empty.
    if (!projectData.name.trim()) {
      setModalError("Please enter a project name.");
      return;
    }

    try {
      setUpdating(true);
      setModalError("");

      // Send a PUT request containing the updated project information.
      await api.put(`/projects/${id}`, {
        name: projectData.name.trim(),
        description: projectData.description.trim(),
      });

      // Wait until the updated values become available through the API.
      const projectUpdated = await waitForProjectUpdate(projectData);

      if (projectUpdated) {
        // Close the modal and clear any previous errors.
        setIsModalOpen(false);
        setModalError("");
      } else {
        // The update request succeeded, but the changes were not
        // visible through the API after all polling attempts.
        setModalError(
          "The API accepted your changes, but the updated project hasn't appeared yet. Please try refreshing shortly.",
        );
      }
    } catch (error) {
      // Display an error if the update request fails.
      setModalError(
        error.response?.data?.message || "Unable to update project.",
      );
    } finally {
      // Re-enable the edit form once the update process finishes.
      setUpdating(false);
    }
  }

  // Handle deleting the current project.
  async function handleDeleteProject() {
    // Ask the user to confirm before permanently deleting the project.
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
    );

    // Stop the function if the user cancels the confirmation.
    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      // Send the DELETE request to remove the project.
      await api.delete(`/projects/${id}`);

      // Set the maximum number of attempts and delay between API checks.
      const maxAttempts = 30;
      const interval = 2000;

      // Check whether the project has disappeared from the API.
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, interval));

        try {
          await api.get(`/projects/${id}`);
        } catch (error) {
          if (error.response?.status === 404) {
            // A 404 response confirms that the project can no longer be found.
            // Redirect the user to the projects list.
            router.replace("/projects");
            return;
          }

          // Re-throw other errors so they can be handled by the outer catch.
          throw error;
        }
      }

      // Display an error if the project still exists after all attempts.
      setDeleteError(
        "The API accepted the deletion, but the project is still available. Please check again shortly.",
      );
    } catch (error) {
      // Handle errors from the deletion request or verification process.
      setDeleteError(
        error.response?.data?.message || "Unable to delete project.",
      );
    } finally {
      // Reset the deletion state once the process finishes.
      setDeleting(false);
    }
  }

  // Display a loading message while the project is being retrieved.
  if (loading) {
    return (
      <AppShell>
        <p>Loading project...</p>
      </AppShell>
    );
  }

  // Display an error if the project could not be loaded.
  if (error) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Handle cases where no project was returned by the API.
  if (!project) {
    return (
      <AppShell>
        <p>Project not found.</p>
      </AppShell>
    );
  }

  // Render the project details and available management actions.
  return (
    <AppShell>
      <section className="project-details-page">
        <div className="page-header">
          <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>

          <div className="project-actions">
            {/* Delete the project after the user confirms the action. */}
            <Button
              variant="danger"
              onClick={handleDeleteProject}
              loading={deleting}
              loadingText="Deleting..."
              disabled={updating}
            >
              Delete Project
            </Button>

            {/* Open the edit modal and clear any previous modal errors. */}
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

        {/* Display comments associated with this particular project.
            The commentableType and commentableId identify the record
            that the comments belong to. */}
        <CommentsSection commentableType="project" commentableId={id} />

        {/* Display any errors returned during the deletion process. */}
        {deleteError && <p className="text-danger">{deleteError}</p>}

        {/* Only render ProjectForm when the edit modal is open.
            Pass the existing project so its current values populate the form. */}
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
