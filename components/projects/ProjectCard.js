import Link from "next/link";
import { Folder, ArrowUpRight } from "lucide-react";

export default function ProjectCard({ project }) {
  return (
    // Make the entire project card clickable and link to its detail page.
    <Link href={`/projects/${project.id}`} className="project-card">
      <div className="project-card-header">
        <div className="project-icon">
          <Folder size={20} />
        </div>
      </div>

      <div className="project-card-info">
        <h3>{project.name}</h3>

        {/* Display a fallback message if the project has no description. */}
        <p>{project.description || "No description provided."}</p>
      </div>

      <div className="project-card-footer">
        {/* Display the project's creation date in a human-readable format. */}
        <span>Created: {project.created?.human || "Unknown"}</span>

        {/* Visual indicator that the project card can be opened. */}
        <span className="project-card-link">
          View project
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}
