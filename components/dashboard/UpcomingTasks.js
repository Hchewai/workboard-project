import Link from "next/link";
import { ArrowUpRight, Circle } from "lucide-react";
import { upcomingTasks } from "/lib/mockData";

export default function UpcomingTasks() {
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
        {upcomingTasks.map((task) => (
          <div className="upcoming-task-item" key={task.id}>
            <Circle size={18} className="task-circle" />

            <div className="task-details">
              <h3>{task.title}</h3>
              <p>Due {task.dueDate}</p>
            </div>

            <span className={`task-priority ${task.priority.toLowerCase()}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
