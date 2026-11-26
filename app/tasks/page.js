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

  // Store projects and users used to populate the TaskForm dropdowns.
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Track whether the project and user options are being retrieved.
  const [optionsLoading, setOptionsLoading] = useState(false);

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

  // Retrieve projects and users before opening the create task modal.
  async function openTaskModal() {
    try {
      setOptionsLoading(true);
      setModalError("");

      // Promise.all sends both API requests concurrently.
      // Both requests must finish before the form can be opened.
      const [projectsResponse, usersResponse] = await Promise.all([
        api.get("/projects"),
        api.get("/users"),
      ]);

      // Extract the project array from the API response.
      const projectData = projectsResponse.data.data;

      // Support both direct array responses and arrays nested inside data.
      const userData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data.data;

      // Store the available projects and users for the form dropdowns.
      setProjects(projectData);
      setUsers(userData);

      // Open the modal once both sets of options have loaded successfully.
      setIsModalOpen(true);
    } catch (error) {
      // Display an error if either API request fails.
      setModalError(
        error.response?.data?.message ||
          "Unable to load project and user options.",
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

      // Record the IDs of existing tasks before creating the new task.
      // This helps distinguish the newly created task from existing records.
      const existingIds = tasks.map((task) => task.id);

      // Send a POST request containing the new task information.
      await api.post("/tasks", taskData);

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
            !existingIds.includes(task.id) && task.name === taskData.name,
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
              Pass the available projects, users and creation handler as props. */}
          {isModalOpen && (
            <TaskForm
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleCreateTask}
              loading={creating}
              error={modalError}
              projects={projects}
              users={users}
            />
          )}

          {/* Open the create task modal after loading its dropdown options. */}
          <button
            type="button"
            className="project-create-button"
            onClick={openTaskModal}
            disabled={optionsLoading}
          >
            {/* Change the label while the project and user options load. */}
            {optionsLoading ? "Loading..." : "+ New Task"}
          </button>
        </div>

        {/* Search field used to filter the displayed tasks. */}
        <div className="task-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={searchQuery}
            // Update the search query whenever the user types.
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          {/* Only display the clear button when a search query exists. */}
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              // Resetting the query restores the complete task list.
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
