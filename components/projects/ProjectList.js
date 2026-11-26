import ProjectCard from "./ProjectCard";

export default function ProjectList({ projects }) {
  // Check whether the projects array is missing or contains no entries.
  if (!projects || projects.length === 0) {
    return (
      // Display an empty-state message when there are no projects to show.
      <div className="project-empty-state">
        <h3>No projects found</h3>
        <p>Try adjusting your search or create a new project.</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {/* Loop through the projects array and render a card for each project. */}
      {projects.map((project) => (
        <ProjectCard
          // Use the project ID as a unique key for React.
          key={project.id}
          // Pass the current project object to the card component.
          project={project}
        />
      ))}
    </div>
  );
}
