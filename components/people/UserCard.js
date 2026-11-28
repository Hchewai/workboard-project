export default function UserCard({ user, onSelect, taskCount = 0 }) {
  // Generate user initials from their first and last name.
  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <button type="button" className="user-card" onClick={() => onSelect(user)}>
      <div className="user-card-header">
        {/* Display the user's initials as an avatar. */}
        <div className="user-avatar">{initials}</div>

        <div className="user-card-info">
          <h3>{user.name}</h3>
          <p>{user.email?.address || "No email available"}</p>
        </div>
      </div>

      <div className="user-card-footer">
        {/* Display how many tasks are assigned to this user. */}
        <span>
          {taskCount} {taskCount === 1 ? "task" : "tasks"} assigned
        </span>

        <span className="user-card-action">View details →</span>
      </div>
    </button>
  );
}
