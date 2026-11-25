export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  rows = 3,
  disabled = false,
  error = "",
}) {
  const fieldProps = {
    id: name,
    name,
    value,
    onChange,
    required,
    disabled,
    className: "ui-form-control",
    "aria-invalid": Boolean(error),
  };

  return (
    <div className="ui-form-group">
      <label htmlFor={name} className="ui-form-label">
        {label}
        {required && <span className="ui-required"> *</span>}
      </label>

      {type === "textarea" ? (
        <textarea {...fieldProps} placeholder={placeholder} rows={rows} />
      ) : type === "select" ? (
        <select {...fieldProps}>
          <option value="">{placeholder || "Select an option"}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input {...fieldProps} type={type} placeholder={placeholder} />
      )}

      {error && <p className="ui-form-error">{error}</p>}
    </div>
  );
}
