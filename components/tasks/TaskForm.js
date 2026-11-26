"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

export default function TaskForm({
  onClose,
  onSubmit,
  loading,
  error,
  projects,
  users,
  initialValues = null,
}) {
  // Initialise the form fields using existing task data when editing.
  // Otherwise, use default values when creating a new task.
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [status, setStatus] = useState(initialValues?.status || "todo");
  const [dueDate, setDueDate] = useState(initialValues?.due_date || "");

  // Support both nested project data and a direct project ID.
  const [projectId, setProjectId] = useState(
    initialValues?.project?.id || initialValues?.project_id || "",
  );

  // Support both a nested assigned user object and a direct user ID.
  const [assignedTo, setAssignedTo] = useState(
    initialValues?.assigned_to?.id || initialValues?.assigned_to || "",
  );

  function handleSubmit(event) {
    // Prevent the browser's default form submission and page refresh.
    event.preventDefault();

    // Pass the collected form values to the parent component for API submission.
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
    <Modal
      title="Create New Task"
      description="Add a task to one of your projects."
      onClose={onClose}
      // Prevent the modal from closing while a request is in progress.
      closeDisabled={loading}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Task Name"
          name="task-name"
          value={name}
          // Update the task name state whenever the input changes.
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter task name"
          required
        />

        <FormField
          label="Description"
          name="task-description"
          type="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the task"
          rows={4}
          required
        />

        <FormField
          label="Project"
          name="task-project"
          type="select"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          placeholder="Select a project"
          // Convert the projects array into the options format expected by FormField.
          options={projects.map((project) => ({
            value: project.id,
            label: project.name,
          }))}
          required
        />

        <FormField
          label="Assigned To"
          name="task-assignee"
          type="select"
          value={assignedTo}
          onChange={(event) => setAssignedTo(event.target.value)}
          placeholder="Select a user"
          // Convert the users array into selectable user options.
          options={users.map((user) => ({
            value: user.id,
            label: user.name,
          }))}
          required
        />

        <div className="form-row">
          <FormField
            label="Status"
            name="task-status"
            type="select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            // Define the available task statuses and their display labels.
            options={[
              { value: "todo", label: "To Do" },
              { value: "in_progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ]}
          />

          <FormField
            label="Due Date"
            name="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />
        </div>

        {/* Display any validation or API error passed down from the parent. */}
        {error && <p className="ui-form-error">{error}</p>}

        <div className="project-modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button type="submit" loading={loading} loadingText="Creating...">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
