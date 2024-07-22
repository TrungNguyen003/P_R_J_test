import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:8081/users/login", { username, password }, { withCredentials: true });
      const { userId, token, role } = res.data;
      localStorage.setItem("userId", userId);
      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);
  
      if (res.data.msg === "Đăng nhập thành công") {
        setIsAuthenticated(true);
        setSuccess("Đăng nhập thành công. Đang chuyển hướng...");
        setError(""); // Clear any previous error message
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
        setSuccess(""); // Clear any previous success message
      }
    } catch (err) {
      console.error("Error during login:", err);
      if (err.response) {
        setError(err.response.data.msg);
      } else if (err.request) {
        setError("Không có phản hồi từ máy chủ. Vui lòng thử lại sau.");
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
      setSuccess(""); // Clear any previous success message
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default Login;
