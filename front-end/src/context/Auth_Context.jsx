import React, { createContext, useContext, useEffect, useState } from "react";
import {
  login as loginApi,
  signup as signupApi,
  updateUsername as updateUsernameApi,
  updateEmail as updateEmailApi,
  changePassword as changePasswordApi,
  deleteAccount as deleteAccountApi,
  logout as logoutApi,
} from "../api/authApi";

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

  const clearAuthError = () => {
    setAuthError("");
  };

  const login = async (usernameOrEmail, password) => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const data = await loginApi({ usernameOrEmail, password });
      setCurrentUser(data.user);
      localStorage.setItem("budgetlifeUser", JSON.stringify(data.user));

      return data.user;
    } catch (err) {
      setAuthError(err.message || "Login failed");
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

  const updateUsername = async (newUsername) => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const data = await updateUsernameApi(currentUser.username, newUsername);
      setCurrentUser(data.user);
      localStorage.setItem("budgetlifeUser", JSON.stringify(data.user));

      return data.user;
    } catch (err) {
      setAuthError(err.message || "Failed to update username");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const updateEmail = async (newEmail) => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const data = await updateEmailApi(currentUser.username, newEmail);
      setCurrentUser(data.user);
      localStorage.setItem("budgetlifeUser", JSON.stringify(data.user));

      return data.user;
    } catch (err) {
      setAuthError(err.message || "Failed to update email");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const data = await changePasswordApi(
        currentUser.username,
        oldPassword,
        newPassword
      );

      return data;
    } catch (err) {
      setAuthError(err.message || "Failed to change password");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setAuthLoading(true);
      setAuthError("");

      await deleteAccountApi(currentUser.username);
      setCurrentUser(null);
      localStorage.removeItem("budgetlifeUser");
    } catch (err) {
      setAuthError(err.message || "Failed to delete account");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthError("");
    localStorage.removeItem("budgetlifeUser");
    logoutApi();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        authError,
        login,
        signup,
        updateUsername,
        updateEmail,
        changePassword,
        deleteAccount,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);