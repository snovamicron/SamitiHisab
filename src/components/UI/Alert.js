import React from "react";
import "./Alert.css";

/**
 * Alert component for displaying messages
 *
 * @param {string} variant - 'info' | 'success' | 'warning' | 'error'
 */
function Alert({ children, variant = "info", title, onClose, className = "" }) {
  const alertClass = ["alert", `alert--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };

  return (
    <div className={alertClass} role="alert">
      <span className="alert__icon">{icons[variant]}</span>
      <div className="alert__content">
        {title && <strong className="alert__title">{title}</strong>}
        <span className="alert__message">{children}</span>
      </div>
      {onClose && (
        <button
          className="alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
