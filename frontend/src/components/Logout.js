import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get("http://localhost:8081/users/logout", { withCredentials: true });
      if (res.status === 200) {
        localStorage.removeItem("authToken"); // Xóa authToken từ localStorage
        setIsAuthenticated(false); // Cập nhật trạng thái xác thực
        navigate("/login"); // Điều hướng đến trang đăng nhập
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;
