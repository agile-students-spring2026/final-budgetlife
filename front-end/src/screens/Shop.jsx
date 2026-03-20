import React, { useContext } from "react";
import "./Shop.css";
import { PlayerContext } from "../context/Player_Context";
import Item_Card from "../components/Item_Card";

function Shop({ goHome }) {
  const { money, inventory, buyItem } = useContext(PlayerContext);

  const items = [
    { id: 1, name: "House Upgrade", info: "Improves housing", price: 200 },
    { id: 2, name: "Park", info: "Increases happiness", price: 150 },
    { id: 3, name: "Hospital", info: "Boosts health", price: 500 },
    { id: 4, name: "School", info: "Improves education", price: 300 },
  ];

  return (
    <div className="shop-page">
      <div className="shop-screen">

        {/* TOP BAR */}
        <div className="shop-top">
          <div className="player-icon">Player Icon</div>

          <div className="user-text">
            <div className="username">Username</div>
            <div className="userid">${money}</div>
          </div>

          <button className="close-btn" onClick={goHome}>×</button>
        </div>

        {/* HEADER ROW */}
        <div className="shop-header-row">
          <div className="shop-title">Shop</div>
        </div>

        {/* LIST */}
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

        {/* BOTTOM */}
        <div className="shop-bottom">
          <div>Build your city</div>
        </div>

      </div>
    </div>
  );
}

export default Shop;