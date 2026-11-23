
export default function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled = false,
  loading = false,
}) {
  return (
    <button
      type={type}
      className={`ui-button ui-button-${variant}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
