import React from "react";
import { useNavigate } from "react-router-dom";
import "./Friends_List.css";

function Friends_List() {
  const navigate = useNavigate();

  const friends = [
    { id: 1, username: "User1", name: "Name", info: "Info" },
    { id: 2, username: "User2", name: "Name", info: "Info" },
    { id: 3, username: "User3", name: "Name", info: "Info" },
    { id: 4, username: "User4", name: "Name", info: "Info" },
  ];

  return (
    <div className="friends-page">
      <div className="friends-screen">
        <div className="friends-top">
          <div className="profile-menu-wrapper">
            <button
              className="player-icon-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="player-photo">Player Icon</div>
            </button>

            <div className={`menu-layer ${showMenu ? "open" : "closed"}`}>
              <div className="dropdown-ellipse"></div>

              <div className="profile-dropdown">
                <button className="dropdown-item">Friends</button>
                <button className="dropdown-item">Shop</button>
                <button className="dropdown-item">Logout</button>
              </div>
            </div>
          </div>
          <div className="user-text">
            <div className="username">Username</div>
            <div className="userid">userID</div>
          </div>

          <button className="close-btn" onClick={() => navigate("/home")}>
            ×
          </button>
        </div>

        <div className="friends-search-row">
          <div className="friends-title">Friends Cities</div>
          <input className="search-input" type="text" placeholder="Search" />
        </div>

        <div className="friends-list">
          {friends.map((friend) => (
            <div key={friend.id} className="friend-card">
              <div className="friend-icon">{friend.username}</div>

              <div className="friend-text">
                <div className="friend-name">Name: {friend.name}</div>
                <div className="friend-info">Info: {friend.info}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="friends-bottom">
          <button className="add-btn">+</button>
        </div>
      </div>
    </div>
  );
}

export default Friends_List;