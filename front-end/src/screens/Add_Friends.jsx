import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../context/Friends_Context";
import "./Add_Friends.css";

function Add_Friends() {
  const navigate = useNavigate();
  const {
    searchResults,
    handleSearch,
    handleAddFriend,
    searchLoading,
    error,
  } = useFriends();

  const [search, setSearch] = useState("");

  useEffect(() => {
    handleSearch("");
  }, []);

  const onSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    await handleSearch(value);
  };

  const onAddFriend = async (username) => {
    try {
      await handleAddFriend(username);
      navigate("/friends");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="add-friends-page">
      <div className="add-friends-screen">
        <div className="add-friends-top">
          <div className="add-friends-player-icon">Player Icon</div>

          <div className="add-friends-user-text">
            <div className="add-friends-username">Username</div>
            <div className="add-friends-userid">userID</div>
          </div>

          <button
            className="add-friends-close-btn"
            onClick={() => navigate("/friends")}
          >
            ×
          </button>
        </div>

        <div className="add-friends-body">
          <input
            className="add-friends-search-input"
            type="text"
            placeholder="Search Profiles"
            value={search}
            onChange={onSearchChange}
          />

          <div className="add-friends-results">
            {searchLoading ? (
              <div className="add-friends-empty">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.id} className="add-friends-result-row">
                  <span className="add-friends-result-name">@{user.username}</span>
                  <button
                    className="add-friends-send-btn"
                    onClick={() => onAddFriend(user.username)}
                  >
                    Add
                  </button>
                </div>
              ))
            ) : search ? (
              <div className="add-friends-empty">No matching users</div>
            ) : null}

            {error && <div className="add-friends-empty">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Add_Friends;