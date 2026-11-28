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

  // Store validation errors before submitting the form.
  const [validationError, setValidationError] = useState("");

  function handleSubmit(event) {
    // Prevent the browser's default form submission and page refresh.
    event.preventDefault();

    // Validate the required fields before submitting the task.
    if (!name.trim()) {
      setValidationError("Task name is required.");
      return;
    }

    if (!description.trim()) {
      setValidationError("Task description is required.");
      return;
    }

    if (!projectId) {
      setValidationError("Please select a project.");
      return;
    }

    if (!assignedTo) {
      setValidationError("Please select a user.");
      return;
    }

    if (!dueDate) {
      setValidationError("Please select a due date.");
      return;
    }

    // Clear validation errors when all required fields are valid.
    setValidationError("");

    // Pass the collected form values to the parent component for API submission.
    onSubmit({
      name: name.trim(),
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
          onChange={(event) => {
            setName(event.target.value);
            setValidationError("");
          }}
          placeholder="Enter task name"
        />

        <FormField
          label="Description"
          name="task-description"
          type="textarea"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setValidationError("");
          }}
          placeholder="Describe the task"
          rows={4}
        />

        <FormField
          label="Project"
          name="task-project"
          type="select"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setValidationError("");
          }}
          placeholder="Select a project"
          // Convert the projects array into the options format expected by FormField.
          options={projects.map((project) => ({
            value: project.id,
            label: project.name,
          }))}
        />

        <FormField
          label="Assigned To"
          name="task-assignee"
          type="select"
          value={assignedTo}
          onChange={(event) => {
            setAssignedTo(event.target.value);
            setValidationError("");
          }}
          placeholder="Select a user"
          // Convert the users array into selectable user options.
          options={users.map((user) => ({
            value: user.id,
            label: user.name,
          }))}
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
            onChange={(event) => {
              setDueDate(event.target.value);
              setValidationError("");
            }}
          />
        </div>

        {/* Display either a client-side validation error or an API error. */}
        {(validationError || error) && (
          <p className="ui-form-error">{validationError || error}</p>
        )}

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
