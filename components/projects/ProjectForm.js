"use client";

import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

export default function ProjectForm({
  onClose,
  onSubmit,
  loading,
  error,
  initialProject = null,
}) {
  // Initialise the form fields with existing project data when editing.
  // If creating a new project, start with empty values.
  const [name, setName] = useState(initialProject?.name || "");
  const [description, setDescription] = useState(
    initialProject?.description || "",
  );

  const [validationError, setValidationError] = useState("");

  // Determine whether the form is being used to create or edit a project.
  const isEditing = Boolean(initialProject);

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setValidationError("Project name is required.");
      return;
    }

    setValidationError("");

    onSubmit({
      name: name.trim(),
      description,
    });
  }
  return (
    <Modal
      // Change the modal title and description depending on the operation.
      title={isEditing ? "Edit Project" : "Create New Project"}
      description={
        isEditing
          ? "Update your project information."
          : "Add a new project to your workspace."
      }
      onClose={onClose}
      // Prevent the modal from closing while a request is in progress.
      closeDisabled={loading}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Project Name"
          name="project-name"
          value={name}
          // Update the name state whenever the user changes the input.
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter project name"
        />

        {/* Hidden input retained from the original form implementation. */}
        <input type="hidden" name="project-name-max-length" value="" readOnly />

        <FormField
          label="Description"
          name="project-description"
          type="textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what this project is about..."
          rows={4}
        />

        {/* Display any validation or API error passed down from the parent. */}
        {(validationError || error) && (
          <p className="ui-form-error">{validationError || error}</p>
        )}

        <div className="project-modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="submit" loading={loading}>
            {/* Change the button label depending on the current operation. */}
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
