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
      <div className="comment-item-header">
        {/* Display the comment author's name, with a fallback if it is unavailable. */}
        <strong>{comment.user?.name || "Unknown user"}</strong>
      </div>

      {/* Switch between the editing form and the normal comment display. */}
      {isEditing ? (
        <form
          onSubmit={(event) => {
            // Prevent the browser from refreshing the page when the form is submitted.
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
            // Update the edited comment content in the parent component's state.
            onChange={(event) => onEditChange(event.target.value)}
            required
          />

          <div className="comment-actions">
            <Button
              type="submit"
              loading={loading}
              loadingText="Saving..."
              // Prevent saving if the edited comment is empty or only whitespace.
              disabled={!editContent.trim()}
            >
              Save Changes
            </Button>

            <Button
              type="button"
              variant="secondary"
              // Exit editing mode without saving the changes.
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        // Display the comment and its available actions when not editing.
        <>
          <p className="comment-content">{comment.content}</p>

          <div className="comment-actions">
            <Button
              type="button"
              variant="secondary"
              // Pass the current comment to the parent's edit handler.
              onClick={() => onEdit(comment)}
              disabled={loading}
            >
              Edit
            </Button>

            <Button
              type="button"
              variant="danger"
              // Pass the current comment to the parent's delete handler.
              onClick={() => onDelete(comment)}
              loading={loading && false}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </article>
  );
}
