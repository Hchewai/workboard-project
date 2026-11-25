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
      type={type}
      className={`ui-button ui-button-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? loadingText : children}
    </button>
  );
}
