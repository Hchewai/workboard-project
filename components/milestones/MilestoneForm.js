"use client";

import { useState } from "react";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Modal from "../ui/Modal";

export default function MilestoneForm({
  projects,
  onClose,
  onSubmit,
  loading,
  error,
  initialValues = null,
}) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [projectId, setProjectId] = useState(initialValues?.project?.id || "");
  const [dueDate, setDueDate] = useState(initialValues?.due_date || "");

  const isEditing = Boolean(initialValues);

  function handleSubmit(event) {
    event.preventDefault();

    const selectedProject = projects.find(
      (project) => project.id === projectId,
    );

    if (!selectedProject) return;

    onSubmit({
      project_id: selectedProject.id,
      workspace_id:
        selectedProject.workspace?.id ||
        selectedProject.workspace_id ||
        initialValues?.workspace?.id,
      title,
      description,
      due_date: dueDate,
      completed_at: initialValues?.completed_at || null,
    });
  }

  return (
    <Modal
      title={isEditing ? "Edit Milestone" : "Create Milestone"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Milestone Title"
          name="milestone-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter milestone title"
          required
        />

        <FormField
          label="Description"
          name="milestone-description"
          type="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the milestone"
          required
        />

        <FormField
          label="Project"
          name="milestone-project"
          type="select"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          options={projects.map((project) => ({
            value: project.id,
            label: project.name,
          }))}
          required
        />

        <FormField
          label="Due Date"
          name="milestone-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />

        {error && <p className="ui-form-error">{error}</p>}

        <div className="project-modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            type="submit"
            loading={loading}
            loadingText={isEditing ? "Saving..." : "Creating..."}
          >
            {isEditing ? "Save Changes" : "Create Milestone"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
