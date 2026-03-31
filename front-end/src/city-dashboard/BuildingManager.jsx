import React, { useRef, useState, useEffect, useContext } from "react";
import { BuildingContext } from "../context/Building_Context";
import { BuildingBox } from "./building";

export function BuildingManager({ onBuildingClick, onCloseMenu, showBudget = true }) {
	// Pan state
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const dragging = useRef(false);
	const lastPos = useRef({ x: 0, y: 0 });

	const { city } = useContext(BuildingContext);

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
			onClick={onCloseMenu}
		>
			<div
				style={{
					position: "relative",
					width: `${CITY_WIDTH}px`,
					height: `${CITY_HEIGHT}px`,
					background: "#e0e0e0",
					borderRadius: "20px",
					margin: 0,
					transform: `translateY(-45vh) scale(${zoom})`,
					transformOrigin: "center center",
					transition: dragging.current ? "none" : "transform 0.2s",
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
							transition: dragging.current ? "none" : "left 0.2s, top 0.2s",
						}}
					>
						<BuildingBox
							building={{ ...b, showBudget }}
							onClick={() => {
								if (onBuildingClick) onBuildingClick(b);
								ZoomOnBuilding(b);
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
}