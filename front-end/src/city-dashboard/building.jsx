// Building class definition
class Building {
	constructor({ type, level, name, category, budget }) {
		// type: 'primary' or 'secondary'
		this.type = type;
		this.level = level;
		this.name = name;
		this.category = category;
		this.budget = budget;
	}
}

// Simple React component to render a black square for a building
import React from "react";
import "./Building.css";

// i is the building index (for display)
export function BuildingBox({ i }) {
	return (
		<div className="building-box">
			Building {i}
		</div>
	);
}

//CORE building functionalities:
//2 classes of buildings: primary, secondary

// Primary building: Cityhall
// Secondary buildings: everything else that is not cityhall

// Building constructor function:
// - Building class type: primary or secondary
// - building level
// - building name
// - building category
// - building budget

// When clicked on building function:
// - When clicked: screen zooms in to the building, center building on screen, display menu

// DiplayMenu function:
// - Menu slides down from the top of the screen, hide BudgetHeader
// - Display building information (name, level, category, budget, saving goal)





// - Building management
// - Building rendering on the dashboard
// - Building interactions
// - Building progression and upgrades
