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
  const [name, setName] = useState(initialProject?.name || "");
  const [description, setDescription] = useState(
    initialProject?.description || "",
  );

  const isEditing = Boolean(initialProject);

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      name,
      description,
    });
  }

  return (
    <Modal
      title={isEditing ? "Edit Project" : "Create New Project"}
      description={
        isEditing
          ? "Update your project information."
          : "Add a new project to your workspace."
      }
      onClose={onClose}
      closeDisabled={loading}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Project Name"
          name="project-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter project name"
          required
        />

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

        {error && <p className="ui-form-error">{error}</p>}

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
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
