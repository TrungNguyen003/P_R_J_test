// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = () => {
//   const isAuthenticated = localStorage.getItem("authToken") !== null;
//   const isAdmin = localStorage.getItem("role") === "admin";
//   console.log(`ProtectedRoute: isAuthenticated=${isAuthenticated}, isAdmin=${isAdmin}`);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   if (!isAdmin) {
//     return <Navigate to="/" />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("authToken") !== null;
  console.log(`ProtectedRoute: isAuthenticated=${isAuthenticated}`);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
