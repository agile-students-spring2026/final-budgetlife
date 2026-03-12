import React from "react";

function Home({ goToFriends }) {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>BudgetLife</h1>
      <p>Main page</p>

      <button
        onClick={goToFriends}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer"
        }}
      >
        Open Friends List
      </button>
    </div>
  );
}

export default Home;