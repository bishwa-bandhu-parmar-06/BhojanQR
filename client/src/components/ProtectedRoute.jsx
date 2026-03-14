import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Check if user is logged in
  if (!isAuthenticated) {
    // Redirect them to the correct login page based on the path
    const loginPath = location.pathname.includes("/admin")
      ? "/admin/auth"
      : "/restaurant/auth";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Role Check (Optional but recommended)
  // If your user object has a role like 'admin' or 'restaurant'
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/notFound" replace />;
  }

  return children;
};

export default ProtectedRoute;
