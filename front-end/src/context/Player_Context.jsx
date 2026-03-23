import React, { createContext, useState } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [money, setMoney] = useState(1000);
  const [inventory, setInventory] = useState([]);

  const [friends, setFriends] = useState([
    { id: 1, username: "Alex", name: "Alex", info: "Friends for 3 years" },
    { id: 2, username: "Jordan", name: "Jordan", info: "Friends for 7 months" },
  ]);

  const buyItem = (item) => {
    if (money >= item.price && !inventory.includes(item.id)) {
      setMoney(money - item.price);
      setInventory([...inventory, item.id]);
      return true;
    }
    return false;
  };

  const addFriend = (username) => {
    const trimmed = username.trim();
    if (!trimmed) return false;

    const alreadyExists = friends.some(
      (friend) => friend.username.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) return false;

    const newFriend = {
      id: Date.now(),
      username: trimmed,
      name: trimmed,
      info: "Friends for less than 1 day",
    };

    setFriends([...friends, newFriend]);
    return true;
  };

  const removeFriend = (id) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== id));
  };

  return (
    <PlayerContext.Provider value={{ money, inventory, buyItem, friends, addFriend, removeFriend }}>
      {children}
    </PlayerContext.Provider>
  );
};