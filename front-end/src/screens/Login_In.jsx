import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth_Context";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login, authLoading, authError, clearAuthError } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearAuthError();
  }, []);

  const handleConfirm = async () => {
    try {
      await login(usernameOrEmail, password);
      navigate("/city-layout");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-screen">
        <h1 className="login-title">BudgetLife</h1>
        <p className="login-subtitle">Login</p>

        <input
          className="login-input"
          type="text"
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {authError && <div className="login-error">{authError}</div>}

        <button
          className="login-button"
          onClick={handleConfirm}
          disabled={authLoading}
        >
          {authLoading ? "Logging In..." : "Confirm"}
        </button>

        <button
          className="login-button"
          onClick={() => navigate("/")}
          disabled={authLoading}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default Login;
