import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, signup as signupApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("budgetlifeUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("budgetlifeUser");
      }
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
        setAuthLoading(true);
        setAuthError("");

        const data = await loginApi({ usernameOrEmail, password });
        setCurrentUser(data.user);
        localStorage.setItem("budgetlifeUser", JSON.stringify(data.user));

        return data.user;
    } catch (err) {
        if (
        err.message.toLowerCase().includes("invalid") ||
        err.message.toLowerCase().includes("credential")
        ) {
        setAuthError("Login failed: wrong credentials");
        } else {
        setAuthError(err.message || "Login failed");
        }

        throw err;
    } finally {
        setAuthLoading(false);
    }
  };

  const signup = async ({ username, email, password }) => {
    try {
        setAuthLoading(true);
        setAuthError("");

        const data = await signupApi({ username, email, password });
        setCurrentUser(data.user);
        localStorage.setItem("budgetlifeUser", JSON.stringify(data.user));

        return data.user;
    } catch (err) {
        setAuthError(err.message || "Signup failed");
        throw err;
    } finally {
        setAuthLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("budgetlifeUser");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        authError,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);