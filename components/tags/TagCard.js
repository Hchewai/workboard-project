import Button from "../ui/Button";

export default function TagCard({ tag, onEdit, onDelete, deleting }) {
  // Convert the tag colour into a CSS-compatible background colour.
  // This allows the tag to visually represent its assigned colour.
  const tagColor = tag.color?.toLowerCase() || "grey";

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-card-info">
          {/* Display the tag name and its assigned colour. */}
          <h3>{tag.name}</h3>
          <span
            className="tag-color-indicator"
            style={{ backgroundColor: tagColor }}
            title={`Tag colour: ${tagColor}`}
          />
        </div>
      </div>

      <div className="project-card-footer">
        {/* Display the tag's colour as text for additional clarity. */}
        <span>Colour: {tagColor}</span>

        {/* Provide actions for managing the current tag. */}
        <div className="tag-card-actions">
          <Button
            variant="secondary"
            onClick={() => onEdit(tag)}
            disabled={deleting}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={() => onDelete(tag)}
            loading={deleting}
            disabled={deleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
