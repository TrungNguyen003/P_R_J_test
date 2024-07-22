import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const isAuthenticated = localStorage.getItem("authToken") !== null;
  const isAdmin = localStorage.getItem("role") === "admin";
  console.log(`AdminRoute: isAuthenticated=${isAuthenticated}, isAdmin=${isAdmin}`);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminRoute;
