import React from "react";
import "./Container.css";

/**
 * Container component for consistent page width and padding
 */
function Container({ children, className = "", size = "default" }) {
  const containerClass = `container container--${size} ${className}`.trim();

  return <div className={containerClass}>{children}</div>;
}

export default Container;
