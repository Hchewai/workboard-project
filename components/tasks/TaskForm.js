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
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [status, setStatus] = useState(initialValues?.status || "todo");
  const [dueDate, setDueDate] = useState(initialValues?.due_date || "");
  const [projectId, setProjectId] = useState(
    initialValues?.project?.id || initialValues?.project_id || "",
  );
  const [assignedTo, setAssignedTo] = useState(
    initialValues?.assigned_to?.id || initialValues?.assigned_to || "",
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
    <Modal
      title="Create New Task"
      description="Add a task to one of your projects."
      onClose={onClose}
      closeDisabled={loading}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Task Name"
          name="task-name"
          value={name}
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
