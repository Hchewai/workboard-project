import MilestoneCard from "./MilestoneCard";

export default function MilestoneList({
  milestones,
  onEdit,
  onDelete,
  loading,
}) {
  // Check whether the milestones array is missing or contains no entries.
  if (!milestones || milestones.length === 0) {
    return (
      <div className="project-empty-state">
        <h3>No milestones found</h3>
        <p>Milestones will appear here once they are created.</p>
      </div>
    );
  }

  return (
    <div className="milestone-list">
      {/* Render a card for each milestone and pass down its actions. */}
      {milestones.map((milestone) => (
        <MilestoneCard
          key={milestone.id}
          milestone={milestone}
          onEdit={onEdit}
          onDelete={onDelete}
          loading={loading}
        />
      ))}
    </div>
  );
}
