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
        <strong>{comment.user?.name || "Unknown user"}</strong>
      </div>

      {isEditing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(comment);
          }}
        >
          <FormField
            label="Edit comment"
            name="content"
            type="textarea"
            value={editContent}
            onChange={(event) => onEditChange(event.target.value)}
            required
          />

          <div className="comment-actions">
            <Button
              type="submit"
              loading={loading}
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
        <>
          <p className="comment-content">{comment.content}</p>

          <div className="comment-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEdit(comment)}
              disabled={loading}
            >
              Edit
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() => onDelete(comment)}
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
