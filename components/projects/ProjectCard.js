
import Link from "next/link";
import { Folder, ArrowUpRight } from "lucide-react";

export default function ProjectCard({ project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="project-card"
    >
      <div className="project-card-header">
        <div className="project-icon">
          <Folder size={20} />
        </div>
      </div>

      <div className="project-card-info">
        <h3>{project.name}</h3>
        <p>{project.description || "No description provided."}</p>
      </div>

      <div className="project-card-footer">
        <span>
          Created: {project.created?.human || "Unknown"}
        </span>

        <span className="project-card-link">
          View project
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}
