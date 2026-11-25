import { X } from "lucide-react";

export default function Modal({
  title,
  description,
  onClose,
  children,
  size = "default",
  closeDisabled = false,
}) {
  function handleOverlayClick(event) {
    if (event.target === event.currentTarget && !closeDisabled) {
      onClose();
    }
  }

  return (
    <div className="ui-modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`ui-modal ui-modal-${size}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="ui-modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>

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

        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
}
