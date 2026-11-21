import { Folder, ListTodo, CheckCircle, Flag } from "lucide-react";

const icons = {
  folder: Folder,
  list: ListTodo,
  check: CheckCircle,
  flag: Flag,
};

export default function StatCard({ title, value, icon }) {
  const Icon = icons[icon];

  return (
    <div className="stat-card">
      <div className="stat-card-icon">
        <Icon size={21} />
      </div>

      <div className="stat-card-info">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}
