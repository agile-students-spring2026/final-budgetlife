import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth_Context";
import "./Account.css";

function Account() {
  const navigate = useNavigate();
  const {
    currentUser,
    authLoading,
    authError,
    updateUsername,
    updateEmail,
    changePassword,
    deleteAccount,
    logout,
    clearAuthError,
  } = useAuth();

  const [showUsernameOverlay, setShowUsernameOverlay] = useState(false);
  const [showEmailOverlay, setShowEmailOverlay] = useState(false);
  const [showPasswordOverlay, setShowPasswordOverlay] = useState(false);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setNewUsername(currentUser.username);
      setNewEmail(currentUser.email);
    }
  }, [currentUser]);

  const closeUsernameOverlay = () => {
    clearAuthError();
    setShowUsernameOverlay(false);
  };

  const closeEmailOverlay = () => {
    clearAuthError();
    setShowEmailOverlay(false);
  };

  const closePasswordOverlay = () => {
    clearAuthError();
    setShowPasswordOverlay(false);
  };

  const handleChangeUsername = async () => {
    try {
      setSuccessMessage("");
      await updateUsername(newUsername);
      setSuccessMessage("Username updated");
      closeUsernameOverlay();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeEmail = async () => {
    try {
      setSuccessMessage("");
      await updateEmail(newEmail);
      setSuccessMessage("Email updated");
      closeEmailOverlay();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSuccessMessage("");
      await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      setSuccessMessage("Password updated");
      closePasswordOverlay();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setSuccessMessage("");
      await deleteAccount();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="account-page">
      <div className="account-screen">
        <div className="account-header">
          <h1 className="account-title">Edit Profile</h1>
          <button
            className="close-button"
            onClick={() => navigate("/city-layout")}
          >
            ×
          </button>
        </div>

        <div className="profile-row">
          <button className="user-icon-button">
            <div className="shop-player-icon">Player Icon</div>
          </button>

          <div className="account-info-display">
            <div className="account-info-line">
              {currentUser?.username || "No username"}
            </div>
            <div className="account-info-line">
              {currentUser?.email || "No email"}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="account-success">{successMessage}</div>
        )}

        <button
          className="big"
          disabled={authLoading}
          onClick={() => {
            clearAuthError();
            setSuccessMessage("");
            setNewUsername(currentUser?.username || "");
            setShowUsernameOverlay(true);
          }}
        >
          Change Username
        </button>

        <button
          className="big"
          disabled={authLoading}
          onClick={() => {
            clearAuthError();
            setSuccessMessage("");
            setNewEmail(currentUser?.email || "");
            setShowEmailOverlay(true);
          }}
        >
          Change Email
        </button>

        <button
          className="big"
          disabled={authLoading}
          onClick={() => {
            clearAuthError();
            setSuccessMessage("");
            setOldPassword("");
            setNewPassword("");
            setShowPasswordOverlay(true);
          }}
        >
          Change Password
        </button>

        <button className="big" disabled={authLoading} onClick={handleLogout}>
          Log Out
        </button>

        <button
          className="small"
          disabled={authLoading}
          onClick={() => {
            clearAuthError();
            setSuccessMessage("");
            setShowDeleteOverlay(true);
          }}
        >
          Delete Account
        </button>

        {showUsernameOverlay && (
          <div className="account-overlay">
            <div className="account-modal">
              <h2>Change Username</h2>

              <input
                className="overlay-input"
                type="text"
                placeholder="New username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={authLoading}
              />

              {authError && <div className="account-error">{authError}</div>}

              <div className="modal-buttons">
                <button
                  className="big modal-btn"
                  onClick={handleChangeUsername}
                  disabled={authLoading}
                >
                  {authLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="big modal-btn"
                  onClick={closeUsernameOverlay}
                  disabled={authLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showEmailOverlay && (
          <div className="account-overlay">
            <div className="account-modal">
              <h2>Change Email</h2>

              <input
                className="overlay-input"
                type="text"
                placeholder="New email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={authLoading}
              />

              {authError && <div className="account-error">{authError}</div>}

              <div className="modal-buttons">
                <button
                  className="big modal-btn"
                  onClick={handleChangeEmail}
                  disabled={authLoading}
                >
                  {authLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="big modal-btn"
                  onClick={closeEmailOverlay}
                  disabled={authLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showPasswordOverlay && (
          <div className="account-overlay">
            <div className="account-modal">
              <h2>Change Password</h2>

              <input
                className="overlay-input"
                type="password"
                placeholder="Old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={authLoading}
              />

              <input
                className="overlay-input"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={authLoading}
              />

              {authError && <div className="account-error">{authError}</div>}

              <div className="modal-buttons">
                <button
                  className="big modal-btn"
                  onClick={handleChangePassword}
                  disabled={authLoading}
                >
                  {authLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="big modal-btn"
                  onClick={closePasswordOverlay}
                  disabled={authLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteOverlay && (
          <div className="account-overlay">
            <div className="account-modal">
              <h2>Delete Account?</h2>

              <div className="account-warning-text">
                Are you sure you want to permanently delete your account?
              </div>

              {authError && <div className="account-error">{authError}</div>}

              <div className="modal-buttons">
                <button
                  className="big modal-btn delete-confirm-btn"
                  onClick={async () => {
                    try {
                      await handleDeleteAccount();
                      setShowDeleteOverlay(false);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  disabled={authLoading}
                >
                  {authLoading ? "Deleting..." : "Yes, Delete Account"}
                </button>

                <button
                  className="big modal-btn"
                  onClick={() => {
                    clearAuthError();
                    setShowDeleteOverlay(false);
                  }}
                  disabled={authLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;