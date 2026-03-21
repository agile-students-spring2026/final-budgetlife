import React from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const email = function () {
        return <input type="text" placeholder="Enter Your Email" />;
    }

    const password = function () {
        return <input type="text" placeholder="Enter Your Password" />;
    }

    return (
        <div className="login-page">
        <div className="login-screen">
            <h1 className="login-title">BudgetLife</h1>
            <p className="login-subtitle">Sign Up</p>

            <p className="login-p">Email</p>

            <p className="input">{email}</p>

            <p className="login-p">Password</p>

            <p className="input">{password}</p>
            
            <button
            className="login-button"
            onClick={() => navigate("/home")}
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