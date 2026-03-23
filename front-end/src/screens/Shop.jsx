import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Shop.css";
import { PlayerContext } from "../context/Player_Context";
import Item_Card from "../components/Item_Card";

function Shop() {
  const { money, inventory, buyItem } = useContext(PlayerContext);
  const navigate = useNavigate();

  const items = [
    { id: 1, name: "House Upgrade", info: "Improves housing", price: 200 },
    { id: 2, name: "Park", info: "Increases happiness", price: 150 },
    { id: 3, name: "Hospital", info: "Boosts health", price: 500 },
    { id: 4, name: "School", info: "Improves education", price: 300 },
  ];

  return (
    <div className="shop-page">
      <div className="shop-screen">
        <div className="shop-top">
          <div className="shop-player-icon">Player Icon</div>

          <div className="shop-user-text">
            <div className="shop-username">Username</div>
            <div className="shop-userid">${money}</div>
          </div>

          <button className="shop-close-btn" onClick={() => navigate("/city-layout")}>
            ×
          </button>
        </div>

        <div className="shop-header-row">
          <div className="shop-title">Shop</div>
        </div>

        <div className="shop-list">
          {items.map((item) => (
            <Item_Card
              key={item.id}
              item={item}
              money={money}
              inventory={inventory}
              buyItem={buyItem}
            />
          ))}
        </div>

        <div className="shop-bottom">
          <div>Build your city</div>
        </div>
      </div>
    </div>
  );
}

export default Shop;