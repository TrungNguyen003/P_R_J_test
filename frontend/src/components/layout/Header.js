import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Header({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("role") === "admin";

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const res = await axios.get("http://localhost:8081/users/logout", { withCredentials: true });
      if (res.status === 200) {
        localStorage.removeItem("authToken"); // Xóa authToken từ localStorage
        localStorage.removeItem("role"); // Xóa role từ localStorage
        setIsAuthenticated(false); // Cập nhật trạng thái xác thực
        navigate("/login"); // Điều hướng đến trang đăng nhập
      }
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/">Home </Link>
            
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    <Link to="/admin/products/add">Add Product </Link>
                    <Link to="/admin/categories">Category Management</Link>
                    <Link to="/admin/products">Product Management</Link>
                    <Link to="/admin/users">Users Management</Link>
                  </>
                )}
                {/* Nếu người dùng đã đăng nhập, hiển thị nút Logout */}
                <Link to="/cart">Cart </Link>
                <button onClick={handleLogout}>Logout </button>
              </>
            ) : (
              // Nếu chưa đăng nhập, hiển thị liên kết đến trang đăng nhập và đăng ký
              <>
                <Link to="/login">Login </Link>
                <Link to="/register">Register </Link>
              </>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
