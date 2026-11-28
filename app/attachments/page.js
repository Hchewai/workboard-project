"use client";

import { useEffect, useState } from "react";
import AttachmentList from "../../components/attachments/AttachmentList";
import api from "../../lib/api";
import AppShell from "../../components/layout/AppShell";

export default function AttachmentsPage() {
  // Store the attachments retrieved from the workspace API.
  const [attachments, setAttachments] = useState([]);

  // Track whether the initial attachment request is processing.
  const [loading, setLoading] = useState(true);

  // Store any errors encountered when retrieving attachments.
  const [error, setError] = useState("");

  // Retrieve attachments when the page first loads.
  useEffect(() => {
    // Prevent state updates if the component unmounts before the request finishes.
    let ignore = false;

    async function loadAttachments() {
      try {
        // Send a GET request to retrieve the workspace attachments.
        const response = await api.get("/attachments");

        // Extract the attachment records from the paginated API response.
        const attachmentData = response.data.data;

        // Only update state if the component is still mounted.
        if (!ignore) {
          setAttachments(attachmentData);
        }
      } catch (error) {
        // Display the API error message or a fallback message.
        if (!ignore) {
          setError(
            error.response?.data?.message || "Unable to load attachments.",
          );
        }
      } finally {
        // Stop displaying the loading message once the request finishes.
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadAttachments();

    // Prevent updates to an unmounted component.
    return () => {
      ignore = true;
    };
  }, []);

  // Display a loading message while the initial request is processing.
  if (loading) {
    return (
      <AppShell>
        <p>Loading attachments...</p>
      </AppShell>
    );
  }

  // Display an error if the attachment request failed.
  if (error && attachments.length === 0) {
    return (
      <AppShell>
        <p className="text-danger">{error}</p>
      </AppShell>
    );
  }

  // Render the Attachments library once the data has loaded.
  return (
    <AppShell>
      <section className="projects-page">
        <div className="page-header">
          <div>
            <h1>Attachments</h1>
            <p>Track attachments.</p>
          </div>
        </div>

        {/* Display the current attachment list. */}
        <AttachmentList attachments={attachments} />

        {/* Display page-level errors without hiding existing attachment data. */}
        {error && <p className="form-error">{error}</p>}
      </section>
    </AppShell>
  );
}
