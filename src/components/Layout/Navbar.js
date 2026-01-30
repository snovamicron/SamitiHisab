import React from "react";
import { Link, useLocation } from "react-router-dom";
import Container from "./Container";
import "./Navbar.css";

/**
 * Navigation bar component
 * Displays logo and navigation links
 */
function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Container>
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">
            <img
              className="navbar__logo-icon"
              src="/logo.png"
              alt="SamitiHisab"
            />
            <span className="navbar__logo-text">SamitiHisab</span>
          </Link>

          <div className="navbar__links">
            <Link
              to="/"
              className={`navbar__link ${isActive("/") ? "navbar__link--active" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`navbar__link ${isActive("/dashboard") ? "navbar__link--active" : ""}`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;
