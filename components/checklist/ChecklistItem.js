export default function ChecklistItem({ item, onToggle, onDelete, loading }) {
  const isCompleted =
    item.completed === true || item.completed === 1 || item.completed === "1";

  return (
    <div className="checklist-item">
      <div className="checklist-item-content">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(item)}
          disabled={loading}
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

      <button
        type="button"
        className="checklist-delete-button"
        onClick={() => onDelete(item)}
        disabled={loading}
        aria-label={`Delete ${item.label}`}
      >
        Delete
      </button>
    </div>
  );
}
