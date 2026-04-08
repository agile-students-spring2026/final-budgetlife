import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth_Context";
import "./Login.css";

function Sign_up() {
  const navigate = useNavigate();
  const { signup, authLoading, authError, clearAuthError } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    clearAuthError();
  }, []);

  const handleConfirm = async () => {
    try {
      await signup({
        username,
        email,
        password,
      });

      navigate("/city-layout");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-screen">
        <h1 className="login-title">BudgetLife</h1>
        <p className="login-subtitle">Sign Up</p>

        <input
          className="login-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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

        {authError && <div className="login-error">{authError}</div>}

        <button
          className="login-button"
          onClick={handleConfirm}
          disabled={authLoading}
        >
          {authLoading ? "Creating Account..." : "Confirm"}
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

export default Sign_up;