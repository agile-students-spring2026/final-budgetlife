import React from "react";
import "./Home.css";

function Home({ goToFriends, goToShop }) {
  return (
     <div className="home-page">
      <div className="home-screen">
        <h1 className="home-title">BudgetLife</h1>
        <p className="home-subtitle">Main Page</p>

        <button className="home-button" onClick={goToFriends}>
          Open Friends Screen
        </button>

        <button className="home-button" onClick={goToShop}>
          Go to Shop
        </button>
      </div> 
    </div>
  );
}

export default Home;