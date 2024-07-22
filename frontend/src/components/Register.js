import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    password2: "",
    role: "guest", // Default role
  });

  const { username, password, password2, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      console.log("Mật khẩu không khớp");
    } else {
      const newUser = {
        username,
        password,
        password2, // Ensure this field is included
        role,
      };

      console.log("Sending user data:", newUser); // Debugging log

      try {
        const res = await axios.post(
          "http://localhost:8081/users/register",
          newUser
        );
        console.log(res.data);
      } catch (err) {
        console.error("Đã xảy ra lỗi:", err.response ? err.response.data : err.message);
      }
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          name="username"
          value={username}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Mật khẩu"
          name="password"
          value={password}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          name="password2"
          value={password2}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <select name="role" value={role} onChange={onChange} required>
          <option value="guest">Khách</option>
          <option value="customer">Khách hàng</option>
          <option value="admin">Quản trị viên</option>
          <option value="manager">Quản lý</option>
          <option value="staff">Nhân viên</option>
        </select>
      </div>
      <button type="submit">Đăng ký</button>
    </form>
  );
};

export default Register;
