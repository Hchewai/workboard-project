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
  // Store the common properties shared by the different form elements.
  // This avoids repeating the same attributes on the input, textarea and select.
  const fieldProps = {
    id: name,
    name,
    value,
    onChange,
    required,
    disabled,
    className: "ui-form-control",
    // Indicate to assistive technologies whether the field has a validation error.
    "aria-invalid": Boolean(error),
  };

  return (
    <div className="ui-form-group">
      {/* Associate the label with its form field using the matching ID and htmlFor. */}
      <label htmlFor={name} className="ui-form-label">
        {label}
        {/* Display an asterisk when the field is required. */}
        {required && <span className="ui-required"> *</span>}
      </label>

      {/* Render a different HTML element depending on the requested field type. */}
      {type === "textarea" ? (
        // A textarea allows users to enter multiple lines of text.
        <textarea {...fieldProps} placeholder={placeholder} rows={rows} />
      ) : type === "select" ? (
        // A select element allows users to choose from a list of options.
        <select {...fieldProps}>
          {/* Provide a default option before displaying the available choices. */}
          <option value="">{placeholder || "Select an option"}</option>

          {/* Generate an option element for each entry in the options array. */}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        // Render a standard input for types such as text, date and email.
        <input {...fieldProps} type={type} placeholder={placeholder} />
      )}

      {/* Display a validation error below the field when one is provided. */}
      {error && <p className="ui-form-error">{error}</p>}
    </div>
  );
}
