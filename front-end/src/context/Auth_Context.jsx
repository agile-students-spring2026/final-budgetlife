import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  changePassword as changePasswordApi,
  deleteAccount as deleteAccountApi,
  login as loginApi,
  logout as logoutApi,
  signup as signupApi,
  updateEmail as updateEmailApi,
  updateUsername as updateUsernameApi,
} from "../api/authApi";
import { getBudgetGoals } from "../api/budgetApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [needsBudgetSetup, setNeedsBudgetSetup] = useState(false);

  const checkBudgetGoals = useCallback(async (username) => {
    if (!username) return;
    try {
      const goals = await getBudgetGoals(username);
      setNeedsBudgetSetup(goals === null);
    } catch (err) {
      console.error("Failed to check budget goals:", err);
      setNeedsBudgetSetup(false);
    }
  }, []);

  const markBudgetSetupComplete = useCallback(() => {
    setNeedsBudgetSetup(false);
  }, []);

  const persistUser = useCallback((user) => {
    setCurrentUser(user);

    if (user) {
      localStorage.setItem("budgetlifeUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("budgetlifeUser");
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("budgetlifeUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        checkBudgetGoals(parsed?.username);
      } catch {
        localStorage.removeItem("budgetlifeUser");
      }
    }
  }, [checkBudgetGoals]);

  const clearAuthError = useCallback(() => {
    setAuthError("");
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const data = await loginApi({ usernameOrEmail, password });
      persistUser(data.user);
      checkBudgetGoals(data.user?.username).catch((err) => {
        console.error("Failed to check budget goals:", err);
      });

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
      setNeedsBudgetSetup(true);

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

  const logout = useCallback(() => {
    persistUser(null);
    setAuthError("");
    setNeedsBudgetSetup(false);
    logoutApi();
  }, [persistUser]);

  const syncPlayerState = useCallback((playerState) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) {
        return prevUser;
      }

      const previousPlayerState = prevUser.playerState || null;
      if (JSON.stringify(previousPlayerState) === JSON.stringify(playerState)) {
        return prevUser;
      }

      const nextUser = {
        ...prevUser,
        playerState,
      };

      localStorage.setItem("budgetlifeUser", JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

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
        needsBudgetSetup,
        markBudgetSetupComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
