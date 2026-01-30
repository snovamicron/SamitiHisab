import React from "react";
import "./Card.css";

/**
 * Reusable Card component
 *
 * @param {string} variant - 'default' | 'elevated' | 'bordered'
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 */
function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}) {
  const cardClass = [
    "card",
    `card--${variant}`,
    `card--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Header sub-component
 */
function CardHeader({ children, className = "" }) {
  return <div className={`card__header ${className}`}>{children}</div>;
}

/**
 * Card Body sub-component
 */
function CardBody({ children, className = "" }) {
  return <div className={`card__body ${className}`}>{children}</div>;
}

/**
 * Card Footer sub-component
 */
function CardFooter({ children, className = "" }) {
  return <div className={`card__footer ${className}`}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
