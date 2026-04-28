import { useContext, useEffect, useMemo, useRef, useState } from "react";
import CityHallImg from "../../ArtAssets/Buildings/CityHall.png";
import CinemaImg from "../../ArtAssets/Buildings/Secondary/Cinema.png";
import HospitalImg from "../../ArtAssets/Buildings/Secondary/Hospital.png";
import HousesImg from "../../ArtAssets/Buildings/Secondary/Houses.png";
import RestaurantImg from "../../ArtAssets/Buildings/Secondary/Restraunt.png";
import GrassBackground from "../../ArtAssets/GrassBackground.png";
import { claimReward, getBudgetGoals, getBuildingHealth, getTransactions } from "../api/budgetApi";
import { useAuth } from "../context/Auth_Context";
import { BuildingBox } from "./building";
import { PlayerBox } from "./Player";
import { BuildingContext } from "../context/Building_Context";

// `null` means aggregate across all categories (used by City Hall).
const HEALTH_TO_TX_CATEGORY = {
  cityhall:   null,
  houses:     "housing",
  restaurant: "food",
  hospital:   "health",
  cinema:     "entertainment",
};

const HEALTH_TO_BUDGET_CATEGORY = {
  cityhall:   "total",
  houses:     "housing",
  restaurant: "food",
  hospital:   "health",
  cinema:     "entertainment",
};

function buildHistoryForBuilding(b, txMap) {
  const txCategory = HEALTH_TO_TX_CATEGORY[b.healthCategory];
  const lines = [];
  if (txCategory === null) {
    // City Hall: aggregate every category
    for (const cat of Object.keys(txMap || {})) {
      for (const txId of Object.keys(txMap[cat] || {})) {
        const tx = txMap[cat][txId];
        lines.push(`- $${tx.amount} on ${tx.description || cat}`);
      }
    }
  } else if (txCategory) {
    const cat = (txMap && txMap[txCategory]) || {};
    for (const txId of Object.keys(cat)) {
      const tx = cat[txId];
      lines.push(`- $${tx.amount} on ${tx.description || txCategory}`);
    }
  }
  return lines;
}

// Bump this whenever the shape of a saved building changes
const CITY_STATE_VERSION = 4;

// Each secondary building corresponds to a backend budget category
const SECONDARY_BUILDINGS = [
  { name: "Houses",     category: "residential",   healthCategory: "houses",     sprite: HousesImg },
  { name: "Restaurant", category: "food",          healthCategory: "restaurant", sprite: RestaurantImg },
  { name: "Hospital",   category: "health",        healthCategory: "hospital",   sprite: HospitalImg },
  { name: "Cinema",     category: "entertainment", healthCategory: "cinema",     sprite: CinemaImg },
];

const TILE_SIZE = 96;
const TILEMAP_MULTIPLIER = 4;

