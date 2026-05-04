import React from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css";

function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="home-page">
      <div className="home-screen">
        <h1 className="home-title">BudgetLife</h1>
        <p className="home-subtitle">Main Page</p>
        <button
          className="home-button"
          onClick={() => navigate("/friends")}
        >
          Open Friends Screen
        </button>

        <button
          className="home-button"
          onClick={() => navigate("/shop")}
        >
          Open Shop Screen
        </button>

        <button
          className="home-button"
          onClick={() => navigate("/city-layout")}
        >
          Go to City Layout
        </button>
      </div>
    </div>
  );
}

export default Home;
