import React, { useRef, useState, useEffect } from "react";
import { BuildingBox } from "./building";

// Helper to create default city state
function createDefaultCity() {
  const buildings = [
    { type: "primary", i: 1, location: { x: 0, y: 0 }, level: 1, name: "City Hall", category: "government", budget: 1000, spent: 0 }
  ];
  const angleStep = (2 * Math.PI) / 5;
  const radius = 500, jitter = 40;
  for (let idx = 0; idx < 5; idx++) {
    const angle = idx * angleStep;
    const r = radius + (Math.random() - 0.5) * jitter;
    buildings.push({
      type: "secondary",
      i: idx + 2,
      location: { x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) },
      level: 1,
      name: `Building ${idx + 2}`,
      category: "residential",
      budget: 500,
      spent: 0
    });
  }
  return {
    buildings,
    decorations: [],
    // add more city state as needed
  };
}

export function BuildingManager() {
	// Pan state
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const dragging = useRef(false);
	const lastPos = useRef({ x: 0, y: 0 });

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


	// Helper to get building bounds
    function getBuildingBounds() {
        const xs = city.buildings.map(b => b.location.x);
        const ys = city.buildings.map(b => b.location.y);
        
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
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
		// Only clamp while dragging
		if (!dragging.current) return nextPan;
		const BUILDING_SIZE = 200;
		const CITY_WIDTH = 1200;
		const CITY_HEIGHT = 1200;
		const bounds = getBuildingBounds();
		// Calculate the visible area center (city center)
		// Scale pan bounds with zoom (smaller bounds when zoomed out)
		const scale = typeof zoom === "number" ? zoom : 1;
		const panDivisor = 8 / scale;
		const minPanX = -(bounds.maxX + CITY_WIDTH / panDivisor - BUILDING_SIZE / 4);
		const maxPanX = -(bounds.minX - CITY_WIDTH / panDivisor + BUILDING_SIZE / 4);
		const minPanY = -(bounds.maxY + CITY_HEIGHT / panDivisor - BUILDING_SIZE);
		const maxPanY = -(bounds.minY - CITY_HEIGHT / panDivisor + BUILDING_SIZE / 4);
		return {
			x: Math.max(minPanX, Math.min(maxPanX, nextPan.x)),
			y: Math.max(minPanY, Math.min(maxPanY, nextPan.y))
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
			// Pinch to zoom
			const dist = getTouchDistance(e.touches);
			if (lastDistance.current) {
				const delta = dist - lastDistance.current;
				setZoom((prev) => {
					let next = prev + delta * 0.002;
					next = Math.max(0.67, Math.min(1, next));
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
		if (e.ctrlKey || e.metaKey || e.altKey) return; // let browser zoom if modifier held
		let delta = e.deltaY;
		setZoom((prev) => {
			let next = prev - delta * 0.001;
			next = Math.max(0.67, Math.min(1, next));
			return next;
		});
		e.preventDefault();
	}

	// Center buildings in a fixed city map area for consistent layout
	const BUILDING_SIZE = 200;
	const CITY_WIDTH = 1200;
	const CITY_HEIGHT = 1200;
	const HEADER_HEIGHT = 100;

	// Prevent page scroll (lock body scroll)
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

	const [zoom, setZoom] = useState(0.67);
	const lastDistance = useRef(null);

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
		>
			<div
				style={{
					position: "relative",
					width: `${CITY_WIDTH}px`,
					height: `${CITY_HEIGHT}px`,
					background: "#e0e0e0",
					borderRadius: "20px",
					margin: 0,
					transform: `translateY(-50vh) scale(${zoom})`,
					transformOrigin: "center center",
					transition: dragging.current ? "none" : "transform 0.2s"
				}}
			>
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
                        <BuildingBox i={b.i} {...b} />
                    </div>
                    ))}
			</div>
		</div>
	);
}

// stores a list of all the buildings in the city, and allows the user to add/remove buildings
// saves the state of the buildings even when the app is closed and reopened
// spawns the building components on the cityLayout screen (always at set locations)
