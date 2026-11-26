import { Folder, ListTodo, CheckCircle, Flag } from "lucide-react";

// Map icon names to their corresponding Lucide React components.
// This allows the parent component to choose an icon using a string.
const icons = {
  folder: Folder,
  list: ListTodo,
  check: CheckCircle,
  flag: Flag,
};

export default function StatCard({ title, value, icon }) {
  // Look up the requested icon component using the icon prop.
  const Icon = icons[icon];

  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        {/* Render the selected icon as a React component. */}
        <Icon size={21} />
      </div>

      <div className="stat-card-info">
        {/* Display the statistic's value and its descriptive title. */}
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}
