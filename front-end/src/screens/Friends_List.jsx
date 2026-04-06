import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../context/Friends_Context";
import "./Friends_List.css";

function FriendRow({ friend, onRemove }) {
  const [dragX, setDragX] = useState(0);
  const [open, setOpen] = useState(false);
  const startX = useRef(null);

  const handlePointerDown = (e) => {
    startX.current = e.clientX;
  };

  const handlePointerMove = (e) => {
    if (startX.current === null) return;

    const delta = e.clientX - startX.current;

    if (delta < 0) {
      setDragX(Math.max(delta, -160));
    } else {
      setDragX(Math.min(delta, 160));
    }
  };

  const handlePointerUp = () => {
    if (startX.current === null) return;

    if (dragX <= -70) {
      setOpen(true);
      setDragX(-160);
    } else if (dragX >= 70) {
      setOpen(false);
      setDragX(0);
    } else {
      setDragX(open ? -160 : 0);
    }

    startX.current = null;
  };

  return (
    <div className="friend-row-shell">
      <button
        className="remove-friend-btn"
        onClick={() => onRemove(friend.username)}
      >
        Remove
      </button>

      <div
        className={`friend-card-swipe ${open ? "open" : ""}`}
        style={{ transform: `translateX(${dragX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="friend-card">
          <div className="friend-icon">{friend.username}</div>

          <div className="friend-text">
            <div className="friend-name">Name: {friend.name}</div>
            <div className="friend-info">Info: {friend.info}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Friends_List() {
  const navigate = useNavigate();
  const { friends, loading, error, handleRemoveFriend } = useFriends();
  const [search, setSearch] = useState("");

  const filteredFriends = useMemo(() => {
    return friends.filter((friend) => {
      const q = search.toLowerCase();
      return (
        friend.username.toLowerCase().includes(q) ||
        friend.name.toLowerCase().includes(q)
      );
    });
  }, [friends, search]);

  return (
    <div className="friends-page">
      <div className="friends-screen">
        <div className="friends-top">
          <div className="profile-menu-wrapper">
            <div className="player-photo">Player Icon</div>
          </div>

          <div className="user-text">
            <div className="username">Username</div>
            <div className="userid">userID</div>
          </div>

          <button
            className="close-btn"
            onClick={() => navigate("/city-layout")}
          >
            ×
          </button>
        </div>

        <div className="friends-search-row">
          <div className="friends-title">Friends Cities</div>
          <input
            className="search-input"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="friends-list">
          {loading ? (
            <div className="friends-empty">Loading friends...</div>
          ) : error ? (
            <div className="friends-empty">{error}</div>
          ) : friends.length === 0 ? (
            <div className="friends-empty">No friends added</div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <FriendRow
                key={friend.id}
                friend={friend}
                onRemove={handleRemoveFriend}
              />
            ))
          ) : (
            <div className="friends-empty">No matching users</div>
          )}
        </div>

        <div className="friends-bottom">
          <button className="add-btn" onClick={() => navigate("/add-friends")}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default Friends_List;