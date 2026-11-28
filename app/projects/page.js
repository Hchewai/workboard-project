"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import ProjectList from "../../components/projects/ProjectList";
import ProjectForm from "../../components/projects/ProjectForm";
import Button from "../../components/ui/Button";

export default function ProjectsPage() {
  // Control whether the create project modal is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Store the projects retrieved from the API.
  const [projects, setProjects] = useState([]);

  // Track the initial loading state and project creation process.
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Store page-level errors and errors displayed inside the modal.
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  // Fetch projects from the API.
  // useCallback keeps the function reference stable between renders.
  const fetchProjects = useCallback(async (showLoading = true) => {
    try {
      // Only show the page loading state when requested.
      // This allows the function to refresh project data in the background.
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      // Send a GET request to retrieve all projects.
      const response = await api.get("/projects");

      // Extract the project array from the API response.
      const projectData = response.data.data;

      // Update React state with the retrieved projects.
      setProjects(projectData);

      // Return the data so other functions can use the latest project list.
      return projectData;
    } catch (error) {
      // Display the API error message or a fallback message.
      setError(error.response?.data?.message || "Unable to load projects.");

      // Return null to indicate that the request failed.
      return null;
    } finally {
      // Only stop the loading state if it was enabled for this request.
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Wait for a newly created project to appear in the API.
  async function waitForProject(projectData, existingProjectIds) {
    const maxAttempts = 30;
    const interval = 2000;

    // Retry the API request up to 30 times, waiting two seconds each time.
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Wait two seconds before checking again.
      await new Promise((resolve) => setTimeout(resolve, interval));

      // Fetch the latest projects without showing the full-page loading state.
      const latestProjects = await fetchProjects(false);

      // If the request failed, continue to the next attempt.
      if (!latestProjects) {
        continue;
      }

      // Find the project that was not in the original list
      // and matches the submitted name and description.
      const newProject = latestProjects.find(
        (project) =>
          !existingProjectIds.has(project.id) &&
          project.name === projectData.name.trim() &&
          (project.description || "") === projectData.description.trim(),
      );

      // Return true once the newly created project is found.
      if (newProject) {
        return true;
      }
    }

    // Return false if the project was not found after all attempts.
    return false;
  }

  // Fetch the initial project list when the page first loads.
  useEffect(() => {
    let ignore = false;

    async function loadProjects() {
      await fetchProjects();
    }

    // Only start the request if the component is still mounted.
    if (!ignore) {
      loadProjects();
    }

    // Prevent further state updates if the component unmounts.
    return () => {
      ignore = true;
    };
  }, [fetchProjects]);

  // Handle creating a new project.
  async function handleCreateProject(projectData) {
    // Validate that the project name is not empty.
    if (!projectData.name.trim()) {
      setModalError("Please enter a project name.");
      return;
    }

    try {
      setCreating(true);
      setModalError("");

      // Record the IDs of projects that already exist.
      // A Set allows us to efficiently check whether an ID already exists.
      const existingProjectIds = new Set(projects.map((project) => project.id));

      // Send a POST request to create the project.
      // trim() removes unnecessary whitespace from the submitted values.
      await api.post("/projects", {
        name: projectData.name.trim(),
        description: projectData.description.trim(),
      });

      // Wait until the newly created project appears in the API response.
      const projectAppeared = await waitForProject(
        projectData,
        existingProjectIds,
      );

      if (projectAppeared) {
        // Close the modal and clear any previous errors once creation is confirmed.
        setIsModalOpen(false);
        setModalError("");
      } else {
        // The creation request succeeded, but the project was not found
        // after all polling attempts.
        setModalError(
          "The API accepted your project, but it hasn't appeared yet. Please refresh the project list shortly.",
        );
      }
    } catch (error) {
      // Display an error if the creation request fails.
      setModalError(
        error.response?.data?.message || "Unable to create project.",
      );
    } finally {
      // Re-enable the form once the creation process finishes.
      setCreating(false);
    }
  }

  // Display a loading message while the initial project request is processing.
  if (loading) {
    return (
      <AppShell>
        <p>Loading projects...</p>
      </AppShell>
    );
  }

  // Display an error if the project list could not be retrieved.
  if (error) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Render the projects page once the data has loaded successfully.
  return (
    <AppShell>
      <section className="projects-page">
        <div className="page-header">
          <div>
            <h1>Projects</h1>
            <p>Manage and track your projects.</p>
          </div>

          {/* Open the create project modal and clear previous modal errors. */}
          <Button
            onClick={() => {
              setModalError("");
              setIsModalOpen(true);
            }}
          >
            + New Project
          </Button>
        </div>

        {/* Only render ProjectForm while the modal is open.
            Pass the creation handler and loading/error states as props. */}
        {isModalOpen && (
          <ProjectForm
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateProject}
            loading={creating}
            error={modalError}
          />
        )}

        {/* Pass the project data to the reusable ProjectList component. */}
        <ProjectList projects={projects} />
      </section>
    </AppShell>
  );
}
