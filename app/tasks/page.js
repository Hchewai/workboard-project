
"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import TaskList from "../../components/tasks/TaskList";
import TaskForm from "../../components/tasks/TaskForm";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

const [isModalOpen, setIsModalOpen] = useState(false);
const [creating, setCreating] = useState(false);
const [modalError, setModalError] = useState("");

const [projects, setProjects] = useState([]);
const [users, setUsers] = useState([]);
const [optionsLoading, setOptionsLoading] = useState(false)


  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tasks");
      const taskData = response.data.data;

      setTasks(taskData);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, []);


  async function openTaskModal() {
  try {
    setOptionsLoading(true);
    setModalError("");

    const [projectsResponse, usersResponse] = await Promise.all([
      api.get("/projects"),
      api.get("/users"),
    ]);

    const projectData = projectsResponse.data.data;
    const userData = Array.isArray(usersResponse.data)
      ? usersResponse.data
      : usersResponse.data.data;

    setProjects(projectData);
    setUsers(userData);

    setIsModalOpen(true);
  } catch (error) {
    setModalError(
      error.response?.data?.message || "Unable to load project and user options."
    );
  } finally {
    setOptionsLoading(false);
  }
}


async function handleCreateTask(taskData) {
  try {
    setCreating(true);
    setModalError("");

    // Keep track of existing task IDs before creating the new task
    const existingIds = tasks.map((task) => task.id);

    // Send the new task to the API
    await api.post("/tasks", taskData);

    // The API processes task creation asynchronously,
    // so check periodically until the new task appears.
    let createdTask = null;

   for (let attempt = 0; attempt < 30; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const response = await api.get("/tasks");

  const updatedTasks = Array.isArray(response.data)
    ? response.data
    : response.data.data;

  createdTask = updatedTasks.find(
    (task) =>
      !existingIds.includes(task.id) &&
      task.name === taskData.name
  );

  if (createdTask) {
    setTasks(updatedTasks);
    break;
  }
}
    if (createdTask) {
      setIsModalOpen(false);
    } else {
      setModalError(
        "The API accepted your task, but it hasn't appeared yet. Please refresh the task list shortly."
      );
    }
  } catch (error) {
    setModalError(
      error.response?.data?.message || "Unable to create task."
    );
  } finally {
    setCreating(false);
  }
}
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks based on the search query
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase().trim();

    const searchableFields = [
      task.name,
      task.description,
      task.status,
      task.due_date,
      task.project?.name,
      task.assigned_to?.name,
    ];

    return searchableFields.some((field) =>
      String(field || "").toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <AppShell>
        <p>Loading tasks...</p>
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
      <section className="tasks-page">
        <div className="page-header">
          <div>
            <h1>My Tasks</h1>
            <p>Manage and track your tasks.</p>
          </div>
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
      <button
  type="button"
  className="project-create-button"
  onClick={openTaskModal}
  disabled={optionsLoading}
>
  {optionsLoading ? "Loading..." : "+ New Task"}
</button>
        </div>
        

        <div className="task-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search tasks..."
            aria-label="Search tasks"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />

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
