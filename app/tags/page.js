"use client";

import { useCallback, useEffect, useState } from "react";

import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";
import TagList from "../../components/tags/TagList";
import TagForm from "../../components/tags/TagForm";
import Button from "../../components/ui/Button";

export default function TagsPage() {
  // Control whether the create/edit tag modal is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Store the tags retrieved from the API.
  const [tags, setTags] = useState([]);

  // Store the tag currently being edited.
  // A null value indicates that a new tag is being created.
  const [selectedTag, setSelectedTag] = useState(null);

  // Track the initial loading state and tag creation/editing process.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store page-level errors and errors displayed inside the modal.
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  // Track which tag is currently being deleted.
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all workspace tags from the API.
  // useCallback keeps the function reference stable between renders.
  const fetchTags = useCallback(async (showLoading = true) => {
    try {
      // Only show the page loading state when requested.
      // This allows tag data to refresh in the background.
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      // Send a GET request to retrieve all workspace tags.
      const response = await api.get("/tags");

      // Support both direct array responses and arrays nested inside data.
      const tagData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      // Update React state with the retrieved tags.
      setTags(tagData);

      // Return the data so other functions can use the latest tag list.
      return tagData;
    } catch (error) {
      // Display the API error message or a fallback message.
      setError(error.response?.data?.message || "Unable to load tags.");

      // Return null to indicate that the request failed.
      return null;
    } finally {
      // Only stop the loading state if it was enabled for this request.
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Wait for a tag to appear with the expected information.
  // This is necessary because the API uses asynchronous 202 responses.
  async function waitForTag(tagData, tagId = null, existingTagIds = new Set()) {
    const maxAttempts = 30;
    const interval = 2000;

    // Retry the API request up to 30 times, waiting two seconds each time.
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      // Retrieve the latest tags without showing the full-page loading state.
      const latestTags = await fetchTags(false);

      // Continue to the next attempt if the request failed.
      if (!latestTags) {
        continue;
      }

      // When editing, find the existing tag using its ID.
      // When creating, find a new tag that matches the submitted information.
      const matchingTag = tagId
        ? latestTags.find(
            (tag) =>
              String(tag.id) === String(tagId) &&
              tag.name === tagData.name &&
              tag.color === tagData.color,
          )
        : latestTags.find(
            (tag) =>
              !existingTagIds.has(String(tag.id)) &&
              tag.name === tagData.name &&
              tag.color === tagData.color,
          );

      // Return true once the expected tag information is found.
      if (matchingTag) {
        return true;
      }
    }

    // Return false if the expected tag was not found after all attempts.
    return false;
  }

  // Wait until a tag is no longer present in the API.
  async function waitForTagDeletion(tagId) {
    const maxAttempts = 30;
    const interval = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      const latestTags = await fetchTags(false);

      if (!latestTags) {
        continue;
      }

      // Check whether the deleted tag is absent from the latest response.
      const tagStillExists = latestTags.some(
        (tag) => String(tag.id) === String(tagId),
      );

      if (!tagStillExists) {
        return true;
      }
    }

    return false;
  }

  // Fetch the initial tag list when the page first loads.
  useEffect(() => {
    let ignore = false;

    async function loadTags() {
      try {
        // Send a GET request to retrieve all workspace tags.
        const response = await api.get("/tags");

        // Support both direct array responses and arrays nested inside data.
        const tagData = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        // Only update state if the component is still mounted.
        if (!ignore) {
          setTags(tagData);
        }
      } catch (error) {
        // Display the API error message or a fallback message.
        if (!ignore) {
          setError(error.response?.data?.message || "Unable to load tags.");
        }
      } finally {
        // Stop the loading state once the request finishes.
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    // Execute the initial tag request.
    loadTags();

    // Prevent state updates if the component unmounts before completion.
    return () => {
      ignore = true;
    };
  }, []);

  // Open the form for creating a new tag.
  function openCreateModal() {
    setSelectedTag(null);
    setModalError("");
    setIsModalOpen(true);
  }

  // Open the form with the selected tag's existing information.
  function handleEditTag(tag) {
    setSelectedTag(tag);
    setModalError("");
    setIsModalOpen(true);
  }

  // Handle creating a new tag or updating an existing one.
  async function handleSaveTag(tagData) {
    try {
      setSaving(true);
      setModalError("");

      // Record existing tag IDs before creating a new tag.
      // This allows us to identify the newly created tag afterwards.
      const existingTagIds = new Set(tags.map((tag) => String(tag.id)));

      if (selectedTag) {
        // Send a PUT request to update the selected tag.
        await api.put(`/tags/${selectedTag.id}`, tagData);

        // Wait until the updated information appears in the API.
        const tagUpdated = await waitForTag(tagData, selectedTag.id);

        if (tagUpdated) {
          // Close the modal once the update is confirmed.
          setIsModalOpen(false);
          setSelectedTag(null);
        } else {
          setModalError(
            "The API accepted the update, but the changes haven't appeared yet. Please refresh shortly.",
          );
        }
      } else {
        // Send a POST request to create a new workspace tag.
        await api.post("/tags", tagData);

        // Wait until the newly created tag appears in the API.
        const tagCreated = await waitForTag(tagData, null, existingTagIds);

        if (tagCreated) {
          // Close the modal once creation is confirmed.
          setIsModalOpen(false);
        } else {
          setModalError(
            "The API accepted your tag, but it hasn't appeared yet. Please refresh shortly.",
          );
        }
      }
    } catch (error) {
      // Display an error if the create or update request fails.
      setModalError(error.response?.data?.message || "Unable to save tag.");
    } finally {
      // Re-enable the form once the operation finishes.
      setSaving(false);
    }
  }

  // Handle deleting an existing workspace tag.
  async function handleDeleteTag(tag) {
    // Ask the user to confirm before permanently deleting the tag.
    const confirmed = window.confirm(
      `Are you sure you want to delete "${tag.name}"? This action cannot be undone.`,
    );

    // Stop the function if the user cancels.
    if (!confirmed) return;

    try {
      // Store the ID of the tag currently being deleted.
      setDeletingId(tag.id);
      setError("");

      // Send a DELETE request for the selected tag.
      await api.delete(`/tags/${tag.id}`);

      // Wait until the deleted tag disappears from the API.
      const tagDeleted = await waitForTagDeletion(tag.id);

      if (!tagDeleted) {
        // Display an error if the tag still exists after all attempts.
        setError(
          "The API accepted the deletion, but the tag is still appearing. Please refresh shortly.",
        );
      }
    } catch (error) {
      // Display an error if the deletion request fails.
      setError(error.response?.data?.message || "Unable to delete tag.");
    } finally {
      // Reset the ID so the tag no longer displays a loading state.
      setDeletingId(null);
    }
  }

  // Display a loading message while the initial tag request is processing.
  if (loading) {
    return (
      <AppShell>
        <p>Loading tags...</p>
      </AppShell>
    );
  }

  // Display an error if the tag list could not be retrieved.
  if (error && tags.length === 0) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Render the Tags page once the initial data has loaded.
  return (
    <AppShell>
      <section className="projects-page">
        <div className="page-header">
          <div>
            <h1>Tags</h1>
            <p>Manage tags used to categorise your tasks.</p>
          </div>

          {/* Open the create tag form. */}
          <Button onClick={openCreateModal}>+ New Tag</Button>
        </div>

        {/* Only render TagForm while the modal is open.
            Pass the selected tag when editing an existing tag. */}
        {isModalOpen && (
          <TagForm
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSaveTag}
            loading={saving}
            error={modalError}
            initialTag={selectedTag}
          />
        )}

        {/* Display the current tag list and provide edit/delete handlers. */}
        <TagList
          tags={tags}
          onEdit={handleEditTag}
          onDelete={handleDeleteTag}
          deletingId={deletingId}
        />

        {/* Display page-level errors, such as deletion or loading failures. */}
        {error && <p className="form-error">{error}</p>}
      </section>
    </AppShell>
  );
}
