import React, { createContext, useEffect, useState } from "react";
import {
  DEFAULT_EQUIPPED_ITEMS,
  getCustomizationItem,
} from "../data/playerCustomization";
import { getPlayerState, updatePlayerState } from "../api/authApi";
import { useAuth } from "./Auth_Context";

export const PlayerContext = createContext();

const DEFAULT_PLAYER_STATE = {
  money: 1000,
  inventory: [],
  equippedItems: DEFAULT_EQUIPPED_ITEMS,
};

function normalizePlayerState(rawState) {
  return {
    money: typeof rawState?.money === "number" ? rawState.money : DEFAULT_PLAYER_STATE.money,
    inventory: Array.isArray(rawState?.inventory) ? rawState.inventory : DEFAULT_PLAYER_STATE.inventory,
    equippedItems: {
      ...DEFAULT_EQUIPPED_ITEMS,
      ...(rawState?.equippedItems || {}),
    },
  };
}

export const PlayerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [money, setMoney] = useState(DEFAULT_PLAYER_STATE.money);
  const [inventory, setInventory] = useState(DEFAULT_PLAYER_STATE.inventory);
  const [equippedItems, setEquippedItems] = useState(DEFAULT_PLAYER_STATE.equippedItems);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!currentUser?.username) {
      setMoney(DEFAULT_PLAYER_STATE.money);
      setInventory(DEFAULT_PLAYER_STATE.inventory);
      setEquippedItems(DEFAULT_PLAYER_STATE.equippedItems);
      setIsHydrated(true);
      return;
    }

    const bootstrapState = normalizePlayerState(currentUser.playerState);
    setMoney(bootstrapState.money);
    setInventory(bootstrapState.inventory);
    setEquippedItems(bootstrapState.equippedItems);
    setIsHydrated(false);

    (async () => {
      try {
        const persistedState = await getPlayerState(currentUser.username);
        if (cancelled) return;

        const normalizedState = normalizePlayerState(persistedState);
        setMoney(normalizedState.money);
        setInventory(normalizedState.inventory);
        setEquippedItems(normalizedState.equippedItems);
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, currentUser?.username]);

  useEffect(() => {
    if (!currentUser?.username || !isHydrated) {
      return;
    }

    const timeout = setTimeout(() => {
      updatePlayerState(currentUser.username, {
        money,
        inventory,
        equippedItems,
      }).catch((err) => {
        console.error("Failed to persist player state:", err);
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [currentUser?.username, isHydrated, money, inventory, equippedItems]);

  useEffect(() => {
    setEquippedItems((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const [slotId, itemId] of Object.entries(prev)) {
        if (itemId !== null && !inventory.includes(itemId)) {
          next[slotId] = null;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [inventory]);

  const buyItem = (item) => {
    if (money >= item.price && !inventory.includes(item.id)) {
      setMoney((prev) => prev - item.price);
      setInventory((prev) => [...prev, item.id]);
      return true;
    }
    return false;
  };

  const ownsItem = (itemId) => inventory.includes(itemId);

  const equipItem = (slotId, itemId) => {
    if (itemId === null) {
      setEquippedItems((prev) => ({ ...prev, [slotId]: null }));
      return true;
    }

    const item = getCustomizationItem(itemId);
    if (!item || item.slotId !== slotId || !ownsItem(itemId)) {
      return false;
    }

    setEquippedItems((prev) => ({ ...prev, [slotId]: itemId }));
    return true;
  };

  return (
    <PlayerContext.Provider
      value={{
        money,
        setMoney,
        inventory,
        setInventory,
        buyItem,
        ownsItem,
        equippedItems,
        setEquippedItems,
        equipItem,
        isHydrated,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};