
import Link from "next/link";
import { ArrowUpRight, Circle } from "lucide-react";

export default function UpcomingTasks({ tasks }) {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <h2>Upcoming Tasks</h2>
          <p>Tasks that need your attention</p>
        </div>

        <Link href="/tasks" className="panel-link">
          View all
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="upcoming-task-list">
        {tasks.length === 0 ? (
          <p>No upcoming tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div className="upcoming-task-item" key={task.id}>
              <Circle size={18} className="task-circle" />

              <div className="task-details">
                <h3>{task.name}</h3>
                <p>
                  Due {task.due_date
                    ? new Date(`${task.due_date}T00:00:00`).toLocaleDateString()
                    : "No due date"}
                </p>
              </div>

              <span className={`task-status ${task.status}`}>
                {task.status.replace("_", " ")}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
