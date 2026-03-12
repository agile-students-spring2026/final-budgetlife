import React from "react";

function Friends({ goHome }) {
  const friends = [
    { id: 1, name: "Name", info: "Info", username: "User0" },
    { id: 2, name: "Name", info: "Info", username: "User0" },
    { id: 3, name: "Name", info: "Info", username: "User0" }
  ];

  return (
    <div style={{ padding: "30px" }}>
      <button onClick={goHome}>← Back</button>

      <h1>Friends Cities</h1>

      <input
        type="text"
        placeholder="Search"
        style={{ marginBottom: "20px", padding: "8px" }}
      />

      {friends.map(friend => (
        <div key={friend.id} style={{ marginBottom: "15px" }}>
          <strong>{friend.name}</strong>
          <div>{friend.info}</div>
        </div>
      ))}
    </div>
  );
}

export default Friends;