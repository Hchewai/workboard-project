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
      description="Tasks currently assigned to this workspace member."
      onClose={onClose}
      size="large"
    >
      <div className="user-details">
        <div className="user-details-tasks">
          <div className="user-details-heading">
            <h3>Assigned Tasks</h3>
            <span>{assignedTasks.length}</span>
          </div>

          {assignedTasks.length === 0 ? (
            <p className="user-tasks-empty">
              This member currently has no assigned tasks.
            </p>
          ) : (
            <div className="user-task-list">
              {assignedTasks.map((task) => (
                <div className="user-task-item" key={task.id}>
                  {/* Display the task name and its associated project. */}
                  <div className="user-task-info">
                    <h4>{task.name}</h4>
                    <p>{task.project?.name || "No project assigned"}</p>
                  </div>

                  {/* Display the task status on the right. */}
                  <span className={`user-task-status ${task.status}`}>
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
