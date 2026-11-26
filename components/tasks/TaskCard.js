import Link from "next/link";
import { CalendarDays, ArrowUpRight, ListTodo } from "lucide-react";

// Map API status values to more readable labels for the interface.
const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TaskCard({ task }) {
  // Use "todo" as the default status if the task does not have one.
  const status = task.status || "todo";

  return (
    // Make the entire task card clickable and link to its detail page.
    <Link href={`/tasks/${task.id}`} className="task-card">
      <div className="task-card-main">
        <div className="task-icon">
          <ListTodo size={20} />
        </div>

        <div className="task-card-info">
          <h3>{task.name}</h3>

          {/* Display a fallback message if the task has no description. */}
          <p>{task.description || "No description provided."}</p>

          {/* Only display the associated project if its name is available. */}
          {task.project?.name && (
            <span className="task-project">{task.project.name}</span>
          )}
        </div>
      </div>

      <div className="task-card-meta">
        <span className={`task-status ${status}`}>
          {/* Display the readable status label, or the original value as a fallback. */}
          {statusLabels[status] || status}
        </span>

        <span className="task-due-date">
          <CalendarDays size={15} />
          {/* Display the task's due date or a fallback message. */}
          {task.due_date || "No due date"}
        </span>

        {/* Visual indicator that the task card can be opened. */}
        <ArrowUpRight size={17} className="task-arrow" />
      </div>
    </Link>
  );
}
