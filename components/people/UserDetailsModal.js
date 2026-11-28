import Modal from "../ui/Modal";

export default function UserDetailsModal({ user, tasks, onClose }) {
  // Find tasks assigned to the selected workspace member.
  const assignedTasks = tasks.filter(
    (task) => String(task.assigned_to?.id) === String(user.id),
  );

  // Convert API status values into readable labels.
  function formatStatus(status) {
    const statusLabels = {
      todo: "To Do",
      in_progress: "In Progress",
      done: "Completed",
    };

    return statusLabels[status] || status;
  }

  return (
    <Modal
      title={user.name}
      description="Workspace member details and assigned tasks."
      onClose={onClose}
      size="large"
    >
      <div className="user-details">
        {/* Display the selected member's contact information. */}
        <div className="user-details-info">
          <h3>Contact Information</h3>
          <p>
            <strong>Email:</strong>{" "}
            {user.email?.address || "No email available"}
          </p>
          <p>
            <strong>Member since:</strong> {user.created?.human || "Unknown"}
          </p>
        </div>

        {/* Display the tasks assigned to this member. */}
        <div className="user-details-tasks">
          <h3>Assigned Tasks ({assignedTasks.length})</h3>

          {assignedTasks.length === 0 ? (
            <p>This member currently has no assigned tasks.</p>
          ) : (
            <div className="user-task-list">
              {assignedTasks.map((task) => (
                <div className="user-task-item" key={task.id}>
                  <div>
                    <h4>{task.name}</h4>
                    <p>{task.project?.name || "No project assigned"}</p>
                  </div>

                  <span className={`task-status status-${task.status}`}>
                    {formatStatus(task.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
