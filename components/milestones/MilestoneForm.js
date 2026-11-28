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
  // Initialise form fields using existing milestone data when editing.
  // If no initial values are provided, use empty strings for a new milestone.
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [projectId, setProjectId] = useState(initialValues?.project?.id || "");
  const [dueDate, setDueDate] = useState(initialValues?.due_date || "");

  // Store validation errors before submitting the form.
  const [validationError, setValidationError] = useState("");

  // Determine whether the form is being used to create or edit a milestone.
  const isEditing = Boolean(initialValues);

  function handleSubmit(event) {
    // Prevent the browser's default form submission and page refresh.
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

    if (!projectId) {
      setValidationError("Please select a project.");
      return;
    }

    if (!dueDate) {
      setValidationError("Please select a due date.");
      return;
    }

    // Find the full project object that matches the selected project ID.
    const selectedProject = projects.find(
      (project) => String(project.id) === String(projectId),
    );

    // Stop submission if the selected project cannot be found.
    if (!selectedProject) {
      setValidationError("The selected project could not be found.");
      return;
    }

    // Clear validation errors when all required fields are valid.
    setValidationError("");

    // Pass the milestone data to the parent component for API submission.
    onSubmit({
      project_id: selectedProject.id,

      // Retrieve the workspace ID from the available project or milestone data.
      // This accounts for different ways the API may structure the workspace relationship.
      workspace_id:
        selectedProject.workspace?.id ||
        selectedProject.workspace_id ||
        initialValues?.workspace?.id,

      title: title.trim(),
      description,
      due_date: dueDate,

      // Preserve the existing completion date when editing.
      // Otherwise, send null for a new milestone.
      completed_at: initialValues?.completed_at || null,
    });
  }

  return (
    <Modal
      // Change the modal title depending on whether a milestone is being created or edited.
      title={isEditing ? "Edit Milestone" : "Create Milestone"}
      onClose={onClose}
      closeDisabled={loading}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Milestone Title"
          name="milestone-title"
          value={title}
          // Update the title state whenever the user changes the input.
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

        <FormField
          label="Project"
          name="milestone-project"
          type="select"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
            setValidationError("");
          }}
          // Convert the projects array into the format expected by FormField.
          options={projects.map((project) => ({
            value: project.id,
            label: project.name,
          }))}
        />

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

        {/* Display either a client-side validation error or an API error. */}
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
            // Display different loading text depending on the current operation.
            loadingText={isEditing ? "Saving..." : "Creating..."}
          >
            {/* Change the submit button label depending on the form's purpose. */}
            {isEditing ? "Save Changes" : "Create Milestone"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
