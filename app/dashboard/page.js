import AppShell from "../../components/layout/AppShell";

import StatCard from "../../components/dashboard/StatCard";
import RecentProjects from "../../components/dashboard/RecentProjects";
import UpcomingTasks from "../../components/dashboard/UpcomingTasks";

import { dashboardStats } from "/lib/mockData";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="dashboard-page">
        {/* Dashboard heading */}
        <div className="dashboard-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Here's what's happening with your workspace.</p>
          </div>
        </div>

        {/* Statistics */}
        <section className="dashboard-stats">
          {dashboardStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </section>

        {/* Dashboard content */}
        <section className="dashboard-content">
          <RecentProjects />

          <UpcomingTasks />
        </section>
      </div>
    </AppShell>
  );
}
