import MilestoneCard from "./MilestoneCard";

export default function MilestoneList({ milestones }) {
  // Check whether the milestones array is missing or contains no entries.
  if (!milestones || milestones.length === 0) {
    return (
      // Display an empty-state message when there are no milestones to show.
      <div className="project-empty-state">
        <h3>No milestones found</h3>
        <p>Milestones will appear here once they are created.</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {/* Loop through the milestones array and render a card for each milestone. */}
      {milestones.map((milestone) => (
        <MilestoneCard
          // Use the milestone ID as a unique key for React.
          key={milestone.id}
          // Pass the current milestone object to the card component.
          milestone={milestone}
        />
      ))}
    </div>
  );
}
