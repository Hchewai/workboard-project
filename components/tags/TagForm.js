"use client";

import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

export default function TagForm({
  onClose,
  onSubmit,
  loading,
  error,
  initialTag = null,
}) {
  // Initialise the form with existing tag data when editing.
  // Otherwise, start with empty values when creating a new tag.
  const [name, setName] = useState(initialTag?.name || "");
  const [color, setColor] = useState(initialTag?.color || "blue");

  // Store client-side validation errors before submitting the form.
  const [validationError, setValidationError] = useState("");

  // Determine whether the form is creating or editing a tag.
  const isEditing = Boolean(initialTag);

  function handleSubmit(event) {
    // Prevent the browser's default form submission and page refresh.
    event.preventDefault();

    // Ensure the tag has a name before submitting it.
    if (!name.trim()) {
      setValidationError("Tag name is required.");
      return;
    }

    // Clear previous validation errors before submitting.
    setValidationError("");

    // Pass the tag information to the parent component for API submission.
    onSubmit({
      name: name.trim(),
      color,
    });
  }

  return (
    <Modal
      // Change the modal title and description depending on the operation.
      title={isEditing ? "Edit Tag" : "Create New Tag"}
      description={
        isEditing
          ? "Update your tag information."
          : "Create a new tag for your workspace."
      }
      onClose={onClose}
      // Prevent the modal from closing while an API request is processing.
      closeDisabled={loading}
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Tag Name"
          name="tag-name"
          value={name}
          // Update the tag name and clear previous validation errors.
          onChange={(event) => {
            setName(event.target.value);
            setValidationError("");
          }}
          placeholder="Enter tag name"
        />

        <FormField
          label="Tag Colour"
          name="tag-color"
          type="select"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          // Provide a predefined selection of tag colours.
          options={[
            { value: "red", label: "Red" },
            { value: "orange", label: "Orange" },
            { value: "yellow", label: "Yellow" },
            { value: "green", label: "Green" },
            { value: "blue", label: "Blue" },
            { value: "purple", label: "Purple" },
            { value: "grey", label: "Grey" },
          ]}
        />

        {/* Display either a validation error or an API error. */}
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
            {/* Change the button label depending on the operation. */}
            {isEditing ? "Save Changes" : "Create Tag"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
