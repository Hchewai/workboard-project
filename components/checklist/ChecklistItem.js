import Button from "../ui/Button";

export default function ChecklistItem({
  item,
  onToggle,
  onDelete,
  loading,
  deleting,
}) {
  const isCompleted =
    item.completed === true || item.completed === 1 || item.completed === "1";

  return (
    <div className="checklist-item">
      <div className="checklist-item-content">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(item)}
          disabled={loading || deleting}
          aria-label={`Mark ${item.label} as ${
            isCompleted ? "incomplete" : "complete"
          }`}
        />

        <span
          className={
            isCompleted ? "checklist-label completed" : "checklist-label"
          }
        >
          {item.label}
        </span>
      </div>

      <Button
        variant="danger"
        onClick={() => onDelete(item)}
        loading={deleting}
        loadingText="Deleting..."
        disabled={loading}
      >
        Delete
      </Button>
    </div>
  );
}
