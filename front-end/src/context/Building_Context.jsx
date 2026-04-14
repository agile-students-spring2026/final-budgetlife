import React, { createContext, useEffect, useState } from "react";
import { getCityState, saveCityState } from "../api/cityStateApi";
import { useAuth } from "./Auth_Context";

export const BuildingContext = createContext();

// Maps a building's category/name to the healthCategory key expected by
// the budget APIs. Returns null for buildings that aren't tied to a
// backend budget category (e.g. School, Transit Hub).
function inferHealthCategory(building) {
  if (building.healthCategory !== undefined) return building.healthCategory;
  if (building.type === "primary") return "cityhall";

  const cat = (building.category || "").toLowerCase();
  const name = (building.name || "").toLowerCase();

  if (cat === "residential" || name.includes("housing") || name.includes("house"))
    return "houses";
  if (cat === "food" || name.includes("food") || name.includes("restaurant") || name.includes("market"))
    return "restaurant";
  if (cat === "health" || name.includes("hospital"))
    return "hospital";
  if (cat === "entertainment" || name.includes("cinema") || name.includes("movie"))
    return "cinema";

  return null;
}

function addHealthCategories(city) {
  if (!city || !city.buildings) return city;
  return {
    ...city,
    buildings: city.buildings.map((b) => ({
      ...b,
      healthCategory: inferHealthCategory(b),
    })),
  };
}

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
        healthCategory: "cityhall",
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
        healthCategory: "houses",
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
        healthCategory: "restaurant",
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
        healthCategory: "hospital",
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
        setCity(addHealthCategories(createDefaultCity()));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const savedCity = await getCityState(currentUser.username);

        if (!cancelled) {
          setCity(addHealthCategories(savedCity));
        }
      } catch (err) {
        console.error("Failed to load city state:", err);

        if (!cancelled) {
          setCity(addHealthCategories(createDefaultCity()));
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