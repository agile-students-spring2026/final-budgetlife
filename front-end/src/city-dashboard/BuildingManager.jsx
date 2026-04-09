import React, { useRef, useState, useEffect } from "react";
import { BuildingBox } from "./building";
import { PlayerBox } from "./Player";

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
      budget: 1000,
      spent: 300,
    },
  ];

  const angleStep = (2 * Math.PI) / 5;
  const radius = 500;
  const jitter = 40;

  for (let idx = 0; idx < 5; idx++) {
    const angle = idx * angleStep;
    const r = radius + (Math.random() - 0.55) * jitter;

    buildings.push({
      type: "secondary",
      i: idx + 2,
      location: {
        x: Math.round(r * Math.cos(angle)),
        y: Math.round(r * Math.sin(angle)),
      },
      level: 1,
      name: `Building ${idx + 2}`,
      category: "residential",
      budget: 500,
      spent: 100,
    });
  }

  return {
    buildings,
    decorations: [],
  };
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

  const [city, setCity] = useState(() => {
    const saved = localStorage.getItem("cityState");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const defaults = createDefaultCity();
    localStorage.setItem("cityState", JSON.stringify(defaults));
    return defaults;
  });

  const [zoom, setZoom] = useState(0.5);
  const lastDistance = useRef(null);

  const BUILDING_SIZE = 200;
  const CITY_WIDTH = 1600;
  const CITY_HEIGHT = 1600;

  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);

  useEffect(() => {
    localStorage.setItem("cityState", JSON.stringify(city));
  }, [city]);

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
    const xs = city.buildings.map((b) => b.location.x);
    const ys = city.buildings.map((b) => b.location.y);

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
    for (const building of city.buildings) {
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

  return (
    <div
      className="building-manager"
      style={{
        position: "relative",
        overflow: "auto",
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
      <div
        data-city-grid
        style={{
          position: "relative",
          width: `${CITY_WIDTH}px`,
          height: `${CITY_HEIGHT}px`,
          background: "#e0e0e0",
          borderRadius: "20px",
          margin: 0,
          transform: `translate(${pan.x}px, calc(-45vh + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: "center center",
          transition: dragging.current ? "none" : "transform 0.2s",
        }}
      >
        <PlayerBox
          x={CITY_WIDTH / 2 + playerPos.x}
          y={CITY_HEIGHT / 2 + playerPos.y}
          size={60}
        />

        {city.buildings.map((b) => (
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