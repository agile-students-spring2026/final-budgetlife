import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/Player_Context";
import "./Add_Friends.css";

function Add_Friends() {
  const navigate = useNavigate();
  const { addFriend, friends } = useContext(PlayerContext);
  const [search, setSearch] = useState("");

  const mockUsers = [
    "Casey",
    "Taylor",
    "Morgan",
    "Riley",
    "Jamie",
    "Avery",
    "Parker",
    "Skyler",
  ];

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch = user.toLowerCase().includes(search.toLowerCase());
      const alreadyFriend = friends.some(
        (friend) => friend.username.toLowerCase() === user.toLowerCase()
      );
      return matchesSearch && !alreadyFriend;
    });
  }, [search, friends]);

  const handleAddFriend = (username) => {
    addFriend(username);
    navigate("/friends");
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
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="add-friends-results">
            {filteredUsers.map((user) => (
              <div key={user} className="add-friends-result-row">
                <span className="add-friends-result-name">{user}</span>
                <button
                  className="add-friends-send-btn"
                  onClick={() => handleAddFriend(user)}
                >
                  Add
                </button>
              </div>
            ))}

            {search && filteredUsers.length === 0 && (
              <div className="add-friends-empty">No matching users</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Add_Friends;