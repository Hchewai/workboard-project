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
  // Retrieve the task ID from the dynamic URL.
  // For example, /tasks/12 gives an ID of 12.
  const params = useParams();
  const id = params.id;

  // Store the task retrieved from the API.
  const [task, setTask] = useState(null);

  // Track the initial loading state and any errors when fetching the task.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useRouter allows programmatic navigation after actions such as deletion.
  const router = useRouter();

  // Control the edit modal and store the data needed by its dropdowns.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Store workspace tags available for assignment to the task.
  const [tags, setTags] = useState([]);

  // Track task-related actions, such as editing and deleting.
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Store checklist items associated with this task.
  const [checklistItems, setChecklistItems] = useState([]);

  // Track the checklist's initial loading state and any loading errors.
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [checklistError, setChecklistError] = useState("");

  // Store the value entered into the new checklist item field.
  const [newChecklistItem, setNewChecklistItem] = useState("");

  // Track checklist operations and their errors.
  const [checklistActionLoading, setChecklistActionLoading] = useState(false);
  const [checklistActionError, setChecklistActionError] = useState("");

  // Store the IDs of checklist items currently being updated or deleted.
  // These allow individual checklist items to display their own loading states.
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);

  // Fetch the individual task when the page loads or the URL ID changes.
  useEffect(() => {
    async function fetchTask() {
      try {
        setLoading(true);
        setError("");

        // Send a GET request to retrieve the task matching the URL ID.
        const response = await api.get(`/tasks/${id}`);

        // Store the returned task in React state.
        setTask(response.data);
      } catch (error) {
        // Display the API error message or a fallback message.
        setError(error.response?.data?.message || "Unable to load task.");
      } finally {
        // Stop the loading state regardless of the request outcome.
        setLoading(false);
      }
    }

    // Only fetch the task once a valid ID is available.
    if (id) {
      fetchTask();
    }
  }, [id]);

  // Retrieve the checklist items associated with the current task.
  useEffect(() => {
    async function fetchChecklistItems() {
      try {
        setChecklistLoading(true);
        setChecklistError("");

        // Retrieve the checklist items from the API.
        const response = await api.get("/checklist-items");

        // Support both direct array responses and arrays nested inside data.
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Filter the results to include only items belonging to this task.
        // String() ensures the task IDs are compared using the same data type.
        const taskItems = items.filter(
          (item) => String(item.task_id) === String(id),
        );

        // Store the filtered checklist items in React state.
        setChecklistItems(taskItems);
      } catch (error) {
        // Store an error if the checklist cannot be retrieved.
        setChecklistError(
          error.response?.data?.message || "Unable to load checklist items.",
        );
      } finally {
        // Stop the checklist loading state.
        setChecklistLoading(false);
      }
    }

    // Only retrieve checklist items once a valid task ID is available.
    if (id) {
      fetchChecklistItems();
    }
  }, [id]);

  // Retrieve the projects and users required by the edit form.

  // Retrieve the projects, users and tags required by the edit form.
  async function openEditModal() {
    try {
      setActionError("");
      setActionLoading(true);

      // Fetch all three sets of options concurrently.
      const [projectsResponse, usersResponse, tagsResponse] = await Promise.all(
        [api.get("/projects"), api.get("/users"), api.get("/tags")],
      );

      // Extract the project array from the API response.
      const projectData = projectsResponse.data.data;

      // Support both direct array responses and arrays nested inside data.
      const userData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data.data;

      // The tags endpoint returns a JSON array.
      const tagData = Array.isArray(tagsResponse.data)
        ? tagsResponse.data
        : tagsResponse.data.data;

      // Store the available options for the edit form.
      setProjects(projectData);
      setUsers(userData);
      setTags(tagData);

      // Open the edit modal once all options have loaded.
      setIsModalOpen(true);
    } catch (error) {
      // Display an error if any request fails.
      setActionError(
        error.response?.data?.message || "Unable to load edit options.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  // Handle creating a new checklist item.
  async function handleCreateChecklistItem(event) {
    // Prevent the browser from performing its default form submission.
    event.preventDefault();

    // Remove unnecessary whitespace from the submitted label.
    const label = newChecklistItem.trim();

    // Do not submit an empty checklist item.
    if (!label) return;

    try {
      setChecklistActionLoading(true);
      setChecklistActionError("");

      // Record the IDs of existing checklist items before creation.
      // A Set makes it easier to check whether an ID already exists.
      // String() normalises IDs so different data types can be compared.
      const existingIds = new Set(
        checklistItems.map((item) => String(item.id)),
      );

      // Send a POST request to create the checklist item.
      await api.post("/checklist-items", {
        task_id: id,
        label,
        completed: false,
      });

      // The API processes creation asynchronously,
      // so periodically check whether the new item has appeared.
      let createdItem = null;

      // Retry up to 15 times, waiting two seconds between requests.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/checklist-items");

        // Extract the checklist items from the API response.
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Only consider checklist items belonging to the current task.
        const taskItems = items.filter(
          (item) => String(item.task_id) === String(id),
        );

        // Find the newly created item by checking its label
        // and confirming that its ID did not exist before creation.
        createdItem = taskItems.find(
          (item) => item.label === label && !existingIds.has(String(item.id)),
        );

        if (createdItem) {
          // Update the checklist displayed on the page.
          setChecklistItems(taskItems);

          // Clear the input field after successful creation.
          setNewChecklistItem("");
          break;
        }
      }

      // Display an error if the new item was not found after polling.
      if (!createdItem) {
        setChecklistActionError(
          "The API accepted your item, but it hasn't appeared yet. Please refresh shortly.",
        );
      }
    } catch (error) {
      // Handle errors from the creation request or polling process.
      setChecklistActionError(
        error.response?.data?.message || "Unable to create checklist item.",
      );
    } finally {
      // Re-enable checklist actions once the process finishes.
      setChecklistActionLoading(false);
    }
  }

  // Handle deleting an individual checklist item.
  async function handleDeleteChecklistItem(item) {
    // Ask the user to confirm before deleting the checklist item.
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.label}"?`,
    );

    // Stop the function if the user cancels.
    if (!confirmed) return;

    try {
      // Store the ID of the item currently being deleted.
      setDeletingItemId(item.id);
      setChecklistActionError("");

      // Send a DELETE request for the selected checklist item.
      await api.delete(`/checklist-items/${item.id}`);

      let itemDeleted = false;

      // Poll the API to check whether the item has been removed.
      // Retry up to 15 times, waiting two seconds between attempts.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/checklist-items");

        // Extract the latest checklist items.
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Filter the results to include only items belonging to this task.
        const taskItems = items.filter(
          (checklistItem) => String(checklistItem.task_id) === String(id),
        );

        // Check whether the deleted item is no longer present.
        itemDeleted = !taskItems.some(
          (checklistItem) => String(checklistItem.id) === String(item.id),
        );

        if (itemDeleted) {
          // Update the displayed checklist once deletion is confirmed.
          setChecklistItems(taskItems);
          break;
        }
      }

      // Display an error if the item still exists after all attempts.
      if (!itemDeleted) {
        setChecklistActionError(
          "The API accepted the deletion, but the item is still appearing. Please refresh shortly.",
        );
      }
    } catch (error) {
      // Display an error if the deletion or verification request fails.
      setChecklistActionError(
        error.response?.data?.message || "Unable to delete checklist item.",
      );
    } finally {
      // Reset the ID so the item no longer displays a deletion loading state.
      setDeletingItemId(null);
    }
  }

  // Handle changing a checklist item's completion status.
  async function handleToggleChecklistItem(item) {
    // Determine whether the item is already completed.
    // The API may represent boolean values as true, 1 or "1".
    const isCompleted =
      item.completed === true || item.completed === 1 || item.completed === "1";

    // Reverse the current completion state.
    const newCompletedState = !isCompleted;

    try {
      // Store the ID of the item currently being updated.
      setUpdatingItemId(item.id);
      setChecklistActionError("");

      // Send a PUT request containing the updated completion status.
      // The existing task ID and label are also included in the payload.
      await api.put(`/checklist-items/${item.id}`, {
        task_id: id,
        label: item.label,
        completed: newCompletedState,
      });

      let updatedItem = null;

      // Poll the API until the updated completion status is available.
      // Retry up to 15 times, waiting two seconds between attempts.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/checklist-items");

        // Extract the latest checklist items.
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Filter the results to include only items belonging to this task.
        const taskItems = items.filter(
          (checklistItem) => String(checklistItem.task_id) === String(id),
        );

        // Find the specific checklist item being updated.
        updatedItem = taskItems.find(
          (checklistItem) => String(checklistItem.id) === String(item.id),
        );

        if (updatedItem) {
          // Normalise the returned completion value into a boolean.
          const updatedCompleted =
            updatedItem.completed === true ||
            updatedItem.completed === 1 ||
            updatedItem.completed === "1";

          // Only update the displayed checklist once the API reflects
          // the requested completion state.
          if (updatedCompleted === newCompletedState) {
            setChecklistItems(taskItems);
            break;
          }
        }
      }

      // Handle the case where the checklist item could not be found.
      if (!updatedItem) {
        setChecklistActionError(
          "The API accepted your update, but the checklist item could not be found.",
        );
      } else {
        // Check the returned completion value one final time.
        const updatedCompleted =
          updatedItem.completed === true ||
          updatedItem.completed === 1 ||
          updatedItem.completed === "1";

        // Display an error if the API has not applied the requested state.
        if (updatedCompleted !== newCompletedState) {
          setChecklistActionError(
            "The API accepted your update, but the completion status hasn't changed yet.",
          );
        }
      }
    } catch (error) {
      // Handle errors from the update request or verification process.
      setChecklistActionError(
        error.response?.data?.message || "Unable to update checklist item.",
      );
    } finally {
      // Reset the ID so the item no longer displays an updating state.
      setUpdatingItemId(null);
    }
  }

  // Handle updating the current task.

  // Handle updating the current task and its assigned tags.
  async function handleUpdateTask(taskData) {
    try {
      setActionLoading(true);
      setActionError("");

      // Separate tag IDs because they use a different API endpoint.
      const { tag_ids = [], ...taskPayload } = taskData;

      // First, update the task's normal properties.
      await api.put(`/tasks/${id}`, taskPayload);

      // Wait for the updated task to appear in the API.
      let updatedTask = null;

      // Retry up to 30 times, waiting two seconds between requests.
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get("/tasks");

        const updatedTasks = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Find the task being edited.
        updatedTask = updatedTasks.find(
          (item) => String(item.id) === String(id),
        );

        // Check whether the task properties match the submitted values.
        if (
          updatedTask &&
          updatedTask.name === taskPayload.name &&
          updatedTask.description === taskPayload.description &&
          updatedTask.status === taskPayload.status &&
          updatedTask.due_date === taskPayload.due_date
        ) {
          break;
        }
      }

      // Confirm that the normal task update was successful.
      if (
        !updatedTask ||
        updatedTask.name !== taskPayload.name ||
        updatedTask.description !== taskPayload.description ||
        updatedTask.status !== taskPayload.status ||
        updatedTask.due_date !== taskPayload.due_date
      ) {
        setActionError(
          "The API accepted your update, but the changes haven't appeared yet. Please refresh shortly.",
        );
        return;
      }

      // Update the displayed task before synchronising its tags.
      setTask(updatedTask);

      // Send the selected tag IDs to the dedicated tag synchronisation endpoint.
      // An empty array removes all tags currently assigned to the task.
      await api.put(`/tasks/${id}/tags`, {
        tag_ids,
      });

      // Wait for the updated tag assignments to appear in the task response.
      let refreshedTask = null;
      let tagsSynced = false;

      const expectedTagIds = tag_ids.map(String).sort();

      // Retry up to 15 times, waiting two seconds between requests.
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await api.get(`/tasks/${id}`);
        refreshedTask = response.data;

        // Extract the tag IDs returned by the API.
        const returnedTagIds = (refreshedTask.tags || [])
          .map((tag) =>
            typeof tag === "object" ? String(tag.id) : String(tag),
          )
          .sort();

        // Check whether the returned tags match the selected tags.
        tagsSynced =
          JSON.stringify(returnedTagIds) === JSON.stringify(expectedTagIds);

        if (tagsSynced) {
          break;
        }
      }

      // Update the task displayed on the page with the latest API response.
      if (refreshedTask) {
        setTask(refreshedTask);
      }

      if (!tagsSynced) {
        setActionError(
          "The task was updated, but its tag changes haven't appeared yet. Please refresh shortly.",
        );
        return;
      }

      // Close the edit modal once both updates are confirmed.
      setIsModalOpen(false);
    } catch (error) {
      // Display an error if either API operation fails.
      setActionError(error.response?.data?.message || "Unable to update task.");
    } finally {
      // Re-enable task actions once the update process finishes.
      setActionLoading(false);
    }
  }

  // Handle deleting the current task.
  async function handleDeleteTask() {
    // Ask the user to confirm before permanently deleting the task.
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone.",
    );

    // Stop the function if the user cancels.
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setActionError("");

      // Send a DELETE request for the current task.
      await api.delete(`/tasks/${id}`);

      // Wait until the deleted task disappears from the API.
      let taskDeleted = false;

      // Retry the API request up to 30 times, waiting two seconds between attempts.
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Retrieve the latest task list.
        const response = await api.get("/tasks");

        const updatedTasks = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Check whether the task ID is no longer present in the response.
        taskDeleted = !updatedTasks.some((item) => item.id === id);

        if (taskDeleted) {
          // Redirect to the tasks list once deletion is confirmed.
          router.replace("/tasks");
          break;
        }
      }

      // Display an error if the task still exists after all attempts.
      if (!taskDeleted) {
        setActionError(
          "The API accepted the deletion, but the task is still appearing. Please refresh shortly.",
        );
      }
    } catch (error) {
      // Handle errors from the deletion request or verification process.
      setActionError(error.response?.data?.message || "Unable to delete task.");
    } finally {
      // Reset the task action loading state.
      setActionLoading(false);
    }
  }

  // Display a loading message while the task is being retrieved.
  if (loading) {
    return (
      <AppShell>
        <p>Loading task...</p>
      </AppShell>
    );
  }

  // Display an error if the task could not be loaded.
  if (error) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Handle cases where no task was returned by the API.
  if (!task) {
    return (
      <AppShell>
        <p>Task not found.</p>
      </AppShell>
    );
  }

  // Render the task details, checklist and associated comments.
  return (
    <AppShell>
      <section className="tasks-page">
        <div className="page-header">
          <div>
            <h1>{task.name}</h1>
            <p>Task details and information.</p>
          </div>

          <div className="project-detail-actions">
            {/* Open the edit modal to modify the current task. */}
            <Button onClick={openEditModal} disabled={actionLoading}>
              Edit Task
            </Button>

            {/* Delete the task after the user confirms the action. */}
            <Button
              variant="danger"
              onClick={handleDeleteTask}
              disabled={actionLoading}
            >
              Delete Task
            </Button>
          </div>
        </div>

        {/* Display the task description and its associated information. */}
        <div className="project-detail-card">
          {/* Display the tags assigned to the current task. */}
          <div>
            <strong>Tags</strong>

            <div className="task-detail-tags">
              {task.tags?.length > 0 ? (
                task.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="task-detail-tag"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <p>No tags assigned.</p>
              )}
            </div>
          </div>
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

        {/* Display the checklist associated with the current task. */}
        <div className="project-detail-card checklist-section">
          <div className="checklist-header">
            <div>
              <h2>Checklist</h2>
              <p>Track the smaller steps required to complete this task.</p>
            </div>
          </div>

          {/* Show a loading message until the checklist has been retrieved.
              Otherwise, render the reusable ChecklistList component. */}
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

          {/* Display errors from checklist creation, editing or deletion. */}
          {checklistActionError && (
            <p className="form-error">{checklistActionError}</p>
          )}

          {/* Render comments associated with this task.
              The commentableType and commentableId identify the parent record. */}
          <CommentsSection commentableType="task" commentableId={id} />
        </div>

        {/* Display errors from task editing or deletion. */}
        {actionError && <p className="form-error">{actionError}</p>}

        {/* Only render TaskForm when the edit modal is open.
            Pass the existing task as initialValues to populate the form. */}
        {isModalOpen && (
          <TaskForm
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleUpdateTask}
            loading={actionLoading}
            error={actionError}
            projects={projects}
            users={users}
            initialValues={task}
            tags={tags}
          />
        )}
      </section>
    </AppShell>
  );
}
