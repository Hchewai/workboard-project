import Link from "next/link";
import { CalendarDays, ArrowUpRight, Flag } from "lucide-react";

export default function MilestoneCard({ milestone }) {
  return (
    // Make the entire milestone card clickable and link to its detail page.
    <Link href={`/milestones/${milestone.id}`} className="project-card">
      <div className="project-card-header">
        <div className="project-icon">
          <Flag size={20} />
        </div>
      </div>

      <div className="project-card-info">
        <h3>{milestone.title}</h3>

        {/* Display a fallback message if the milestone has no description. */}
        <p>{milestone.description || "No description provided."}</p>
      </div>

      <div className="project-card-footer">
        <span>
          <CalendarDays size={14} />
          {/* Display the milestone's due date or a fallback message. */}
          {milestone.due_date || "No due date"}
        </span>

        {/* Visual indicator that the milestone card can be opened. */}
        <span className="project-card-link">
          View milestone <ArrowUpRight size={15} />
        </span>
      </div>

      {/* Only display the associated project if its name is available. */}
      {milestone.project?.name && (
        <span className="task-project">{milestone.project.name}</span>
      )}
    </Link>
  );
}
