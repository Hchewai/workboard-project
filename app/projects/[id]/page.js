"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "../../../lib/api";
import AppShell from "../../../components/layout/AppShell";
import ProjectForm from "../../../components/projects/ProjectForm";
import Button from "../../../components/ui/Button";
import CommentsSection from "../../../components/comments/CommentsSection";
import TaskList from "../../../components/tasks/TaskList";
import MilestoneList from "../../../components/milestones/MilestoneList";

export default function ProjectDetailsPage() {
  // Retrieve the project ID from the dynamic URL.
  const { id } = useParams();

  // Store the project and its associated workspace data.
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);

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

  // Fetch the project, workspace tasks and milestones from the API.
  async function fetchProject() {
    const [projectResponse, tasksResponse, milestonesResponse] =
      await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/tasks"),
        api.get("/milestones"),
      ]);

    // Store the returned project in React state.
    setProject(projectResponse.data);

    // Extract the task array from the paginated API response.
    const taskData = Array.isArray(tasksResponse.data)
      ? tasksResponse.data
      : tasksResponse.data.data || [];

    // Extract the milestone array from the paginated API response.
    const milestoneData = Array.isArray(milestonesResponse.data)
      ? milestonesResponse.data
      : milestonesResponse.data.data || [];

    // Store the retrieved workspace data in React state.
    setTasks(taskData);
    setMilestones(milestoneData);

    // Return the project so other functions can inspect its properties.
    return projectResponse.data;
  }

  // Retrieve the project and related data when the page loads or URL ID changes.
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

  // Filter workspace tasks to show only those belonging to this project.
  const projectTasks = tasks.filter(
    (task) => String(task.project?.id) === String(id),
  );

  // Filter workspace milestones to show only those belonging to this project.
  const projectMilestones = milestones.filter(
    (milestone) => String(milestone.project?.id) === String(id),
  );

  // Calculate task statistics using the filtered project tasks.
  const taskStats = {
    total: projectTasks.length,
    todo: projectTasks.filter((task) => task.status === "todo").length,
    inProgress: projectTasks.filter((task) => task.status === "in_progress")
      .length,
    completed: projectTasks.filter((task) => task.status === "done").length,
  };

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

  // Display a loading message while the project data is being retrieved.
  if (loading) {
    return (
      <AppShell>
        <p>Loading project...</p>
      </AppShell>
    );
  }

  // Display an error if the project data could not be loaded.
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

  // Render the project dashboard and available management actions.
  return (
    <AppShell>
      <section className="project-details-page">
        {/* Project heading and management actions. */}
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

        {/* Display a summary of the project's task statuses. */}
        <div className="project-dashboard-stats">
          <div className="project-stat-card">
            <span>{taskStats.total}</span>
            <p>Total Tasks</p>
          </div>

          <div className="project-stat-card">
            <span>{taskStats.todo}</span>
            <p>To Do</p>
          </div>

          <div className="project-stat-card">
            <span>{taskStats.inProgress}</span>
            <p>In Progress</p>
          </div>

          <div className="project-stat-card">
            <span>{taskStats.completed}</span>
            <p>Completed</p>
          </div>
        </div>

        {/* Display project tasks and milestones side by side. */}
        <div className="project-dashboard-columns">
          <div className="project-dashboard-column">
            <div className="project-dashboard-heading">
              <h2>Tasks</h2>
              <span>{projectTasks.length}</span>
            </div>

            <TaskList
              tasks={projectTasks}
              emptyMessage="There are no tasks assigned to this project yet."
            />
          </div>

          <div className="project-dashboard-column">
            <div className="project-dashboard-heading">
              <h2>Milestones</h2>
              <span>{projectMilestones.length}</span>
            </div>

            <MilestoneList milestones={projectMilestones} />
          </div>
        </div>

        {/* Display comments associated with this particular project. */}
        <CommentsSection commentableType="project" commentableId={id} />

        {/* Display any errors returned during the deletion process. */}
        {deleteError && <p className="text-danger">{deleteError}</p>}

        {/* Only render ProjectForm when the edit modal is open. */}
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
