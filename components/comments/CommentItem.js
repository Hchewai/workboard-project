import { Pencil, Trash2 } from "lucide-react";

import Button from "../ui/Button";
import FormField from "../ui/FormField";

export default function CommentItem({
  comment,
  isEditing,
  editContent,
  onEditChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  loading,
}) {
  return (
    <article className="comment-item">
      {/* Keep the comment content separate from its action buttons. */}
      <div className="comment-item-content">
        <div className="comment-item-header">
          {/* Display the comment author's name, with a fallback if unavailable. */}
          <strong>{comment.user?.name || "Unknown user"}</strong>
        </div>

        {/* Switch between the editing form and the normal comment display. */}
        {isEditing ? (
          <form
            onSubmit={(event) => {
              // Prevent the browser from refreshing the page.
              event.preventDefault();

              // Pass the current comment to the parent's save handler.
              onSave(comment);
            }}
          >
            <FormField
              label="Edit comment"
              name="content"
              type="textarea"
              value={editContent}
              // Update the edited comment content in the parent component.
              onChange={(event) => onEditChange(event.target.value)}
              required
            />

            <div className="comment-actions">
              <Button
                type="submit"
                loading={loading}
                loadingText="Saving..."
                disabled={!editContent.trim()}
              >
                Save Changes
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}
      </div>

      {/* Display compact icon actions on the right when not editing. */}
      {!isEditing && (
        <div className="comment-item-controls">
          <button
            type="button"
            className="comment-icon-button"
            onClick={() => onEdit(comment)}
            disabled={loading}
            aria-label="Edit comment"
            title="Edit comment"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            className="comment-icon-button comment-delete-button"
            onClick={() => onDelete(comment)}
            disabled={loading}
            aria-label="Delete comment"
            title="Delete comment"
          >
            <Trash2 size={17} />
          </button>
        </div>
      )}
    </article>
  );
}
