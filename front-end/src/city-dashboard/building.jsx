// Building class definition
class Building {
	constructor({ type, level, name, category, budget, location }) {
		// type: 'primary' or 'secondary'
		this.type = type;
		this.level = level;
		this.name = name;
		this.category = category;
		this.budget = budget;
        this.location = location;
	}
}

import React from "react";
import "./Building.css";

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

// DisplayBudget function:
// - health bar style display of current budget + amount spent on top of the building box
// the bar slowly depletes as the player spends money
// the bar should display the amount of money left in the building's budget, and the amount spent inside the bar

export function displayBudget({ budget, spent }) {
	const percentLeft = budget > 0 ? Math.max(0, ((budget - spent) / budget) * 100) : 0;
	return (
		<div style={{ width: '100%', marginBottom: 8 }}>
			<div style={{
				width: '100%',
				height: 18,
				background: '#ddd',
				borderRadius: 8,
				overflow: 'hidden',
				position: 'relative',
				boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
			}}>
				<div style={{
					width: `${percentLeft}%`,
					height: '100%',
					background: percentLeft > 30 ? '#4caf50' : '#e53935',
					transition: 'width 0.5s',
				}} />
				<div style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontWeight: 700,
					color: '#222',
					fontSize: 13,
					pointerEvents: 'none',
				}}>
					${budget - spent} left / ${spent} spent
				</div>
			</div>
		</div>
	);
}

// - Building management
// - Building rendering on the dashboard
// - Building interactions
// - Building progression and upgrades
