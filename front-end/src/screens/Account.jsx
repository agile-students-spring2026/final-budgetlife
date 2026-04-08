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
      await updateUsername(newUsername);
      closeUsernameOverlay();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeEmail = async () => {
    try {
      await updateEmail(newEmail);
      closeEmailOverlay();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
      closePasswordOverlay();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
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
              Username: {currentUser?.username || "No username"}
            </div>
            <div className="account-info-line">
              Email: {currentUser?.email || "No email"}
            </div>
          </div>
        </div>

        <button
          className="big"
          onClick={() => {
            clearAuthError();
            setNewUsername(currentUser?.username || "");
            setShowUsernameOverlay(true);
          }}
        >
          Change Username
        </button>

        <button
          className="big"
          onClick={() => {
            clearAuthError();
            setNewEmail(currentUser?.email || "");
            setShowEmailOverlay(true);
          }}
        >
          Change Email
        </button>

        <button
          className="big"
          onClick={() => {
            clearAuthError();
            setOldPassword("");
            setNewPassword("");
            setShowPasswordOverlay(true);
          }}
        >
          Change Password
        </button>

        <button className="big" onClick={handleLogout}>
          Log Out
        </button>

        <button
            className="small"
            onClick={() => {
                clearAuthError();
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
              />

              {authError && <div className="account-error">{authError}</div>}

              <div className="modal-buttons">
                <button className="big modal-btn" onClick={handleChangeUsername}>
                  Save
                </button>
                <button className="big modal-btn" onClick={closeUsernameOverlay}>
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
              />

              {authError && <div className="account-error">{authError}</div>}

              <div className="modal-buttons">
                <button className="big modal-btn" onClick={handleChangeEmail}>
                  Save
                </button>
                <button className="big modal-btn" onClick={closeEmailOverlay}>
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
              />

              <input
                className="overlay-input"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              {authError && <div className="account-error">{authError}</div>}

              <div className="modal-buttons">
                <button className="big modal-btn" onClick={handleChangePassword}>
                  Save
                </button>
                <button className="big modal-btn" onClick={closePasswordOverlay}>
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
                    >
                    Yes, Delete Account
                    </button>

                    <button
                    className="big modal-btn"
                    onClick={() => {
                        clearAuthError();
                        setShowDeleteOverlay(false);
                    }}
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