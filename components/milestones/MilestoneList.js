
import MilestoneCard from "./MilestoneCard";

export default function MilestoneList({ milestones }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="project-empty-state">
        <h3>No milestones found</h3>
        <p>
          Milestones will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {milestones.map((milestone) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
        />
      ))}
    </div>
  );
}
