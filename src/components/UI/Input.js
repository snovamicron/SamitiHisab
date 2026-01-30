import React from "react";
import "./Input.css";

/**
 * Reusable Input component with label and error handling
 *
 * @param {string} label - Input label text
 * @param {string} error - Error message to display
 * @param {string} hint - Helper text below input
 * @param {boolean} required - Whether field is required
 */
function Input({
  label,
  error,
  hint,
  required = false,
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = "",
  ...props
}) {
  const inputId = id || name;
  const hasError = Boolean(error);

  const inputClass = [
    "input__field",
    hasError ? "input__field--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="input">
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}

      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClass}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        {...props}
      />

      {error && (
        <span id={`${inputId}-error`} className="input__error" role="alert">
          {error}
        </span>
      )}

      {hint && !error && <span className="input__hint">{hint}</span>}
    </div>
  );
}

export default Input;
