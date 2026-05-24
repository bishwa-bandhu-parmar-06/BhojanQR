import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. Check if user is logged in
  if (!isAuthenticated) {
    const loginPath = location.pathname.includes("/admin")
      ? "/admin/auth"
      : "/restaurant/auth";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Role Check
  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  // 3. 🚨 STATUS CHECK LOGIC FOR RESTAURANTS 🚨
  if (user?.role === "restaurant") {
    const isPendingPage = location.pathname === "/restaurant/pending-approval";

    // Agar status pending hai aur wo dashboard/menu access kar raha hai
    if (user?.status === "pending" && !isPendingPage) {
      return <Navigate to="/restaurant/pending-approval" replace />;
    }

    // Agar approve ho chuka hai par fir bhi pending page par ghoom raha hai
    if (user?.status !== "pending" && isPendingPage) {
      return <Navigate to="/restaurant/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
