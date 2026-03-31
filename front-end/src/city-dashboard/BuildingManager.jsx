import React, { useRef, useState, useEffect, useContext } from "react";
import { BuildingContext } from "../context/Building_Context";
import { BuildingBox } from "./building";
import { PlayerBox } from "./Player";


// Helper to create default city state
function createDefaultCity() {
  const buildings = [
    { type: "primary", i: 1, location: { x: 0, y: 0 }, level: 1, name: "City Hall", category: "government", budget: 1000, spent: 300 }
  ];
  const angleStep = (2 * Math.PI) / 5;
  const radius = 500, jitter = 40;
  for (let idx = 0; idx < 5; idx++) {
    const angle = idx * angleStep;
    const r = radius + (Math.random() - 0.55) * jitter;
    buildings.push({
      type: "secondary",
      i: idx + 2,
      location: { x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) },
      level: 1,
      name: `Building ${idx + 2}`,
      category: "residential",
      budget: 500,
      spent: 100
    });
  }
  return {
    buildings,
    decorations: [],
    // add more city state as needed
  };
}



export function BuildingManager({ onBuildingClick, onCloseMenu, showBudget = true }) {
	// Pan state
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const dragging = useRef(false);
	const lastPos = useRef({ x: 0, y: 0 });

	// Player position in city grid coordinates (not screen coordinates)
	const [playerPos, setPlayerPos] = useState(() => ({
		x: 0,
		y: -240 // above City Hall by default
	}));
	const [targetPos, setTargetPos] = useState(null);

	const [city, setCity] = useState(() => {
    const saved = localStorage.getItem("cityState");
    if (saved) {
        try { return JSON.parse(saved); } catch {}
    }
    const defaults = createDefaultCity();
    localStorage.setItem("cityState", JSON.stringify(defaults));
    return defaults;
    });

    useEffect(() => {
    localStorage.setItem("cityState", JSON.stringify(city));
    }, [city]);


	// Move player towards targetPos (city grid coordinates)
	// Time-based movement for true constant speed
	useEffect(() => {
		if (!targetPos) return;
		let animationId;
		let lastTime = performance.now();
		const speed = 800; // units per second

		// Helper: check if line from (x1, y1) to (x2, y2) intersects a building's bounding box
		function lineIntersectsBuilding(x1, y1, x2, y2, building) {
			const boxSize = building.type === 'primary' ? 280 : 200;
			const half = boxSize / 2;
			const left = building.location.x - half;
			const right = building.location.x + half;
			const top = building.location.y - half;
			const bottom = building.location.y + half;
			// Simple AABB check: does the line segment cross the box?
			// We'll use a simple approach: if either endpoint is inside, or if the line crosses any edge
			function pointInBox(x, y) {
				return x >= left && x <= right && y >= top && y <= bottom;
			}
			if (pointInBox(x1, y1) || pointInBox(x2, y2)) return true;
			// Check for intersection with each edge
			function lineIntersectsEdge(x1, y1, x2, y2, ex1, ey1, ex2, ey2) {
				// Line AB and edge CD
				const det = (x2 - x1) * (ey2 - ey1) - (y2 - y1) * (ex2 - ex1);
				if (det === 0) return false; // parallel
				const t = ((ex1 - x1) * (ey2 - ey1) - (ey1 - y1) * (ex2 - ex1)) / det;
				const u = ((ex1 - x1) * (y2 - y1) - (ey1 - y1) * (x2 - x1)) / det;
				return t >= 0 && t <= 1 && u >= 0 && u <= 1;
			}
			// Edges: left, right, top, bottom
			if (
				lineIntersectsEdge(x1, y1, x2, y2, left, top, left, bottom) ||
				lineIntersectsEdge(x1, y1, x2, y2, right, top, right, bottom) ||
				lineIntersectsEdge(x1, y1, x2, y2, left, top, right, top) ||
				lineIntersectsEdge(x1, y1, x2, y2, left, bottom, right, bottom)
			) {
				return true;
			}
			return false;
		}

		function step(now) {
			const dt = (now - lastTime) / 1000; // seconds
			lastTime = now;
			const dx = targetPos.x - playerPos.x;
			const dy = targetPos.y - playerPos.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const moveDist = speed * dt;

			// --- Collision detection: check if path to target crosses any building ---
			const collision = city.buildings.some(b => lineIntersectsBuilding(playerPos.x, playerPos.y, targetPos.x, targetPos.y, b));
			if (collision) {
				// For now, just log collision (next step: path around)
				console.log('Collision detected with building!');
			}

			if (dist <= moveDist) {
				setPlayerPos(targetPos);
				setTargetPos(null);
				return;
			}
			const moveX = (dx / dist) * moveDist;
			const moveY = (dy / dist) * moveDist;
			setPlayerPos(pos => ({ x: pos.x + moveX, y: pos.y + moveY }));
			animationId = requestAnimationFrame(step);
		}
		animationId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(animationId);
	}, [targetPos, playerPos, city.buildings]);

	// When menu closes (showBudget becomes true), zoom out and pan down
	useEffect(() => {
		if (showBudget) {
			setZoom(0.5); // zoomed out
		}
	}, [showBudget]);

	// Helper to get building bounds
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

	// Zoom and center a building in the bottom half of the view
	function ZoomOnBuilding(building) {
		const targetZoom = 1;
		setZoom(targetZoom);

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const CITY_WIDTH = 1600;
		const CITY_HEIGHT = 1600;
		const BUILDING_SIZE = building.type === "primary" ? 280 : 200;

		const buildingX = building.location.x;
		const buildingY = building.location.y;

		const targetScreenX = viewportWidth / 2;
		const targetScreenY = viewportHeight * 0.75;

		const cityCenterX = CITY_WIDTH / 2;
		const cityCenterY = CITY_HEIGHT / 2;

		let xOffset = 0,
			yOffset = 0;

		if (building.type === "secondary") {
			xOffset = 2.9 * BUILDING_SIZE;
			yOffset = 1.5 * BUILDING_SIZE;
		} else if (building.type === "primary") {
			xOffset = 1.9 * BUILDING_SIZE;
			yOffset = 1.1 * BUILDING_SIZE;
		}

		const dx = targetScreenX - (cityCenterX + buildingX - xOffset);
		const dy = targetScreenY - (cityCenterY + buildingY - yOffset);

		setPan({ x: dx, y: dy });
	}

	// Mouse and touch event handlers for panning
	function handleMouseDown(e) {
		dragging.current = true;
		lastPos.current = { x: e.clientX, y: e.clientY };
	}

	function handleMouseUp() {
		dragging.current = false;
	}

	function clampPan(nextPan) {
		if (!dragging.current) return nextPan;

		const BUILDING_SIZE = 200;
		const CITY_WIDTH = 1600;
		const CITY_HEIGHT = 1600;
		const bounds = getBuildingBounds();

		const scale = typeof zoom === "number" ? zoom : 1;
		const panDivisor = 8 / scale;

		const minPanX = -(bounds.maxX + CITY_WIDTH / panDivisor - BUILDING_SIZE / 4);
		const maxPanX = -(bounds.minX - CITY_WIDTH / panDivisor + BUILDING_SIZE / 4);
		const minPanY = -(bounds.maxY + CITY_HEIGHT / panDivisor - BUILDING_SIZE);
		const maxPanY = -(bounds.minY - CITY_HEIGHT / panDivisor + BUILDING_SIZE / 4);

		return {
			x: Math.max(minPanX, Math.min(maxPanX, nextPan.x)),
			y: Math.max(minPanY, Math.min(maxPanY, nextPan.y)),
		};
	}

	function handleMouseMove(e) {
		if (!dragging.current) return;
		const dx = e.clientX - lastPos.current.x;
		const dy = e.clientY - lastPos.current.y;
		setPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }));
		lastPos.current = { x: e.clientX, y: e.clientY };
	}

	// Touch support for mobile
	function handleTouchStart(e) {
		if (e.touches.length === 1) {
			dragging.current = true;
			lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
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
		lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		e.preventDefault();
	}

	// Helper for pinch distance
	function getTouchDistance(touches) {
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	// Mouse wheel zoom
	function handleWheel(e) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		let delta = e.deltaY;
		setZoom((prev) => {
			let next = prev - delta * 0.001;
			next = Math.max(0.5, Math.min(1, next));
			return next;
		});
		e.preventDefault();
	}

	// Center buildings in a fixed city map area for consistent layout
	const BUILDING_SIZE = 200;
	const CITY_WIDTH = 1600;
	const CITY_HEIGHT = 1600;
	const HEADER_HEIGHT = 100;

	// Prevent page scroll
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

	const [zoom, setZoom] = useState(0.5);
	const lastDistance = useRef(null);

		// Handle click to move player (city grid coordinates)
		function handleCityClick(e) {
			// Only move player if not dragging
			if (dragging.current) return;
			// Find the city grid div
			const cityGrid = e.currentTarget.querySelector('[data-city-grid]');
			if (!cityGrid) return;
			const rect = cityGrid.getBoundingClientRect();
			// Only respond if click is inside the city grid area
			if (
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom
			) {
				// Only move player if the click target is the city grid (not when closing menu)
				if (e.target === cityGrid) {
					const clickX = e.clientX - rect.left;
					const clickY = e.clientY - rect.top;
					// Use scaled city width/height for center calculation
					const scaledWidth = CITY_WIDTH * zoom;
					const scaledHeight = CITY_HEIGHT * zoom;
					const centerX = scaledWidth / 2;
					const centerY = scaledHeight / 2;
					// Convert click to city coordinates
					const cityX = (clickX - centerX) / zoom - pan.x;
					const cityY = (clickY - centerY) / zoom - pan.y;
					setTargetPos({ x: cityX, y: cityY });
				}
			}
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
					marginTop: 0
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
					transform: `translateY(-45vh) scale(${zoom})`,
					transformOrigin: "center center",
					transition: dragging.current ? "none" : "transform 0.2s"
				}}
			>
	        {/* Render PlayerBox at playerPos, affected by pan */}
				{/* Center PlayerBox visually at playerPos (city coordinates) */}
				<PlayerBox
					x={CITY_WIDTH / 2 + playerPos.x + pan.x - 30}
					y={CITY_HEIGHT / 2 + playerPos.y + pan.y - 60}
					size={60}
				/>
				{city.buildings.map((b) => (
					<div
						key={b.i}
						style={{
							position: "absolute",
							left: `${CITY_WIDTH / 2 + b.location.x + pan.x - BUILDING_SIZE / 2}px`,
							top: `${CITY_HEIGHT / 2 + b.location.y + pan.y - BUILDING_SIZE / 2}px`,
							zIndex: b.type === "primary" ? 2 : 1,
							transition: dragging.current ? "none" : "left 0.2s, top 0.2s"
						}}
					>
						<BuildingBox building={{ ...b, showBudget }} onClick={() => {
							// Move player to center of building and a bit below
							const offsetY = 60; // pixels below center
							setTargetPos({
								x: b.location.x,
								y: b.location.y + offsetY
							});
							if (onBuildingClick) onBuildingClick(b);
							ZoomOnBuilding(b);
						}} />
					</div>
				))}
			</div>
		</div>
	);
}

// stores a list of all the buildings in the city, and allows the user to add/remove buildings
// saves the state of the buildings even when the app is closed and reopened
// spawns the building components on the cityLayout screen (always at set locations)
