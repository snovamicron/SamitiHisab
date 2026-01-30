import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";

/**
 * Application Router
 * Defines all routes for the application
 */
function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default AppRouter;
