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

  const persistUser = (user) => {
    setCurrentUser(user);

    if (user) {
      localStorage.setItem("budgetlifeUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("budgetlifeUser");
    }
  };

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
      persistUser(data.user);

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
      persistUser(data.user);

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
      persistUser(data.user);

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
      persistUser(data.user);

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
      persistUser(null);
    } catch (err) {
      setAuthError(err.message || "Failed to delete account");
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    persistUser(null);
    setAuthError("");
  };

  const syncPlayerState = (playerState) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) {
        return prevUser;
      }

      const nextUser = {
        ...prevUser,
        playerState,
      };

      localStorage.setItem("budgetlifeUser", JSON.stringify(nextUser));
      return nextUser;
    });
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
        syncPlayerState,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);