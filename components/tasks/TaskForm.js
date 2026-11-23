
"use client";

import { useState } from "react";
import { X } from "lucide-react";


export default function TaskForm({
  onClose,
  onSubmit,
  loading,
  error,
  projects,
  users,
  initialValues = null,
}) {
const [name, setName] = useState(initialValues?.name || "");
const [description, setDescription] = useState(
  initialValues?.description || ""
);
const [status, setStatus] = useState(initialValues?.status || "todo");
const [dueDate, setDueDate] = useState(initialValues?.due_date || "");
const [projectId, setProjectId] = useState(
  initialValues?.project?.id || initialValues?.project_id || ""
);
const [assignedTo, setAssignedTo] = useState(
  initialValues?.assigned_to?.id || initialValues?.assigned_to || ""
);

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      name,
      description,
      status,
      due_date: dueDate,
      project_id: projectId,
      assigned_to: assignedTo,
    });
  }

  return (
    <div className="modal-overlay">
      <div className="project-modal">
        <div className="project-modal-header">
          <div>
            <h2>Create New Task</h2>
            <p>Add a task to one of your projects.</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-name">Task Name</label>
            <input
              id="task-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the task"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-project">Project</label>
            <select
              id="task-project"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              required
            >
              <option value="">Select a project</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-assignee">Assigned To</label>
            <select
              id="task-assignee"
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              required
            >
              <option value="">Select a user</option>

              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="form-error">{error}</p>
          )}

          <div className="project-modal-actions">
            <button
              type="button"
              className="modal-cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="project-create-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
