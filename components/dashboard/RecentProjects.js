import Link from "next/link";
import { Folder, ArrowUpRight } from "lucide-react";
import { recentProjects } from "/lib/mockData";

export default function RecentProjects() {
  return (
    <section className="dashboard-panel">
      <div className="panel-header">
        <div>
          <h2>Recent Projects</h2>
          <p>Your recently updated projects</p>
        </div>

        <Link href="/projects" className="panel-link">
          View all
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="recent-project-list">
        {recentProjects.map((project) => (
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
              <p>{project.description}</p>

              <div className="project-progress">
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <span>{project.progress}%</span>
              </div>
            </div>

            <span
              className={`project-status ${project.status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {project.status}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
