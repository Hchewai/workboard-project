export default function AttachmentList({ attachments }) {
  // Display an empty state when the workspace has no attachments.
  if (!attachments || attachments.length === 0) {
    return (
      <div className="attachment-empty-state">
        <h3>No attachments found</h3>
        <p>Files uploaded to your workspace will appear here.</p>
      </div>
    );
  }

  return (
    <div className="attachment-list">
      {/* Render each attachment as an individual row. */}
      {attachments.map((attachment) => {
        // Extract the filename from the end of the storage path.
        const fileName = attachment.file_path?.split("/").pop();

        return (
          <article className="attachment-item" key={attachment.id}>
            {/* Display an icon to visually identify the file. */}
            <div className="attachment-icon">
              <i className="bi bi-file-earmark"></i>
            </div>

            {/* Display the attachment information. */}
            <div className="attachment-info">
              <h3>{fileName || "Unnamed attachment"}</h3>

              <p className="attachment-path">
                {attachment.file_path || "No file path available"}
              </p>

              <p className="attachment-uploader">
                Uploaded by {attachment.uploaded_by?.name || "Unknown user"}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
