import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-page">
      <div className="login-screen">
        <h1 className="login-title">BudgetLife</h1>
        <p className="login-subtitle">Login</p>

        <input
          className="login-input"
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-button"
          onClick={() => navigate("/city-layout")}
        >
          Confirm
        </button>

        <button
          className="login-button"
          onClick={() => navigate("/")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default Login;