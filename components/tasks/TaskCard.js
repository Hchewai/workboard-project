import Link from "next/link";
import { CalendarDays, ArrowUpRight, ListTodo } from "lucide-react";

const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TaskCard({ task }) {
  const status = task.status || "todo";

  return (
    <Link href={`/tasks/${task.id}`} className="task-card">
      <div className="task-card-main">
        <div className="task-icon">
          <ListTodo size={20} />
        </div>

        <div className="task-card-info">
          <h3>{task.name}</h3>
          <p>{task.description || "No description provided."}</p>

          {task.project?.name && (
            <span className="task-project">
              {task.project.name}
            </span>
          )}
        </div>
      </div>

      <div className="task-card-meta">
        <span className={`task-status ${status}`}>
          {statusLabels[status] || status}
        </span>

        <span className="task-due-date">
          <CalendarDays size={15} />
          {task.due_date || "No due date"}
        </span>

        <ArrowUpRight size={17} className="task-arrow" />
      </div>
    </Link>
  );
}