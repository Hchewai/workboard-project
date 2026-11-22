
"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function ProjectForm({
  onClose,
  onSubmit,
  loading,
  error,
  initialProject = null,
}) {
  const [name, setName] = useState(initialProject?.name || "");
  const [description, setDescription] = useState(
    initialProject?.description || ""
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
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <div className="project-modal-header">
          <div>
            <h2 id="project-modal-title">
              {isEditing ? "Edit Project" : "Create New Project"}
            </h2>
            <p>
              {isEditing
                ? "Update your project information."
                : "Add a new project to your workspace."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="project-form-group">
            <label htmlFor="project-name">Project Name</label>

            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter project name"
              required
              maxLength={255}
            />
          </div>

          <div className="project-form-group">
            <label htmlFor="project-description">Description</label>

            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what this project is about..."
              rows={4}
            />
          </div>

          {error && (
            <p className="project-form-error">{error}</p>
          )}

          <div className="project-modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="modal-submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
