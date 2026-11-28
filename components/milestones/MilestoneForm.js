"use client";

import { useState } from "react";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Modal from "../ui/Modal";

export default function MilestoneForm({
  projects = [],
  fixedProject = null,
  onClose,
  onSubmit,
  loading,
  error,
  initialValues = null,
}) {
  // Initialise form fields using existing milestone data when editing.
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [projectId, setProjectId] = useState(
    fixedProject?.id || initialValues?.project?.id || "",
  );
  const [dueDate, setDueDate] = useState(initialValues?.due_date || "");

  // Store validation errors before submitting the form.
  const [validationError, setValidationError] = useState("");

  // Determine whether the form is being used to create or edit a milestone.
  const isEditing = Boolean(initialValues);

  function handleSubmit(event) {
    event.preventDefault();

    // Validate the required fields before submitting the milestone.
    if (!title.trim()) {
      setValidationError("Milestone title is required.");
      return;
    }

    if (!description.trim()) {
      setValidationError("Milestone description is required.");
      return;
    }

    const selectedProject =
      fixedProject ||
      projects.find((project) => String(project.id) === String(projectId));

    if (!selectedProject) {
      setValidationError("The selected project could not be found.");
      return;
    }

    if (!dueDate) {
      setValidationError("Please select a due date.");
      return;
    }

    setValidationError("");

    // Pass the milestone data to the parent component for API submission.
    onSubmit({
      project_id: selectedProject.id,
      workspace_id:
        selectedProject.workspace?.id ||
        selectedProject.workspace_id ||
        initialValues?.workspace?.id,
      title: title.trim(),
      description,
      due_date: dueDate,
      completed_at: initialValues?.completed_at || null,
    });
  }

  return (
    <Modal
      title={isEditing ? "Edit Milestone" : "Create Milestone"}
      onClose={onClose}
      closeDisabled={loading}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Milestone Title"
          name="milestone-title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setValidationError("");
          }}
          placeholder="Enter milestone title"
        />

        <FormField
          label="Description"
          name="milestone-description"
          type="textarea"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setValidationError("");
          }}
          placeholder="Describe the milestone"
        />

        {/* Only show the project selector when a fixed project was not supplied. */}
        {!fixedProject && (
          <FormField
            label="Project"
            name="milestone-project"
            type="select"
            value={projectId}
            onChange={(event) => {
              setProjectId(event.target.value);
              setValidationError("");
            }}
            options={projects.map((project) => ({
              value: project.id,
              label: project.name,
            }))}
          />
        )}

        <FormField
          label="Due Date"
          name="milestone-due-date"
          type="date"
          value={dueDate}
          onChange={(event) => {
            setDueDate(event.target.value);
            setValidationError("");
          }}
        />

        {(validationError || error) && (
          <p className="ui-form-error">{validationError || error}</p>
        )}

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
