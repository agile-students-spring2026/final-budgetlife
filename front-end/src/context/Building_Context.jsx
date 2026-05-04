import React, { createContext, useEffect, useState } from "react";
import { getCityState, saveCityState } from "../api/cityStateApi";
import { useAuth } from "./Auth_Context";

export const BuildingContext = createContext();

const SECONDARY_BUILDING_RADIUS = 700;

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

function isSchoolBuilding(building) {
  const category = (building.category || "").toLowerCase();
  const name = (building.name || "").toLowerCase();

  return category === "education" || name.includes("school");
}

function normalizeCityLayout(city) {
  if (!city || !Array.isArray(city.buildings)) {
    return city;
  }

  const primaryBuilding = city.buildings.find((building) => building.type === "primary");
  const secondaryBuildings = city.buildings
    .filter((building) => building.type === "secondary" && !isSchoolBuilding(building))
    .sort((left, right) => left.i - right.i);

  const angleStep = secondaryBuildings.length
    ? (2 * Math.PI) / secondaryBuildings.length
    : 0;

  const normalizedBuildings = [];

  if (primaryBuilding) {
    normalizedBuildings.push({
      ...primaryBuilding,
      i: 1,
      location: { x: 0, y: 0 },
    });
  }

  secondaryBuildings.forEach((building, index) => {
    const angle = index * angleStep;

    normalizedBuildings.push({
      ...building,
      location: {
        x: Math.round(SECONDARY_BUILDING_RADIUS * Math.cos(angle)),
        y: Math.round(SECONDARY_BUILDING_RADIUS * Math.sin(angle)),
      },
    });
  });

  return {
    ...city,
    buildings: normalizedBuildings,
  };
}

function addHealthCategories(city) {
  if (!city || !city.buildings) return city;

  const normalizedCity = normalizeCityLayout(city);

  return {
    ...normalizedCity,
    buildings: normalizedCity.buildings.map((b) => ({
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
        level: 1,
        name: "City Hall",
        category: "government",
        healthCategory: "cityhall",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "",
        history: [],
      },
      {
        type: "secondary",
        i: 2,
        location: { x: 700, y: 0 },
        level: 1,
        name: "Housing",
        category: "residential",
        healthCategory: "houses",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$100",
        history: [],
      },
      {
        type: "secondary",
        i: 3,
        location: { x: 0, y: 700 },
        level: 1,
        name: "Food Market",
        category: "food",
        healthCategory: "restaurant",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [],
      },
      {
        type: "secondary",
        i: 4,
        location: { x: -700, y: 0 },
        level: 1,
        name: "Hospital",
        category: "health",
        healthCategory: "hospital",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [],
      },
      {
        type: "secondary",
        i: 5,
        location: { x: 0, y: -700 },
        level: 1,
        name: "Cinema",
        category: "entertainment",
        budget: 0,
        spent: 0,
        currentExp: 0,
        expToNextLevel: 100,
        savingGoal: "$50",
        history: [],
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
      if (!currentUser?.id) {
        setCity(addHealthCategories(createDefaultCity()));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const savedCity = await getCityState();

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
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || !city) return;

    const timeout = setTimeout(() => {
      saveCityState(city).catch((err) => {
        console.error("Failed to save city state:", err);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [city, currentUser?.id]);

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
