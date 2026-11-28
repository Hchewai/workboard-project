import TagCard from "./TagCard";

export default function TagList({ tags, onEdit, onDelete, deletingId }) {
  // Check whether the tags array is missing or contains no entries.
  if (!tags || tags.length === 0) {
    return (
      // Display an empty-state message when there are no tags to show.
      <div className="project-empty-state">
        <h3>No tags found</h3>
        <p>Create a tag to start categorising your tasks.</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {/* Loop through the tags array and render a card for each tag. */}
      {tags.map((tag) => (
        <TagCard
          // Use the tag ID as a unique key for React.
          key={tag.id}
          // Pass the current tag object to the card component.
          tag={tag}
          // Pass the edit and delete handlers from the parent page.
          onEdit={onEdit}
          onDelete={onDelete}
          // Identify whether this particular tag is being deleted.
          deleting={String(deletingId) === String(tag.id)}
        />
      ))}
    </div>
  );
}
