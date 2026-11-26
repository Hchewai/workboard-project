import TaskCard from "./TaskCard";

export default function TaskList({ tasks, emptyMessage = "No tasks found." }) {
  // Check whether the tasks array is missing or contains no entries.
  if (!tasks || tasks.length === 0) {
    return (
      // Display an empty-state message when there are no tasks to show.
      <div className="project-empty-state">
        <h3>No tasks found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {/* Loop through the tasks array and render a card for each task. */}
      {tasks.map((task) => (
        // Use the task ID as a unique key and pass the task data to TaskCard.
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
