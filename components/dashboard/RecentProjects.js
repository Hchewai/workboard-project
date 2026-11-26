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

        {/* Link to the full projects page. */}
        <Link href="/projects" className="panel-link">
          View all
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="recent-project-list">
        {/* Display a message if there are no projects to show. */}
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          // Loop through the projects array and render a link for each project.
          projects.map((project) => (
            <Link
              // Navigate to the individual project details page.
              href={`/projects/${project.id}`}
              // Use the project ID as a unique key for React.
              key={project.id}
              className="recent-project-item"
            >
              <div className="project-icon">
                <Folder size={19} />
              </div>

              <div className="project-details">
                <h3>{project.name}</h3>
                {/* Display a fallback message if the project has no description. */}
                <p>{project.description || "No description provided."}</p>
              </div>

              {/* Visual indicator that the project can be opened. */}
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
