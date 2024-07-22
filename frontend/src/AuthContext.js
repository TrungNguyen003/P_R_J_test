import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:8081/users/check-auth', {
          withCredentials: true,
        });
        setIsAuthenticated(res.data.isAuthenticated);
        setUserRole(res.data.role);  // Assuming the response includes the user role
      } catch (err) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, userRole }}>
      {children}
    </AuthContext.Provider>
  );
};
