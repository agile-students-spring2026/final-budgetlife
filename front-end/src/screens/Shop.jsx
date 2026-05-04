import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Shop.css";
import { PlayerContext } from "../context/Player_Context";
import Item_Card from "../components/Item_Card";
import { useAuth } from "../context/Auth_Context";
import { PLAYER_CUSTOMIZATION_SHOP_ITEMS } from "../data/playerCustomization";
import { PlayerAvatar } from "../components/PlayerAvatar";

function Shop() {
  const { money, inventory, buyItem } = useContext(PlayerContext);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const cityItems = [
    { id: 1, name: "House Upgrade", info: "Improves housing", price: 200 },
    { id: 2, name: "Park", info: "Increases happiness", price: 150 },
    { id: 3, name: "Hospital", info: "Boosts health", price: 500 },
    { id: 4, name: "School", info: "Improves education", price: 300 },
  ];

  const sections = [
    {
      id: "city-projects",
      title: "City Projects",
      description: "Permanent upgrades and builds for the city side of the game.",
      items: cityItems,
    },
    {
      id: "avatar-items",
      title: "Avatar Items",
      description: "Wearables you can equip from the customization screen.",
      items: PLAYER_CUSTOMIZATION_SHOP_ITEMS,
    },
  ];

  return (
    <div className="shop-page">
      <div className="shop-screen">
        <div className="shop-top">
          <div className="shop-player-icon">
            <PlayerAvatar width={85} height={85} alt="Player avatar" />
          </div>

          <div className="shop-user-text">
            <div className="username">{currentUser?.username || "Username"}</div>
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
          {sections.map((section) => (
            <section key={section.id} className="shop-section">
              <div className="shop-section-header">
                <h2 className="shop-section-title">{section.title}</h2>
                <p className="shop-section-description">{section.description}</p>
              </div>

              <div className="shop-section-items">
                {section.items.map((item) => (
                  <Item_Card
                    key={item.id}
                    item={item}
                    money={money}
                    inventory={inventory}
                    buyItem={buyItem}
                  />
                ))}
              </div>
            </section>
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
