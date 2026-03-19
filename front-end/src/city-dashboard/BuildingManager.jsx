

import React, { useRef, useState, useEffect } from "react";
import { BuildingBox } from "./building";

export function BuildingManager() {
	// Pan state
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const dragging = useRef(false);
	const lastPos = useRef({ x: 0, y: 0 });

	// Helper to get building bounds
	function getBuildingBounds() {
		// All buildings' positions relative to city center
		const all = [
			{ x: 0, y: 0 },
			...secondaryPositions
		];
		const xs = all.map(b => b.x);
		const ys = all.map(b => b.y);
		return {
			minX: Math.min(...xs),
			maxX: Math.max(...xs),
			minY: Math.min(...ys),
			maxY: Math.max(...ys)
		};
	}

	// Persist secondary building locations in localStorage
	// Place secondary buildings in a circle around City Hall (center)
	function getCirclePositions(count, radius = 500, jitter = 40) {
		const angleStep = (2 * Math.PI) / count;
		return Array.from({ length: count }, (_, i) => {
			const angle = i * angleStep;
			const r = radius + (Math.random() - 0.5) * jitter;
			return {
				x: Math.round(r * Math.cos(angle)),
				y: Math.round(r * Math.sin(angle))
			};
		});
	}

	const [secondaryPositions, setSecondaryPositions] = useState(() => {
		const saved = localStorage.getItem("secondaryBuildingPositions");
		if (saved) {
			try {
				return JSON.parse(saved);
			} catch {
				// fallback to circle
			}
		}
		// Generate new circle positions
		const positions = getCirclePositions(5);
		localStorage.setItem("secondaryBuildingPositions", JSON.stringify(positions));
		return positions;
	});

	// Compose building list
	const buildings = [
		{ type: "primary", i: 1, x: 0, y: 0 }, // City Hall at center
		...secondaryPositions.map((pos, idx) => ({ type: "secondary", i: idx + 2, x: pos.x, y: pos.y }))
	];


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
		// Reduce pan bounds to half the previous distance
		const minPanX = -(bounds.maxX + CITY_WIDTH / 4 - BUILDING_SIZE / 2);
		const maxPanX = -(bounds.minX - CITY_WIDTH / 4 + BUILDING_SIZE / 2);
		const minPanY = -(bounds.maxY + CITY_HEIGHT / 4 - BUILDING_SIZE / 2);
		const maxPanY = -(bounds.minY - CITY_HEIGHT / 4 + BUILDING_SIZE / 2);
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
		}
	}
	function handleTouchEnd() {
		dragging.current = false;
	}
	function handleTouchMove(e) {
		if (!dragging.current || e.touches.length !== 1) return;
		const dx = e.touches[0].clientX - lastPos.current.x;
		const dy = e.touches[0].clientY - lastPos.current.y;
		setPan((prev) => clampPan({ x: prev.x + dx, y: prev.y + dy }));
		lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	// Center buildings in a fixed city map area for consistent layout
	const BUILDING_SIZE = 200;
	const CITY_WIDTH = 1200;
	const CITY_HEIGHT = 1200;
	const HEADER_HEIGHT = 100;

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
		>
			<div
				style={{
					position: "relative",
					width: `${CITY_WIDTH}px`,
					height: `${CITY_HEIGHT}px`,
					background: "#e0e0e0",
					borderRadius: "20px",
					margin: 0,
					transform: "translateY(-50vh)"
				}}
			>
				{buildings.map((b) => (
					<div
						key={b.i}
						style={{
							position: "absolute",
							left: `${CITY_WIDTH / 2 + b.x + pan.x - BUILDING_SIZE / 2}px`,
							top: `${CITY_HEIGHT / 2 + b.y + pan.y - BUILDING_SIZE / 2}px`,
							zIndex: b.type === "primary" ? 2 : 1,
							transition: dragging.current ? "none" : "left 0.2s, top 0.2s"
						}}
					>
						<BuildingBox i={b.i} />
					</div>
				))}
			</div>
		</div>
	);
}

// stores a list of all the buildings in the city, and allows the user to add/remove buildings
// saves the state of the buildings even when the app is closed and reopened
// spawns the building components on the cityLayout screen (always at set locations)
