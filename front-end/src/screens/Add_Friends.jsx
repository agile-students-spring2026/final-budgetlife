import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../context/Friends_Context";
import { useAuth } from "../context/Auth_Context";
import "./Add_Friends.css";

function Add_Friends() {
  const navigate = useNavigate();
  const {
    searchResults,
    incomingRequests,
    outgoingRequests,
    handleSearch,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleDeclineFriendRequest,
    searchLoading,
    error,
  } = useFriends();

  const [search, setSearch] = useState("");
  const { currentUser } = useAuth();

  const onSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    await handleSearch(value);
  };

  return (
    <div className="add-friends-page">
      <div className="add-friends-screen">
        <div className="add-friends-top">
          <div className="add-friends-player-icon">Player Icon</div>

          <div className="add-friends-user-text">
            <div className="username">{currentUser?.username || "Username"}</div>
          </div>

          <button
            className="add-friends-close-btn"
            onClick={() => navigate("/friends")}
          >
            ×
          </button>
        </div>

        <div className="add-friends-body">
          <div className="add-friends-section-title">Incoming Requests</div>

          <div className="add-friends-results">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => (
                <div key={request.id} className="add-friends-result-row">
                  <span className="add-friends-result-name">
                    @{request.fromUsername}
                  </span>

                  <div className="request-actions">
                    <button
                      className="add-friends-send-btn"
                      onClick={() => handleAcceptFriendRequest(request.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="add-friends-send-btn"
                      onClick={() => handleDeclineFriendRequest(request.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="add-friends-empty">No incoming requests</div>
            )}
          </div>

          <div className="add-friends-section-title">Pending</div>

          <div className="add-friends-results">
            {outgoingRequests.length > 0 ? (
              outgoingRequests.map((request) => (
                <div key={request.id} className="add-friends-result-row">
                  <span className="add-friends-result-name">
                    @{request.toUsername}
                  </span>

                  <button className="add-friends-send-btn" disabled>
                    Pending
                  </button>
                </div>
              ))
            ) : (
              <div className="add-friends-empty">No pending requests</div>
            )}
          </div>

          <div className="add-friends-section-title">Add Friends</div>

          <input
            className="add-friends-search-input"
            type="text"
            placeholder="Search usernames"
            value={search}
            onChange={onSearchChange}
          />

          <div className="add-friends-results">
            {!search ? null : searchLoading ? (
              <div className="add-friends-empty">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.id} className="add-friends-result-row">
                  <span className="add-friends-result-name">
                    @{user.username}
                  </span>
                  <button
                    className="add-friends-send-btn"
                    onClick={() => handleSendFriendRequest(user.username)}
                  >
                    Send Request
                  </button>
                </div>
              ))
            ) : (
              <div className="add-friends-empty">No matching users</div>
            )}

            {error && <div className="add-friends-empty">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Add_Friends;