"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import TaskList from "../../components/tasks/TaskList";
import TaskForm from "../../components/tasks/TaskForm";

export default function TasksPage() {
  // Store the tasks retrieved from the API.
  const [tasks, setTasks] = useState([]);

  // Track the initial loading state and any errors when fetching tasks.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Store the text entered into the task search field.
  const [searchQuery, setSearchQuery] = useState("");

  // Control the visibility of the create task modal.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track the task creation process and any errors within the modal.
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState("");

  // Store projects, users and tags used to populate the TaskForm.
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);

  // Track whether the form options are being retrieved.
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Store errors from operations performed after task creation.
  const [actionError, setActionError] = useState("");

  // Fetch all tasks from the API.
  // useCallback keeps the function reference stable between renders.
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Send a GET request to retrieve the tasks.
      const response = await api.get("/tasks");

      // Extract the task array from the API response.
      const taskData = response.data.data;

      // Store the retrieved tasks in React state.
      setTasks(taskData);
    } catch (error) {
      // Display the API error message or a fallback message.
      setError(error.response?.data?.message || "Unable to load tasks.");
    } finally {
      // Stop the loading state regardless of whether the request succeeds or fails.
      setLoading(false);
    }
  }, []);

  // Retrieve projects, users and tags before opening the create task modal.
  async function openTaskModal() {
    try {
      setOptionsLoading(true);
      setModalError("");
      setActionError("");

      // Promise.all sends all three API requests concurrently.
      // The form only opens once all three requests have finished.
      const [projectsResponse, usersResponse, tagsResponse] = await Promise.all(
        [api.get("/projects"), api.get("/users"), api.get("/tags")],
      );

      // Extract the project array from the API response.
      const projectData = projectsResponse.data.data;

      // Support both direct array responses and arrays nested inside data.
      const userData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data.data;

      // Support both direct array responses and arrays nested inside data.
      const tagData = Array.isArray(tagsResponse.data)
        ? tagsResponse.data
        : tagsResponse.data.data;

      // Store the available options for the TaskForm.
      setProjects(projectData);
      setUsers(userData);
      setTags(tagData);

      // Open the modal once all options have loaded successfully.
      setIsModalOpen(true);
    } catch (error) {
      // Display an error if any of the required API requests fail.
      setModalError(
        error.response?.data?.message ||
          "Unable to load project, user and tag options.",
      );
    } finally {
      // Stop the options loading state after the requests finish.
      setOptionsLoading(false);
    }
  }

  // Handle creating a new task using the data submitted by TaskForm.
  async function handleCreateTask(taskData) {
    try {
      setCreating(true);
      setModalError("");
      setActionError("");

      // Separate tag IDs from the task information.
      // Tags are assigned through a dedicated API endpoint.
      const { tag_ids = [], ...taskPayload } = taskData;

      // Record the IDs of existing tasks before creating the new task.
      // This helps distinguish the newly created task from existing records.
      const existingIds = tasks.map((task) => String(task.id));

      // Send a POST request containing only the task information.
      await api.post("/tasks", taskPayload);

      // The API processes task creation asynchronously,
      // so periodically check whether the new task has appeared.
      let createdTask = null;

      // Retry the API request up to 30 times, waiting two seconds between attempts.
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/tasks");

        // Extract the task array from the API response.
        const updatedTasks = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Find a task that did not exist before creation
        // and matches the name submitted through the form.
        createdTask = updatedTasks.find(
          (task) =>
            !existingIds.includes(String(task.id)) &&
            task.name === taskPayload.name,
        );

        // Once the new task is found, update the task list and stop polling.
        if (createdTask) {
          setTasks(updatedTasks);
          break;
        }
      }

      if (createdTask) {
        // Close the modal once the newly created task is confirmed.
        setIsModalOpen(false);

        // Only send a sync request if the user selected at least one tag.
        if (tag_ids.length > 0) {
          try {
            // Assign the selected tags to the newly created task.
            // The sync endpoint replaces the task's complete tag collection.
            await api.put(`/tasks/${createdTask.id}/tags`, {
              tag_ids,
            });
          } catch (error) {
            // The task was created successfully, but its tags could not be assigned.
            setActionError(
              error.response?.data?.message ||
                "Task created, but its tags could not be assigned.",
            );
          }
        }
      } else {
        // The creation request succeeded, but the task was not found
        // after all polling attempts.
        setModalError(
          "The API accepted your task, but it hasn't appeared yet. Please refresh the task list shortly.",
        );
      }
    } catch (error) {
      // Display an error if the creation request or polling fails.
      setModalError(error.response?.data?.message || "Unable to create task.");
    } finally {
      // Re-enable the form once the creation process finishes.
      setCreating(false);
    }
  }

  // Fetch the initial task list when the page first loads.
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks based on the text entered into the search field.
  const filteredTasks = tasks.filter((task) => {
    // Convert the search query to lowercase and remove surrounding whitespace.
    // This makes the search case-insensitive.
    const query = searchQuery.toLowerCase().trim();

    // Define the task properties that can be searched.
    // Related project and assigned user names are also included.
    const searchableFields = [
      task.name,
      task.description,
      task.status,
      task.due_date,
      task.project?.name,
      task.assigned_to?.name,
    ];

    // Check whether at least one searchable field contains the query.
    // some() returns true as soon as a matching field is found.
    return searchableFields.some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(query),
    );
  });

  // Display a loading message while the initial task request is processing.
  if (loading) {
    return (
      <AppShell>
        <p>Loading tasks...</p>
      </AppShell>
    );
  }

  // Display an error if the task list could not be retrieved.
  if (error) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Render the tasks page once the data has loaded successfully.
  return (
    <AppShell>
      <section className="tasks-page">
        <div className="page-header">
          <div>
            <h1>My Tasks</h1>
            <p>Manage and track your tasks.</p>
          </div>

          {/* Only render TaskForm while the create modal is open.
              Pass projects, users, tags and the creation handler as props. */}
          {isModalOpen && (
            <TaskForm
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleCreateTask}
              loading={creating}
              error={modalError}
              projects={projects}
              users={users}
              tags={tags}
            />
          )}

          {/* Open the create task modal after loading its dropdown options. */}
          <button
            type="button"
            className="project-create-button"
            onClick={openTaskModal}
            disabled={optionsLoading}
          >
            {/* Change the label while the form options load. */}
            {optionsLoading ? "Loading..." : "+ New Task"}
          </button>
        </div>

        {/* Display errors from operations performed after task creation. */}
        {actionError && <p className="form-error">{actionError}</p>}

        {/* Search field used to filter the displayed tasks. */}
        <div className="task-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          {/* Only display the clear button when a search query exists. */}
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery("")}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Pass the filtered tasks to the reusable TaskList component.
            Change the empty message depending on whether the user searched. */}
        <TaskList
          tasks={filteredTasks}
          emptyMessage={
            searchQuery
              ? "No tasks match your search."
              : "Tasks will appear here once they are created."
          }
        />
      </section>
    </AppShell>
  );
}
