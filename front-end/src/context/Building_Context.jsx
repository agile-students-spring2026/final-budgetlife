import React, { createContext, useEffect, useState } from "react";
import { getCityState, saveCityState } from "../api/cityStateApi";
import { useAuth } from "./Auth_Context";

export const BuildingContext = createContext();

function createDefaultCity() {
  return {
    version: 1,
    buildings: [
      {
        type: "primary",
        i: 1,
        location: { x: 0, y: 0 },
        level: 5,
        name: "City Hall",
        category: "government",
        budget: 2550,
        spent: 1232,
        currentExp: 1500,
        expToNextLevel: 2000,
        savingGoal: "",
        history: [],
      },
      {
        type: "secondary",
        i: 2,
        location: { x: 500, y: 0 },
        level: 2,
        name: "Housing",
        category: "residential",
        budget: 700,
        spent: 320,
        currentExp: 100,
        expToNextLevel: 250,
        savingGoal: "$100",
        history: ["- $20 on dry-wall repair", "- $100 on air fryer"],
      },
      {
        type: "secondary",
        i: 3,
        location: { x: 150, y: 475 },
        level: 1,
        name: "Food Market",
        category: "food",
        budget: 600,
        spent: 250,
        currentExp: 70,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [
          "- $45 on groceries",
          "- $15 on Taco Bell",
          "- $10 on coffee",
          "- $50 on hot pot",
        ],
      },
      {
        type: "secondary",
        i: 4,
        location: { x: -405, y: 294 },
        level: 4,
        name: "Hospital",
        category: "health",
        budget: 300,
        spent: 120,
        currentExp: 300,
        expToNextLevel: 750,
        savingGoal: "$50",
        history: ["- $50 on vitamins"],
      },
      {
        type: "secondary",
        i: 5,
        location: { x: -405, y: -294 },
        level: 2,
        name: "School",
        category: "education",
        budget: 750,
        spent: 338,
        currentExp: 100,
        expToNextLevel: 250,
        savingGoal: "$30",
        history: ["- $120 on books", "- $18 on supplies"],
      },
      {
        type: "secondary",
        i: 6,
        location: { x: 150, y: -475 },
        level: 3,
        name: "Transit Hub",
        category: "transportation",
        budget: 200,
        spent: 104,
        currentExp: 175,
        expToNextLevel: 400,
        savingGoal: "$50",
        history: ["- $4 on subway", "- $20 on Uber", "- $60 on Uber"],
      },
    ],
    decorations: [],
  };
}

export function BuildingProvider({ children }) {
  const { currentUser } = useAuth();
  const [city, setCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCity() {
      if (!currentUser?.username) {
        setCity(createDefaultCity());
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const savedCity = await getCityState(currentUser.username);

        if (!cancelled) {
          setCity(savedCity);
        }
      } catch (err) {
        console.error("Failed to load city state:", err);

        if (!cancelled) {
          setCity(createDefaultCity());
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCity();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.username]);

  useEffect(() => {
    if (!currentUser?.username || !city) return;

    const timeout = setTimeout(() => {
      saveCityState(currentUser.username, city).catch((err) => {
        console.error("Failed to save city state:", err);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [city, currentUser?.username]);

  const updateBuilding = (buildingId, updates) => {
    setCity((prevCity) => {
      if (!prevCity) return prevCity;

      return {
        ...prevCity,
        buildings: prevCity.buildings.map((b) =>
          b.i === buildingId ? { ...b, ...updates } : b
        ),
      };
    });
  };

  if (isLoading || !city) {
    return null;
  }

  return (
    <BuildingContext.Provider value={{ city, setCity, updateBuilding }}>
      {children}
    </BuildingContext.Provider>
  );
}