import UserCard from "./UserCard";

export default function UserList({ users, onSelect }) {
  // Check whether the users array is missing or contains no entries.
  if (!users || users.length === 0) {
    return (
      // Display an empty-state message when there are no users to show.
      <div className="project-empty-state">
        <h3>No people found</h3>
        <p>Workspace members will appear here.</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      {/* Loop through the users array and render a card for each user. */}
      {users.map((user) => (
        <UserCard
          // Use the user ID as a unique key for React.
          key={user.id}
          // Pass the current user object to the card component.
          user={user}
          // Pass the selection handler from the parent page.
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
