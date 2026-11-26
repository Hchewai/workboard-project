import { X } from "lucide-react";

export default function Modal({
  title,
  description,
  onClose,
  children,
  size = "default",
  closeDisabled = false,
}) {
  // Handle clicks on the modal overlay.
  function handleOverlayClick(event) {
    // Only close the modal if the overlay itself was clicked,
    // rather than content inside the modal.
    // Also prevent closing while an operation is in progress.
    if (event.target === event.currentTarget && !closeDisabled) {
      onClose();
    }
  }

  return (
    // The overlay covers the screen and provides the background behind the modal.
    <div className="ui-modal-overlay" onClick={handleOverlayClick}>
      <div
        // Apply a size-specific CSS class to control the modal's dimensions.
        className={`ui-modal ui-modal-${size}`}
        // Stop clicks inside the modal from triggering the overlay's click handler.
        onClick={(event) => event.stopPropagation()}
        // Accessibility attributes identify this element as a modal dialog.
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="ui-modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>

            {/* Only display the description when one is provided. */}
            {description && <p>{description}</p>}
          </div>

          {/* Close button for dismissing the modal. */}
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Render the content passed into the Modal through its children prop. */}
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
}
