"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "../../../lib/api";
import TaskForm from "../../../components/tasks/TaskForm";
import AppShell from "../../../components/layout/AppShell";
import ChecklistList from "../../../components/checklist/ChecklistList";
import CommentsSection from "../../../components/comments/CommentsSection";
import Button from "../../../components/ui/Button";

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
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [checklistError, setChecklistError] = useState("");

  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [checklistActionLoading, setChecklistActionLoading] = useState(false);
  const [checklistActionError, setChecklistActionError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);

  useEffect(() => {
    async function fetchTask() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/tasks/${id}`);
        setTask(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load task.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchTask();
    }
  }, [id]);

  useEffect(() => {
    async function fetchChecklistItems() {
      try {
        setChecklistLoading(true);
        setChecklistError("");

        const response = await api.get("/checklist-items");

        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        const taskItems = items.filter(
          (item) => String(item.task_id) === String(id),
        );

        setChecklistItems(taskItems);
      } catch (error) {
        setChecklistError(
          error.response?.data?.message || "Unable to load checklist items.",
        );
      } finally {
        setChecklistLoading(false);
      }
    }

    if (id) {
      fetchChecklistItems();
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
        error.response?.data?.message || "Unable to load edit options.",
      );
    } finally {
      setActionLoading(false);
    }
  }
  async function handleCreateChecklistItem(event) {
    event.preventDefault();

    const label = newChecklistItem.trim();

    if (!label) return;

    try {
      setChecklistActionLoading(true);
      setChecklistActionError("");

      // Remember existing IDs so we can identify the newly created item.
      const existingIds = new Set(
        checklistItems.map((item) => String(item.id)),
      );

      await api.post("/checklist-items", {
        task_id: id,
        label,
        completed: false,
      });

      // The API processes creation asynchronously, so check for the new item.
      let createdItem = null;

      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/checklist-items");

        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        const taskItems = items.filter(
          (item) => String(item.task_id) === String(id),
        );

        createdItem = taskItems.find(
          (item) => item.label === label && !existingIds.has(String(item.id)),
        );

        if (createdItem) {
          setChecklistItems(taskItems);
          setNewChecklistItem("");
          break;
        }
      }

      if (!createdItem) {
        setChecklistActionError(
          "The API accepted your item, but it hasn't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      setChecklistActionError(
        error.response?.data?.message || "Unable to create checklist item.",
      );
    } finally {
      setChecklistActionLoading(false);
    }
  }
  async function handleDeleteChecklistItem(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.label}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingItemId(item.id);
      setChecklistActionError("");

      await api.delete(`/checklist-items/${item.id}`);

      let itemDeleted = false;

      // Wait for the API to finish processing the deletion.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/checklist-items");

        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        const taskItems = items.filter(
          (checklistItem) => String(checklistItem.task_id) === String(id),
        );

        itemDeleted = !taskItems.some(
          (checklistItem) => String(checklistItem.id) === String(item.id),
        );

        if (itemDeleted) {
          setChecklistItems(taskItems);
          break;
        }
      }

      if (!itemDeleted) {
        setChecklistActionError(
          "The API accepted the deletion, but the item is still appearing. Please refresh shortly.",
        );
      }
    } catch (error) {
      setChecklistActionError(
        error.response?.data?.message || "Unable to delete checklist item.",
      );
    } finally {
      setDeletingItemId(null);
    }
  }
  async function handleToggleChecklistItem(item) {
    const isCompleted =
      item.completed === true || item.completed === 1 || item.completed === "1";

    const newCompletedState = !isCompleted;

    try {
      setUpdatingItemId(item.id);
      setChecklistActionError("");

      await api.put(`/checklist-items/${item.id}`, {
        task_id: id,
        label: item.label,
        completed: newCompletedState,
      });

      let updatedItem = null;

      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/checklist-items");

        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        const taskItems = items.filter(
          (checklistItem) => String(checklistItem.task_id) === String(id),
        );

        updatedItem = taskItems.find(
          (checklistItem) => String(checklistItem.id) === String(item.id),
        );

        if (updatedItem) {
          const updatedCompleted =
            updatedItem.completed === true ||
            updatedItem.completed === 1 ||
            updatedItem.completed === "1";

          if (updatedCompleted === newCompletedState) {
            setChecklistItems(taskItems);
            break;
          }
        }
      }

      if (!updatedItem) {
        setChecklistActionError(
          "The API accepted your update, but the checklist item could not be found.",
        );
      } else {
        const updatedCompleted =
          updatedItem.completed === true ||
          updatedItem.completed === 1 ||
          updatedItem.completed === "1";

        if (updatedCompleted !== newCompletedState) {
          setChecklistActionError(
            "The API accepted your update, but the completion status hasn't changed yet.",
          );
        }
      }
    } catch (error) {
      setChecklistActionError(
        error.response?.data?.message || "Unable to update checklist item.",
      );
    } finally {
      setUpdatingItemId(null);
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

        updatedTask = updatedTasks.find((item) => item.id === id);

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

      if (
        !updatedTask ||
        updatedTask.name !== taskData.name ||
        updatedTask.description !== taskData.description ||
        updatedTask.status !== taskData.status ||
        updatedTask.due_date !== taskData.due_date
      ) {
        setActionError(
          "The API accepted your update, but the changes haven't appeared yet. Please try refreshing shortly.",
        );
      }
    } catch (error) {
      setActionError(error.response?.data?.message || "Unable to update task.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteTask() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone.",
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

        taskDeleted = !updatedTasks.some((item) => item.id === id);

        if (taskDeleted) {
          router.replace("/tasks");
          break;
        }
      }

      if (!taskDeleted) {
        setActionError(
          "The API accepted the deletion, but the task is still appearing. Please refresh shortly.",
        );
      }
    } catch (error) {
      setActionError(error.response?.data?.message || "Unable to delete task.");
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
            <Button onClick={openEditModal} disabled={actionLoading}>
              Edit Task
            </Button>

            <Button
              variant="danger"
              onClick={handleDeleteTask}
              disabled={actionLoading}
            >
              Delete Task
            </Button>
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
        <div className="project-detail-card checklist-section">
          <div className="checklist-header">
            <div>
              <h2>Checklist</h2>
              <p>Track the smaller steps required to complete this task.</p>
            </div>
          </div>

          {checklistLoading ? (
            <p>Loading checklist...</p>
          ) : (
            <ChecklistList
              items={checklistItems}
              newItem={newChecklistItem}
              onNewItemChange={setNewChecklistItem}
              onCreate={handleCreateChecklistItem}
              loading={checklistActionLoading}
              onToggle={handleToggleChecklistItem}
              updatingItemId={updatingItemId}
              onDelete={handleDeleteChecklistItem}
              deletingItemId={deletingItemId}
            />
          )}

          {checklistActionError && (
            <p className="form-error">{checklistActionError}</p>
          )}
          <CommentsSection commentableType="task" commentableId={id} />
        </div>
        {actionError && <p className="form-error">{actionError}</p>}

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
