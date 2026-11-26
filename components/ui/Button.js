export default function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
  loading = false,
  loadingText = "Loading...",
}) {
  return (
    <button
      // Use the supplied button type, defaulting to "button" to avoid
      // accidentally submitting a form.
      type={type}
      // Combine the base button class with the selected style variant.
      className={`ui-button ui-button-${variant}`}
      // Pass the click handler down to the native HTML button.
      onClick={onClick}
      // Disable interaction if the button is disabled or currently loading.
      disabled={disabled || loading}
    >
      {/* Display loading text while an operation is in progress.
          Otherwise, render the content passed between the Button tags. */}
      {loading ? loadingText : children}
    </button>
  );
}
