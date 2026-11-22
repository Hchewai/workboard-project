
import ProjectCard from "./ProjectCard";

export default function ProjectList({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="project-empty-state">
        <h3>No projects found</h3>
        <p>
          Try adjusting your search or create a new project.
        </p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
        />
      ))}
    </div>
  );
}
