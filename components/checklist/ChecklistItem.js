import Button from "../ui/Button";

export default function ChecklistItem({
  item,
  onToggle,
  onDelete,
  loading,
  deleting,
}) {
  // The API may return the completed value as a boolean, number or string.
  // Normalise these possible values into a boolean for the checkbox.
  const isCompleted =
    item.completed === true || item.completed === 1 || item.completed === "1";

  return (
    <div className="checklist-item">
      <div className="checklist-item-content">
        <input
          type="checkbox"
          // A controlled checkbox gets its checked state from React.
          checked={isCompleted}
          // Pass the current item to the parent component when toggled.
          onChange={() => onToggle(item)}
          // Prevent changes while an item is being updated or deleted.
          disabled={loading || deleting}
          // Provide an accessible description that changes with the current state.
          aria-label={`Mark ${item.label} as ${
            isCompleted ? "incomplete" : "complete"
          }`}
        />

        <span
          // Apply a different CSS class when the item has been completed.
          className={
            isCompleted ? "checklist-label completed" : "checklist-label"
          }
        >
          {item.label}
        </span>
      </div>

      <Button
        // Use the danger variant to visually indicate a destructive action.
        variant="danger"
        // Pass the current item to the parent component's delete handler.
        onClick={() => onDelete(item)}
        // Show the loading state while this item is being deleted.
        loading={deleting}
        loadingText="Deleting..."
        // Prevent deletion while the item is being updated.
        disabled={loading}
      >
        Delete
      </Button>
    </div>
  );
}
