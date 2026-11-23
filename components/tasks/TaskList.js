
import TaskCard from "./TaskCard";

export default function TaskList({
  tasks,
  emptyMessage = "No tasks found.",
}) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="project-empty-state">
        <h3>No tasks found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
