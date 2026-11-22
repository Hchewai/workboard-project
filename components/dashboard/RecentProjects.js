
import Link from "next/link";
import { Folder, ArrowUpRight } from "lucide-react";

export default function RecentProjects({ projects }) {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <h2>Recent Projects</h2>
          <p>Your recently created projects</p>
        </div>

        <Link href="/projects" className="panel-link">
          View all
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="recent-project-list">
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              className="recent-project-item"
            >
              <div className="project-icon">
                <Folder size={19} />
              </div>

              <div className="project-details">
                <h3>{project.name}</h3>
                <p>{project.description || "No description provided."}</p>
              </div>

              <span className="project-card-link">
                View <ArrowUpRight size={15} />
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
