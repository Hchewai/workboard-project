import { CalendarDays, Flag, Pencil, Trash2 } from "lucide-react";

export default function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
  loading,
}) {
  return (
    <article className="milestone-list-item">
      {/* Milestone icon */}
      <div className="milestone-list-icon">
        <Flag size={20} />
      </div>

      {/* Milestone title and description */}
      <div className="milestone-list-info">
        <h3>{milestone.title}</h3>
        <p>{milestone.description || "No description provided."}</p>
      </div>

      {/* Display the milestone due date */}
      <div className="milestone-list-date">
        <CalendarDays size={16} />
        <span>{milestone.due_date || "No due date"}</span>
      </div>

      {/* Milestone management actions */}
      <div className="milestone-card-actions">
        <button
          type="button"
          onClick={() => onEdit(milestone)}
          disabled={loading}
          aria-label={`Edit ${milestone.title}`}
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(milestone)}
          disabled={loading}
          aria-label={`Delete ${milestone.title}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
