"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import UserList from "../../components/people/UserList";
import UserDetailsModal from "../../components/people/UserDetailsModal";

export default function PeoplePage() {
  // Store the workspace members and tasks retrieved from the API.
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Store the currently selected member for the details modal.
  // A null value indicates that no member is currently selected.
  const [selectedUser, setSelectedUser] = useState(null);

  // Track the initial loading state and any API errors.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Retrieve workspace members and tasks from the API.
  const fetchPeopleData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch both endpoints at the same time.
      const [usersResponse, tasksResponse] = await Promise.all([
        api.get("/users"),
        api.get("/tasks"),
      ]);

      // Extract the arrays from the paginated API responses.
      const userData = Array.isArray(usersResponse.data)
        ? usersResponse.data
        : usersResponse.data.data || [];

      const taskData = Array.isArray(tasksResponse.data)
        ? tasksResponse.data
        : tasksResponse.data.data || [];

      // Store the retrieved information in React state.
      setUsers(userData);
      setTasks(taskData);
    } catch (error) {
      // Display an API error message or a fallback message.
      setError(
        error.response?.data?.message || "Unable to load workspace members.",
      );
    } finally {
      // Stop the loading state once the API requests have finished.
      setLoading(false);
    }
  }, []);

  // Fetch the initial data when the page first loads.
  useEffect(() => {
    fetchPeopleData();
  }, [fetchPeopleData]);

  // Store the selected member so their details can be displayed.
  function handleSelectUser(user) {
    setSelectedUser(user);
  }

  // Close the details modal by clearing the selected member.
  function handleCloseModal() {
    setSelectedUser(null);
  }

  // Display a loading message while the API requests are processing.
  if (loading) {
    return (
      <AppShell>
        <p>Loading people...</p>
      </AppShell>
    );
  }

  // Display an error if the workspace members could not be retrieved.
  if (error && users.length === 0) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Render the People page once the initial data has loaded.
  return (
    <AppShell>
      <section className="projects-page">
        <div className="page-header">
          <div>
            <h1>People</h1>
            <p>View workspace members and the tasks assigned to them.</p>
          </div>
        </div>

        {/* Display workspace members and their assigned task counts. */}
        <UserList users={users} tasks={tasks} onSelect={handleSelectUser} />

        {/* Only display the modal when a workspace member is selected. */}
        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            tasks={tasks}
            onClose={handleCloseModal}
          />
        )}

        {/* Display page-level errors if a request fails. */}
        {error && <p className="form-error">{error}</p>}
      </section>
    </AppShell>
  );
}
