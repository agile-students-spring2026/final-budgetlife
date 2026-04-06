import React, { createContext, useState } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [money, setMoney] = useState(1000);
  const [inventory, setInventory] = useState([]);

  const buyItem = (item) => {
    if (money >= item.price && !inventory.includes(item.id)) {
      setMoney((prev) => prev - item.price);
      setInventory((prev) => [...prev, item.id]);
      return true;
    }
    return false;
  };

  return (
    <PlayerContext.Provider
      value={{
        money,
        setMoney,
        inventory,
        setInventory,
        buyItem,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};