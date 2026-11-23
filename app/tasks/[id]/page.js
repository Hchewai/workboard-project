
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "../../../lib/api";
import TaskForm from "../../../components/tasks/TaskForm";
import AppShell from "../../../components/layout/AppShell";

export default function TaskDetailsPage() {
  const params = useParams();
  const id = params.id;

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

const [isModalOpen, setIsModalOpen] = useState(false);
const [projects, setProjects] = useState([]);
const [users, setUsers] = useState([]);
const [actionLoading, setActionLoading] = useState(false);
const [actionError, setActionError] = useState("");

  useEffect(() => {
    async function fetchTask() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/tasks/${id}`);
        setTask(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load task."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTask();
    }
  }, [id]);

  async function openEditModal() {
  try {
    setActionError("");
    setActionLoading(true);

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
    setActionError(
      error.response?.data?.message || "Unable to load edit options."
    );
  } finally {
    setActionLoading(false);
  }
}

async function handleUpdateTask(taskData) {
  try {
    setActionLoading(true);
    setActionError("");

    await api.put(`/tasks/${id}`, taskData);

    // Check periodically for the updated task
    let updatedTask = null;

    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await api.get("/tasks");
      const updatedTasks = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      updatedTask = updatedTasks.find(
        (item) => item.id === id
      );

      if (
        updatedTask &&
        updatedTask.name === taskData.name &&
        updatedTask.description === taskData.description &&
        updatedTask.status === taskData.status &&
        updatedTask.due_date === taskData.due_date
      ) {
        setTask(updatedTask);
        setIsModalOpen(false);
        break;
      }
    }

    if (!updatedTask ||
      updatedTask.name !== taskData.name ||
      updatedTask.description !== taskData.description ||
      updatedTask.status !== taskData.status ||
      updatedTask.due_date !== taskData.due_date
    ) {
      setActionError(
        "The API accepted your update, but the changes haven't appeared yet. Please try refreshing shortly."
      );
    }
  } catch (error) {
    setActionError(
      error.response?.data?.message || "Unable to update task."
    );
  } finally {
    setActionLoading(false);
  }
}

async function handleDeleteTask() {
  const confirmed = window.confirm(
    "Are you sure you want to delete this task? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    setActionLoading(true);
    setActionError("");

    await api.delete(`/tasks/${id}`);

    // Wait until the deleted task disappears from the API
    let taskDeleted = false;

    for (let attempt = 0; attempt < 30; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await api.get("/tasks");

      const updatedTasks = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      taskDeleted = !updatedTasks.some(
        (item) => item.id === id
      );

      if (taskDeleted) {
        router.replace("/tasks");
        break;
      }
    }

    if (!taskDeleted) {
      setActionError(
        "The API accepted the deletion, but the task is still appearing. Please refresh shortly."
      );
    }
  } catch (error) {
    setActionError(
      error.response?.data?.message || "Unable to delete task."
    );
  } finally {
    setActionLoading(false);
  }
}

  if (loading) {
    return (
      <AppShell>
        <p>Loading task...</p>
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

  if (!task) {
    return (
      <AppShell>
        <p>Task not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="tasks-page">
     <div className="page-header">
  <div>
    <h1>{task.name}</h1>
    <p>Task details and information.</p>
  </div>

  <div className="project-detail-actions">
    <button
      type="button"
      className="project-create-button"
      onClick={openEditModal}
      disabled={actionLoading}
    >
      Edit Task
    </button>

    <button
      type="button"
      className="modal-cancel-button"
      onClick={handleDeleteTask}
      disabled={actionLoading}
    >
      Delete Task
    </button>
  </div>
</div>

        <div className="project-detail-card">
          <h2>Description</h2>
          <p>{task.description || "No description provided."}</p>

          <div className="project-detail-meta">
            <div>
              <strong>Status</strong>
              <p>{task.status || "Unknown"}</p>
            </div>

            <div>
              <strong>Due Date</strong>
              <p>{task.due_date || "No due date"}</p>
            </div>

            <div>
              <strong>Project</strong>
              <p>{task.project?.name || "No project assigned"}</p>
            </div>

            <div>
              <strong>Assigned To</strong>
              <p>{task.assigned_to?.name || "Unassigned"}</p>
            </div>
          </div>
        </div>
        {actionError && (
  <p className="form-error">{actionError}</p>
)}

{isModalOpen && (
  <TaskForm
    onClose={() => setIsModalOpen(false)}
    onSubmit={handleUpdateTask}
    loading={actionLoading}
    error={actionError}
    projects={projects}
    users={users}
    initialValues={task}
  />
)}
      </section>
    </AppShell>
  );
}
