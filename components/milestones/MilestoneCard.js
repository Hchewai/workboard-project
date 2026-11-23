
import Link from "next/link";
import { CalendarDays, ArrowUpRight, Flag } from "lucide-react";

export default function MilestoneCard({ milestone }) {
  return (
    <Link
      href={`/milestones/${milestone.id}`}
      className="project-card"
    >
      <div className="project-card-header">
        <div className="project-icon">
          <Flag size={20} />
        </div>
      </div>

      <div className="project-card-info">
        <h3>{milestone.title}</h3>
        <p>
          {milestone.description || "No description provided."}
        </p>
      </div>

      <div className="project-card-footer">
        <span>
          <CalendarDays size={14} />
          {milestone.due_date || "No due date"}
        </span>

        <span className="project-card-link">
          View milestone <ArrowUpRight size={15} />
        </span>
      </div>

      {milestone.project?.name && (
        <span className="task-project">
          {milestone.project.name}
        </span>
      )}
    </Link>
  );
}
