import React, { useState } from "react";
import "./AdminStyles.scss";
import logo from "../../assets/images/logo/naavi_final_logo2.png";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// ✅ SUPER ADMIN API
const API = `${BASE_URL}/api/admin/auth`;
const AdminLogin = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/super-login`, {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // 🔐 SAVE SUPER ADMIN TOKEN
      localStorage.setItem("superAdminToken", res.data.token);

      // 🚀 REDIRECT TO SUPER ADMIN DASHBOARD
      navigate("/admin-dashboard/admin-home");

    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>

        <h2 className="admin-login-title">Super Admin Login</h2>

        <form className="admin-login-form" onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group password-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span
                className="toggle-password"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          {/* ERROR */}
          {error && <p className="error-text">{error}</p>}

          {/* BUTTON */}
          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AdminLogin;