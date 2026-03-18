import { PlayerContext } from "../context/Player_Context";
import { useContext } from "react";
 // optional styling

function ItemCard({ item }) {
  const { money, inventory, buyItem } = useContext(PlayerContext);

  const owned = inventory.includes(item.id);
  const canBuy = money >= item.price && !owned;

  return (
    <div className="item-card">
      <div className="item-name">{item.name}</div>
      <div className="item-price">${item.price}</div>
      <button
        onClick={() => buyItem(item)}
        disabled={!canBuy}
        className={canBuy ? "buy-btn" : "buy-btn-disabled"}
      >
        {owned ? "Owned" : canBuy ? "Buy" : "Too Expensive"}
      </button>
    </div>
  );
}

export default ItemCard;