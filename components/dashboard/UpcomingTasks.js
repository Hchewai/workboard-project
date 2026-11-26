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

        {/* Link to the full tasks page. */}
        <Link href="/tasks" className="panel-link">
          View all
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="upcoming-task-list">
        {/* Display a message if there are no upcoming tasks. */}
        {tasks.length === 0 ? (
          <p>No upcoming tasks found.</p>
        ) : (
          // Loop through the tasks array and render each task.
          tasks.map((task) => (
            <div className="upcoming-task-item" key={task.id}>
              <Circle size={18} className="task-circle" />

              <div className="task-details">
                <h3>{task.name}</h3>
                <p>
                  Due {/* Convert the due date into a readable date format. */}
                  {task.due_date
                    ? new Date(`${task.due_date}T00:00:00`).toLocaleDateString()
                    : "No due date"}
                </p>
              </div>

              {/* Use the task status as a CSS class to apply status-specific styling. */}
              <span className={`task-status ${task.status}`}>
                {/* Replace the first underscore with a space for display. */}
                {task.status.replace("_", " ")}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
