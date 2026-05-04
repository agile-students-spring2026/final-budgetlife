import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    return (
        <div className="login-page">
            <div className="login-screen">
                <h1 className="login-title">BudgetLife</h1>
                
                <button
                    className="login-button"
                    onClick={() => navigate("/login")}
                >
                    Login
                </button>

                <button
                    className="login-button"
                    onClick={() => navigate("/signup")}
                >
                    Sign Up
                </button>
            </div>
        </div>
    );
}

export default Login;