const TILE_STYLES = {
  terrain: {
    background: "rgba(112, 157, 92, 0.68)",
    border: "1px solid rgba(63, 101, 49, 0.16)",
  },
  road: {
    background: "rgba(191, 168, 140, 0.86)",
    border: "1px solid rgba(122, 94, 55, 0.18)",
  },
  lot: {
    background: "rgba(106, 132, 164, 0.72)",
    border: "1px solid rgba(46, 66, 92, 0.22)",
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function worldToTileIndex(value, span, tileSize) {
  return clamp(
    Math.floor((value + span / 2) / tileSize),
    0,
    Math.ceil(span / tileSize) - 1
  );
}

function fillTileRect(grid, startCol, endCol, startRow, endRow, type) {
  const rowCount = grid.length;
  const colCount = grid[0]?.length || 0;

  for (let row = clamp(startRow, 0, rowCount - 1); row <= clamp(endRow, 0, rowCount - 1); row++) {
    for (let col = clamp(startCol, 0, colCount - 1); col <= clamp(endCol, 0, colCount - 1); col++) {
      grid[row][col] = type;
    }
  }
}

function paintRoadSegment(grid, col, row, thickness = 1) {
  fillTileRect(grid, col - thickness, col + thickness, row - thickness, row + thickness, "road");
}

function paintRoadPath(grid, startCol, startRow, endCol, endRow, preferHorizontalFirst) {
  const stepCol = startCol <= endCol ? 1 : -1;
  const stepRow = startRow <= endRow ? 1 : -1;

  paintRoadSegment(grid, startCol, startRow, 1);

  if (preferHorizontalFirst) {
    for (let col = startCol; col !== endCol; col += stepCol) {
      paintRoadSegment(grid, col, startRow, 0);
    }
    for (let row = startRow; row !== endRow; row += stepRow) {
      paintRoadSegment(grid, endCol, row, 0);
    }
  } else {
    for (let row = startRow; row !== endRow; row += stepRow) {
      paintRoadSegment(grid, startCol, row, 0);
    }
    for (let col = startCol; col !== endCol; col += stepCol) {
      paintRoadSegment(grid, col, endRow, 0);
    }
  }

  paintRoadSegment(grid, endCol, endRow, 1);
}

function buildPlaceholderTiles(city, cityWidth, cityHeight, tileSize) {
  if (!city?.buildings?.length) return [];

  const rows = Math.ceil(cityHeight / tileSize);
  const cols = Math.ceil(cityWidth / tileSize);
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  const cityHall = city.buildings.find((building) => building.type === "primary");

  const lotBounds = city.buildings.map((building) => {
    const lotSize = building.type === "primary" ? 360 : 260;
    const lotPadding = building.type === "primary" ? 40 : 30;
    const half = lotSize / 2;

    const startCol = worldToTileIndex(building.location.x - half - lotPadding, cityWidth, tileSize);
    const endCol = worldToTileIndex(building.location.x + half + lotPadding, cityWidth, tileSize);
    const startRow = worldToTileIndex(building.location.y - half - lotPadding, cityHeight, tileSize);
    const endRow = worldToTileIndex(building.location.y + half + lotPadding, cityHeight, tileSize);

    fillTileRect(grid, startCol, endCol, startRow, endRow, "lot");

    return {
      building,
      startCol,
      endCol,
      startRow,
      endRow,
    };
  });

  if (cityHall) {
    const hallBounds = lotBounds.find((entry) => entry.building.i === cityHall.i);
    const hallCol = worldToTileIndex(cityHall.location.x, cityWidth, tileSize);
    const hallRow = worldToTileIndex(cityHall.location.y, cityHeight, tileSize);

    if (hallBounds) {
      fillTileRect(
        grid,
        hallBounds.startCol - 1,
        hallBounds.endCol + 1,
        hallBounds.startRow - 1,
        hallBounds.endRow + 1,
        "road"
      );
    }

    for (const entry of lotBounds) {
      const { building, startCol, endCol, startRow, endRow } = entry;
      if (building.i === cityHall.i) continue;

      const targetCol = worldToTileIndex(building.location.x, cityWidth, tileSize);
      const targetRow = worldToTileIndex(building.location.y, cityHeight, tileSize);
      const deltaCol = targetCol - hallCol;
      const deltaRow = targetRow - hallRow;

      let connectorCol;
      let connectorRow;

      if (Math.abs(deltaCol) >= Math.abs(deltaRow)) {
        connectorCol = deltaCol >= 0 ? startCol - 1 : endCol + 1;
        connectorRow = clamp(hallRow, startRow, endRow);
      } else {
        connectorRow = deltaRow >= 0 ? startRow - 1 : endRow + 1;
        connectorCol = clamp(hallCol, startCol, endCol);
      }

      connectorCol = clamp(connectorCol, 1, cols - 2);
      connectorRow = clamp(connectorRow, 1, rows - 2);

      paintRoadPath(
        grid,
        hallCol,
        hallRow,
        connectorCol,
        connectorRow,
        Math.abs(deltaCol) >= Math.abs(deltaRow)
      );
    }
  }

  return grid.flatMap((row, rowIndex) =>
    row.flatMap((type, colIndex) =>
      type
        ? [{
            key: `${colIndex}-${rowIndex}`,
            type,
            left: colIndex * tileSize,
            top: rowIndex * tileSize,
          }]
        : []
    )
  );
}

function getBuildingSprite(building) {
  if (building.type === "primary") return CityHallImg;

  const key = (building.name || building.category || "").toLowerCase();

  if (key.includes("house") || key.includes("housing") || key.includes("residential")) {
    return HousesImg;
  }

  if (key.includes("restaurant") || key.includes("food")) {
    return RestaurantImg;
  }

  if (key.includes("hospital") || key.includes("health")) {
    return HospitalImg;
  }

  if (key.includes("cinema") || key.includes("movie") || key.includes("entertainment")) {
    return CinemaImg;
  }

  return null;
}

// Helper to create default city state
function createDefaultCity() {
  const buildings = [
    {
      type: "primary",
      i: 1,
      location: { x: 0, y: 0 },
      level: 1,
      name: "City Hall",
      category: "government",
      healthCategory: "cityhall",
      health: 100,
      budget: 1000,
      spent: 300,
      sprite: CityHallImg,
    },
  ];

  const angleStep = (2 * Math.PI) / SECONDARY_BUILDINGS.length;
  const radius = 700;
  const jitter = 40;

  for (let idx = 0; idx < SECONDARY_BUILDINGS.length; idx++) {
    const angle = idx * angleStep;
    const r = radius + (Math.random() - 0.55) * jitter;
    const meta = SECONDARY_BUILDINGS[idx];

    buildings.push({
      type: "secondary",
      i: idx + 2,
      location: {
        x: Math.round(r * Math.cos(angle)),
        y: Math.round(r * Math.sin(angle)),
      },
      level: 1,
      name: meta.name,
      category: meta.category,
      healthCategory: meta.healthCategory,
      health: 100,
      budget: 500,
      spent: 100,
      sprite: meta.sprite,
    });
  }

  return {
    version: CITY_STATE_VERSION,
    buildings,
    decorations: [],
  };
}

function isSavedCityCompatible(parsed) {
  return parsed && parsed.version === CITY_STATE_VERSION;
}

export function BuildingManager({
  onBuildingClick,
  onCloseMenu,
  showBudget = true,
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const movedDuringDrag = useRef(false);

  const [playerPos, setPlayerPos] = useState({
    x: 0,
    y: -240,
  });
  const playerPosRef = useRef({ x: 0, y: -240 });

  const [pathPoints, setPathPoints] = useState([]);
  const [activeBuilding, setActiveBuilding] = useState(null);
  const [ignoredBuildingId, setIgnoredBuildingId] = useState(null);

  const [moveTarget, setMoveTarget] = useState(null);
  const handledRewardIntervals = useRef(new Set());
  const [rewardPopup, setRewardPopup] = useState(null);

  const { currentUser } = useAuth();

  const { city, setCity } = useContext(BuildingContext);

  const cityWithSprites = useMemo(() => {
    if (!city) return null;

    return {
      ...city,
      buildings: city.buildings.map((b) => ({
        ...b,
        sprite: getBuildingSprite(b),
      })),
    };
  }, [city]);

  const [zoom, setZoom] = useState(0.5);
  const lastDistance = useRef(null);

  const BUILDING_SIZE = 200;
  const CITY_WIDTH = 1600;
  const CITY_HEIGHT = 1600;
  const TILEMAP_WIDTH = CITY_WIDTH * TILEMAP_MULTIPLIER;
  const TILEMAP_HEIGHT = CITY_HEIGHT * TILEMAP_MULTIPLIER;

  const placeholderTiles = useMemo(
    () => buildPlaceholderTiles(cityWithSprites, TILEMAP_WIDTH, TILEMAP_HEIGHT, TILE_SIZE),
    [cityWithSprites, TILEMAP_WIDTH, TILEMAP_HEIGHT]
  );

  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  // Fetch building health from backend and merge into the building list
  // Re-runs when the user changes or when something bumps refreshHealthTrigger
  const [refreshHealthTrigger, setRefreshHealthTrigger] = useState(0);

  useEffect(() => {
    handledRewardIntervals.current = new Set();
    setRewardPopup(null);
  }, [currentUser?.username]);

  useEffect(() => {
    if (!currentUser?.username) return;
    let cancelled = false;

    (async () => {
      try {
        const [healthMap, txMap, goals] = await Promise.all([
          getBuildingHealth(currentUser.username),
          getTransactions(currentUser.username),
          getBudgetGoals(currentUser.username),
        ]);

        let rewardResult = null;
        const intervalKey = goals?.total?.endDate
          ? `${goals?.total?.startDate || ""}:${goals.total.endDate}`
          : null;
        const intervalEnded = goals?.total?.endDate
          ? new Date(`${goals.total.endDate}T00:00:00Z`) <= new Date()
          : false;

        if (intervalKey && intervalEnded && !handledRewardIntervals.current.has(intervalKey)) {
          rewardResult = await claimReward(currentUser.username);
          handledRewardIntervals.current.add(intervalKey);
        }

        if (cancelled) return;

        const rewardByBuildingId = new Map(
          (rewardResult?.details || []).map((detail) => [detail.buildingId, detail])
        );

        setCity((prev) => ({
          ...prev,
          buildings: prev.buildings.map((b) => {
            const next = { ...b };
            if (b.healthCategory && healthMap && healthMap[b.healthCategory] !== undefined) {
              next.health = healthMap[b.healthCategory];
            }
            if (b.healthCategory) {
              next.history = buildHistoryForBuilding(b, txMap);
            }
            const budgetCat = HEALTH_TO_BUDGET_CATEGORY[b.healthCategory];
            if (budgetCat && goals && goals[budgetCat]) {
              next.budget = goals[budgetCat].goal;
              next.spent = goals[budgetCat].current;
            }
            const rewardDetails = rewardByBuildingId.get(b.i);
            if (rewardDetails) {
              next.level = rewardDetails.levelAfter;
              next.currentExp = rewardDetails.currentExp;
              next.expToNextLevel = rewardDetails.expToNextLevel;
            }
            return next;
          }),
        }));

        if (rewardResult?.rewarded) {
          setRewardPopup(rewardResult);
          window.dispatchEvent(new Event("budget:refresh"));
        }
      } catch (err) {
        console.error("Failed to fetch building data:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.username, refreshHealthTrigger]);


  useEffect(() => {
    window.refreshBuildingHealth = () => {
      setRefreshHealthTrigger((n) => n + 1);
      window.dispatchEvent(new Event("budget:refresh"));
    };
    return () => {
      delete window.refreshBuildingHealth;
    };
  }, []);

  useEffect(() => {
    const preventScroll = (e) => {
      e.preventDefault();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("wheel", preventScroll);
    };
  }, []);

  function getBuildingBounds() {
    const xs = cityWithSprites.buildings.map((b) => b.location.x);
    const ys = cityWithSprites.buildings.map((b) => b.location.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  function getBuildingRect(building) {
    const size = building.type === "primary" ? 280 : 200;
    const half = size / 2;
    const padding = 35;

    return {
      left: building.location.x - half - padding,
      right: building.location.x + half + padding,
      top: building.location.y - half - padding,
      bottom: building.location.y + half + padding,
    };
  }

  function pointInRect(point, rect) {
    return (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  }

  function lineIntersectsRect(start, end, rect) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(8, Math.ceil(distance / 12));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const point = {
        x: start.x + dx * t,
        y: start.y + dy * t,
      };

      if (pointInRect(point, rect)) {
        return true;
      }
    }

    return false;
  }

  function isBlocked(start, end, ignoreId = null) {
    for (const building of cityWithSprites.buildings) {
      if (ignoreId !== null && building.i === ignoreId) continue;

      const rect = getBuildingRect(building);

      if (pointInRect(start, rect)) continue;

      // Only allow the endpoint to be inside the clicked building's area
      if (ignoreId !== null && building.i === ignoreId && pointInRect(end, rect)) {
        continue;
      }

      if (lineIntersectsRect(start, end, rect)) {
        return { building, rect };
      }
    }
    return null;
  }

  function pathLength(start, path) {
    let total = 0;
    let current = start;

    for (const point of path) {
      total += Math.hypot(point.x - current.x, point.y - current.y);
      current = point;
    }

    return total;
  }

  function pathIsClear(start, path, ignoreId = null) {
    let current = start;

    for (const point of path) {
      const blocking = isBlocked(current, point, ignoreId);
      if (blocking) return false;
      current = point;
    }

    return true;
  }

  function buildPath(start, end, ignoreId = null) {
    const maxIterations = 10;
    const clearance = 90;
    const fullPath = [];
    let current = { ...start };

    for (let step = 0; step < maxIterations; step++) {
      const blocker = isBlocked(current, end, ignoreId);

      if (!blocker) {
        fullPath.push(end);
        return fullPath;
      }

      const { rect } = blocker;

      const candidates = [
        [
          { x: current.x, y: rect.top - clearance },
          { x: end.x, y: rect.top - clearance },
        ],
        [
          { x: current.x, y: rect.bottom + clearance },
          { x: end.x, y: rect.bottom + clearance },
        ],
        [
          { x: rect.left - clearance, y: current.y },
          { x: rect.left - clearance, y: end.y },
        ],
        [
          { x: rect.right + clearance, y: current.y },
          { x: rect.right + clearance, y: end.y },
        ],
        [{ x: rect.left - clearance, y: rect.top - clearance }],
        [{ x: rect.right + clearance, y: rect.top - clearance }],
        [{ x: rect.left - clearance, y: rect.bottom + clearance }],
        [{ x: rect.right + clearance, y: rect.bottom + clearance }],
      ]
        .map((path) =>
          path.filter((p, index, arr) => {
            if (index === 0) {
              return Math.hypot(p.x - current.x, p.y - current.y) > 1;
            }
            return (
              Math.hypot(p.x - arr[index - 1].x, p.y - arr[index - 1].y) > 1
            );
          })
        )
        .filter((path) => path.length > 0);

      const valid = candidates.filter((candidate) =>
        pathIsClear(current, [...candidate, end], ignoreId)
      );

      if (valid.length > 0) {
        valid.sort(
          (a, b) =>
            pathLength(current, [...a, end]) - pathLength(current, [...b, end])
        );
        fullPath.push(...valid[0], end);
        return fullPath;
      }

      const partialValid = candidates.filter((candidate) =>
        pathIsClear(current, candidate, ignoreId)
      );

      if (partialValid.length === 0) {
        return fullPath.length > 0 ? fullPath : [current];
      }

      partialValid.sort((a, b) => pathLength(current, a) - pathLength(current, b));
      const bestPartial = partialValid[0];

      fullPath.push(...bestPartial);
      current = bestPartial[bestPartial.length - 1];
    }

    if (!isBlocked(current, end, ignoreId)) {
      fullPath.push(end);
    }

    return fullPath.length > 0 ? fullPath : [current];
  }

  function setNewMoveTarget(destination, ignoreId = null) {
    setIgnoredBuildingId(ignoreId);
    setMoveTarget({
      point: destination,
      ignoreId,
    });
    setPathPoints(buildPath(playerPosRef.current, destination, ignoreId));
  }

  useEffect(() => {
    if (pathPoints.length === 0) return;

    let animationId;
    let lastTime = performance.now();
    const speed = 800;

    function step(now) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setPlayerPos((prev) => {
        const currentTarget = pathPoints[0];
        if (!currentTarget) return prev;

        const dx = currentTarget.x - prev.x;
        const dy = currentTarget.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const moveDist = speed * dt;

        if (dist <= moveDist || dist < 1) {
          const snapped = currentTarget;
          playerPosRef.current = snapped;
          setPathPoints((old) => old.slice(1));
          return snapped;
        }

        const nextPos = {
          x: prev.x + (dx / dist) * moveDist,
          y: prev.y + (dy / dist) * moveDist,
        };

        playerPosRef.current = nextPos;
        return nextPos;
      });

      animationId = requestAnimationFrame(step);
    }

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [pathPoints]);

  useEffect(() => {
    if (!moveTarget) return;
    if (pathPoints.length > 0) return;

    const current = playerPosRef.current;
    const distToTarget = Math.hypot(
      moveTarget.point.x - current.x,
      moveTarget.point.y - current.y
    );

    if (distToTarget < 4) {
      setMoveTarget(null);
      return;
    }

    setPathPoints(buildPath(current, moveTarget.point, moveTarget.ignoreId));
  }, [pathPoints, moveTarget]);

  useEffect(() => {
    if (!showBudget) return;

    if (!activeBuilding) {
      setZoom(0.5);
      return;
    }

    const targetZoom = 0.5;
    setZoom(targetZoom);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const buildingX = activeBuilding.location.x;
    const buildingY = activeBuilding.location.y;

    const targetScreenX =
      activeBuilding.type === "primary"
        ? viewportWidth * 0.86
        : viewportWidth * 0.9;

    const targetScreenY =
      activeBuilding.type === "primary"
        ? viewportHeight * 0.38
        : viewportHeight * 0.35;

    const cityCenterX = CITY_WIDTH / 2;
    const cityCenterY = CITY_HEIGHT / 2;

    const dx = targetScreenX - (cityCenterX + buildingX) * targetZoom;
    const dy = targetScreenY - (cityCenterY + buildingY) * targetZoom;

    setPan({ x: dx, y: dy });
  }, [showBudget, activeBuilding]);

  function ZoomOnBuilding(building) {
    const targetZoom = 1;
    setZoom(targetZoom);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buildingSize = building.type === "primary" ? 280 : 200;

    const buildingX = building.location.x;
    const buildingY = building.location.y;

    const targetScreenX =
      building.type === "primary"
        ? viewportWidth * 0.49
        : viewportWidth * 0.47;

    const targetScreenY =
      building.type === "primary"
        ? viewportHeight * 0.72
        : viewportHeight * 0.75;

    const cityCenterX = CITY_WIDTH / 2;
    const cityCenterY = CITY_HEIGHT / 2;

    let xOffset = 0;
    let yOffset = 0;

    if (building.type === "secondary") {
      xOffset = 2.9 * buildingSize;
      yOffset = 1.5 * buildingSize;
    } else if (building.type === "primary") {
      xOffset = 1.9 * buildingSize;
      yOffset = 1.1 * buildingSize;
    }

    const dx = targetScreenX - (cityCenterX + buildingX - xOffset);
    const dy = targetScreenY - (cityCenterY + buildingY - yOffset);

    setPan({ x: dx, y: dy });
  }

  function handleMouseDown(e) {
    dragging.current = true;
    movedDuringDrag.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() {
    dragging.current = false;
  }

  function clampPan(nextPan) {
    if (!dragging.current) return nextPan;

    const bounds = getBuildingBounds();
    const scale = typeof zoom === "number" ? zoom : 1;
    const panDivisor = 8 / scale;

    const minPanX =
      -(bounds.maxX + CITY_WIDTH / panDivisor - BUILDING_SIZE / 4);
    const maxPanX =
      -(bounds.minX - CITY_WIDTH / panDivisor + BUILDING_SIZE / 4);
    const minPanY = -(bounds.maxY + CITY_HEIGHT / panDivisor - BUILDING_SIZE);
    const maxPanY =
      -(bounds.minY - CITY_HEIGHT / panDivisor + BUILDING_SIZE / 4);

    return {
      x: Math.max(minPanX, Math.min(maxPanX, nextPan.x)),
      y: Math.max(minPanY, Math.min(maxPanY, nextPan.y)),
    };
  }

  function handleMouseMove(e) {
    if (!dragging.current) return;

    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      movedDuringDrag.current = true;
    }

    setPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  }

  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      lastDistance.current = getTouchDistance(e.touches);
    }
  }

  function handleTouchEnd() {
    dragging.current = false;
    lastDistance.current = null;
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      if (lastDistance.current) {
        const delta = dist - lastDistance.current;
        setZoom((prev) => {
          let next = prev + delta * 0.002;
          next = Math.max(0.5, Math.min(1, next));
          return next;
        });
      }
      lastDistance.current = dist;
      e.preventDefault();
      return;
    }

    if (!dragging.current || e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    setPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    e.preventDefault();
  }

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleWheel(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const delta = e.deltaY;
    setZoom((prev) => {
      let next = prev - delta * 0.001;
      next = Math.max(0.5, Math.min(1, next));
      return next;
    });

    e.preventDefault();
  }

  function handleCityClick(e) {
    if (movedDuringDrag.current) return;

    const cityGrid = e.currentTarget.querySelector("[data-city-grid]");
    if (!cityGrid) return;

    if (e.target !== cityGrid) {
      if (onCloseMenu) onCloseMenu();
      return;
    }

    const rect = cityGrid.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cityX = (clickX - rect.width / 2) / zoom;
    const cityY = (clickY - rect.height / 2) / zoom;

    const destination = { x: cityX, y: cityY };
    setNewMoveTarget(destination, null);

    if (onCloseMenu) onCloseMenu();
  }

  function closeRewardPopup() {
    setRewardPopup(null);
  }

  const rewardHasPenalty = rewardPopup?.details?.some((detail) => detail.xpAwarded < 0);

  return (
    <div
      className="building-manager"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "600px",
        width: "100vw",
        maxWidth: "100vw",
        cursor: dragging.current ? "grabbing" : "grab",
        touchAction: "none",
        display: "flex",
        justifyContent: "center",
        marginTop: 0,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onWheel={handleWheel}
      onClick={handleCityClick}
    >
      {rewardPopup?.rewarded && (
        <div
          onClick={closeRewardPopup}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(17, 12, 8, 0.64)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 25,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              maxHeight: "80vh",
              overflowY: "auto",
              background: "linear-gradient(180deg, #f4e4c8 0%, #dcc29c 100%)",
              border: "2px solid #7f5c37",
              borderRadius: 20,
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.32)",
              padding: 24,
              color: "#2f241b",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#7b5a34", marginBottom: 6 }}>
                  Budget Reward
                </div>
                <h2 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>
                  {rewardHasPenalty ? "Budget interval settled" : "Buildings leveled up"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeRewardPopup}
                style={{
                  alignSelf: "flex-start",
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  border: "1px solid #a17d52",
                  background: "rgba(255,255,255,0.45)",
                  color: "#5c4327",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 18 }}>
              <div style={{ background: "rgba(255,255,255,0.38)", borderRadius: 14, padding: 12, border: "1px solid #c5ab85" }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#7b5a34", marginBottom: 4 }}>Total XP</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{rewardPopup.xpAwarded}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.38)", borderRadius: 14, padding: 12, border: "1px solid #c5ab85" }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#7b5a34", marginBottom: 4 }}>Interval</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{rewardPopup.intervalDays}d</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.38)", borderRadius: 14, padding: 12, border: "1px solid #c5ab85" }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#7b5a34", marginBottom: 4 }}>Streak</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{rewardPopup.streakCount || 1}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.38)", borderRadius: 14, padding: 12, border: "1px solid #c5ab85" }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", color: "#7b5a34", marginBottom: 4 }}>Streak Bonus</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>+{rewardPopup.streakBonusXpPerBuilding || 0}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.5, color: "#5c4327" }}>
              {rewardPopup.message}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {rewardPopup.details?.map((detail) => (
                <div
                  key={detail.buildingId}
                  style={{
                    background: "rgba(255,255,255,0.42)",
                    border: "1px solid #c5ab85",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 6 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{detail.buildingName}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: detail.xpAwarded < 0 ? "#9e392c" : "#8b5e10" }}>
                      {detail.xpAwarded > 0 ? "+" : ""}{detail.xpAwarded} XP
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "#6a5032", display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <span>Base: {detail.baseXpAwarded > 0 ? "+" : ""}{detail.baseXpAwarded ?? detail.xpAwarded}</span>
                    {!!detail.streakBonusXpAwarded && <span>Streak: +{detail.streakBonusXpAwarded}</span>}
                    {!!detail.overspendAmount && <span>Overspent: ${detail.overspendAmount}</span>}
                    <span>Level {detail.levelBefore} to {detail.levelAfter}</span>
                    <span>{detail.currentExp}/{detail.expToNextLevel} EXP</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={closeRewardPopup}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 12,
                background: "#7c5a2d",
                color: "#fff9ef",
                padding: "12px 16px",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div
        data-city-grid
        style={{
          position: "relative",
          width: `${CITY_WIDTH}px`,
          height: `${CITY_HEIGHT}px`,
          background: "transparent",
          borderRadius: "20px",
          margin: 0,
          transform: `translate(${pan.x}px, calc(-45vh + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: "center center",
          transition: dragging.current ? "none" : "transform 0.2s",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: `${-(CITY_WIDTH * 4 - CITY_WIDTH) / 2}px`,
            top: `${-(CITY_HEIGHT * 4 - CITY_HEIGHT) / 2}px`,
            width: `${CITY_WIDTH * 4}px`,
            height: `${CITY_HEIGHT * 4}px`,
            backgroundImage: `url(${GrassBackground})`,
            backgroundRepeat: "repeat",
            backgroundSize: "400px 400px",
            backgroundPosition: "center center",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div
          aria-hidden
          style={{
            position: "absolute",
            left: `${-(TILEMAP_WIDTH - CITY_WIDTH) / 2}px`,
            top: `${-(TILEMAP_HEIGHT - CITY_HEIGHT) / 2}px`,
            width: `${TILEMAP_WIDTH}px`,
            height: `${TILEMAP_HEIGHT}px`,
            backgroundColor: "rgba(112, 157, 92, 0.22)",
            backgroundImage: [
              `linear-gradient(rgba(63, 101, 49, 0.12) 1px, transparent 1px)`,
              `linear-gradient(90deg, rgba(63, 101, 49, 0.12) 1px, transparent 1px)`,
            ].join(", "),
            backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {placeholderTiles.map((tile) => {
            const tileStyle = TILE_STYLES[tile.type];

            return (
              <div
                key={tile.key}
                style={{
                  position: "absolute",
                  left: tile.left,
                  top: tile.top,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  background: tileStyle.background,
                  border: tileStyle.border,
                  boxSizing: "border-box",
                }}
              />
            );
          })}
        </div>

        <PlayerBox
          x={CITY_WIDTH / 2 + playerPos.x}
          y={CITY_HEIGHT / 2 + playerPos.y}
          size={180}
        />

        {cityWithSprites.buildings.map((b) => (
          <div
            key={b.i}
            style={{
              position: "absolute",
              left: `${CITY_WIDTH / 2 + b.location.x - BUILDING_SIZE / 2}px`,
              top: `${CITY_HEIGHT / 2 + b.location.y - BUILDING_SIZE / 2}px`,
              zIndex: b.type === "primary" ? 2 : 1,
              transition: dragging.current ? "none" : "left 0.2s, top 0.2s",
            }}
          >
            <BuildingBox
              building={{ ...b, showBudget }}
              onClick={() => {
                const offsetX = b.type === "primary" ? 45 : 10;
                const offsetY = b.type === "primary" ? 220 : 140;

                const destination = {
                  x: b.location.x + offsetX,
                  y: b.location.y + offsetY,
                };

                setActiveBuilding(b);
                if (onBuildingClick) onBuildingClick(b);
                ZoomOnBuilding(b);

                setNewMoveTarget(destination, b.i);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}