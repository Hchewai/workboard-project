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

  // Determine whether the form is being used to create or edit a milestone.
  const isEditing = Boolean(initialValues);

  function handleSubmit(event) {
    // Prevent the browser's default form submission and page refresh.
    event.preventDefault();

    // Find the full project object that matches the selected project ID.
    const selectedProject = projects.find(
      (project) => project.id === projectId,
    );

    // Stop submission if the selected project cannot be found.
    if (!selectedProject) return;

    // Pass the milestone data to the parent component for API submission.
    onSubmit({
      project_id: selectedProject.id,

      // Retrieve the workspace ID from the available project or milestone data.
      // This accounts for different ways the API may structure the workspace relationship.
      workspace_id:
        selectedProject.workspace?.id ||
        selectedProject.workspace_id ||
        initialValues?.workspace?.id,

      title,
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
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Milestone Title"
          name="milestone-title"
          value={title}
          // Update the title state whenever the user changes the input.
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
          // Convert the projects array into the format expected by FormField.
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

        {/* Display any validation or API error passed down from the parent. */}
        {error && <p className="ui-form-error">{error}</p>}

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
