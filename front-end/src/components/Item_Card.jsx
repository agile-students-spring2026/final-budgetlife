import React from "react";

function Item_Card({ item, money, inventory, buyItem }) {
  const owned = inventory.includes(item.id);
  const canBuy = money >= item.price;

  return (
    <div className="shop-card">

      <div className="shop-card-left">
        <div className="shop-icon">
          {item.iconSrc ? (
            <img src={item.iconSrc} alt={item.name} className="shop-icon-image" />
          ) : (
            item.name
          )}
        </div>

        <div className="shop-text">
          <div className="shop-name">{item.name}</div>
          <div className="shop-info">
            ${item.price} • {item.info}
          </div>
        </div>
      </div>

      <button
        className="buy-btn"
        onClick={() => buyItem(item)}
        disabled={owned || !canBuy}
      >
        {owned ? "✓" : "Buy"}
      </button>

    </div>
  );
}

export default Item_Card;
