// Building class definition

//CORE building functionalities:
//2 classes of buildings: primary, secondary

// Primary building: Cityhall
// Secondary buildings: everything else that is not cityhall

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

// (removed duplicate useState import)
import "./Building.css";

export function BuildingBox({ building, onClick }) {
   const { i, budget, spent, name, type, showBudget } = building;
   const isPrimary = type === 'primary';
   const boxSize = isPrimary ? 280 : 200;
   const barWidth = boxSize;
   const fontSize = isPrimary ? '1.35rem' : '1.1rem';
   return (
	   <div style={{ position: "relative", display: "inline-block" }}>
		   {showBudget && (
			   <div style={{
				   position: "absolute",
				   left: "50%",
				   top: isPrimary ? "-44px" : "-32px",
				   transform: "translateX(-50%)",
				   zIndex: 10,
				   minWidth: isPrimary ? 180 : 120,
				   pointerEvents: "none"
			   }}>
				   {displayBudget({ budget, spent, width: barWidth, isPrimary })}
			   </div>
		   )}
		   <div
			   className="building-box"
			   style={{ width: boxSize, height: boxSize, fontSize }}
			   onClick={onClick}
		   >
			   <div style={{ fontWeight: "bold" }}>{name || `Building ${i}`}</div>
		   </div>
	   </div>
   );
}

// When clicked on building function:
// - When clicked: screen zooms in to the building, center building on screen, display menu


import { useState } from "react";

// DisplayMenu slides down from the top, hides BudgetHeader, and shows building info

import React from "react";
export function DisplayMenu({ building, onClose }) {
	 if (!building) return null;
	 // Hide BudgetHeader if present
	 const header = document.querySelector('.budget-header');
	 if (header) header.style.display = 'none';

	 // Restore BudgetHeader when menu closes
	 const handleClose = () => {
		 const header = document.querySelector('.budget-header');
		 if (header) header.style.display = '';
		 onClose();
	 };

	 // Close menu when clicking outside
	 const handleOverlayClick = (e) => {
		 if (e.target.classList.contains('display-menu-overlay')) {
			 handleClose();
		 }
	 };

	 return (
		 <div
			 className="display-menu-overlay"
			 onClick={handleOverlayClick}
			 style={{
				 position: "fixed",
				 top: 0,
				 left: 0,
				 width: "100vw",
				 height: "40vh",
				 zIndex: 9999,
				 background: "transparent",
			 }}
		 >
			 <div
				 style={{
					 background: "#222",
					 color: "#fff",
					 borderBottomLeftRadius: 24,
					 borderBottomRightRadius: 24,
					 padding: "32px 24px 24px 24px",
					 transition: "transform 0.4s cubic-bezier(.77,0,.18,1)",
					 transform: "translateY(0)",
					 display: 'flex',
					 flexDirection: 'column',
					 alignItems: 'center',
					 justifyContent: 'flex-start',
					 maxWidth: 600,
					 width: '90vw',
					 margin: '0 auto',
				 }}
			 >
				 <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 32, wordBreak: 'break-word', maxWidth: '100%' }}>{building.name || `Building ${building.i}`}</h2>
				 <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
					 <span style={{ background: '#333', borderRadius: 8, padding: '4px 12px', fontWeight: 700 }}>Level {building.level}</span>
					 <span style={{ background: '#333', borderRadius: 8, padding: '4px 12px', fontWeight: 700 }}>{building.category}</span>
				 </div>
				<div style={{ marginBottom: 18, width: '100%', maxWidth: 400 }}>
					{displayBudget({ budget: building.budget, spent: building.spent, width: 400, isPrimary: building.type === 'primary' })}
				</div>
				<div style={{ marginBottom: 18, width: '100%', maxWidth: 400 }}>
					<div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Savings goal</div>
					<div style={{ background: '#333', borderRadius: 8, padding: '8px 16px', fontSize: 16, color: '#fff' }}>
						{building.savingGoal ? `$${building.savingGoal}` : 'No goal set'}
					</div>
				</div>
				<div style={{ marginBottom: 18, width: '100%', maxWidth: 400 }}>
					<div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>History</div>
					<div style={{ background: '#222', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 15 }}>
						<div>- $10 on Tacobell</div>
						<div>- $25 on Groceries</div>
						<div>- $5 on Coffee</div>
						<div>- $40 on Utilities</div>
					</div>
				</div>
			 </div>
		 </div>
	 );
    }

// DisplayBudget function:
// - health bar style display of current budget + amount spent on top of the building box
// the bar slowly depletes as the player spends money
// the bar should display the amount of money left in the building's budget, and the amount spent inside the bar

export function displayBudget({ budget, spent, width = 200, isPrimary = false }) {
	const left = Math.max(0, budget - spent);
	const total = Math.max(1, budget); // avoid divide by zero
	const leftPercent = (left / total) * 100;
	const spentPercent = (spent / total) * 100;
	const barHeight = isPrimary ? 32 : 18;
	const fontSize = isPrimary ? 18 : 14;
	return (
		<div style={{ width, marginBottom: 8 }}>
			<div className="budget-values" style={{ display: 'flex', width: '100%', borderRadius: 8, overflow: 'hidden', height: barHeight }}>
				<div
					className="budget-left"
					style={{
						width: spent > 0 ? `${leftPercent}%` : '100%',
						background: '#111',
						color: '#fff',
						padding: isPrimary ? '10px 16px' : '6px 10px',
						fontSize,
						fontWeight: 800,
						borderTopLeftRadius: 8,
						borderBottomLeftRadius: 8,
						borderTopRightRadius: spent > 0 ? 0 : 8,
						borderBottomRightRadius: spent > 0 ? 0 : 8,
						transition: 'width 0.5s',
						textAlign: 'left',
						boxSizing: 'border-box',
						display: 'flex',
						alignItems: 'center',
						height: '100%',
					}}
				>
					${left} left
				</div>
				{spent > 0 && (
					<div
						className="budget-right"
						style={{
							width: `${spentPercent}%`,
							background: '#8d8d8d',
							color: '#fff',
							padding: isPrimary ? '10px 16px' : '6px 10px',
							fontSize,
							fontWeight: 800,
							minWidth: 30,
							textAlign: 'center',
							borderTopRightRadius: 8,
							borderBottomRightRadius: 8,
							transition: 'width 0.5s',
							boxSizing: 'border-box',
							overflow: 'hidden',
							whiteSpace: 'nowrap',
							display: 'flex',
							alignItems: 'center',
							height: '100%',
						}}
					>
						-${spent}
					</div>
				)}
			</div>
		</div>
	);
}

// - Building management
// - Building rendering on the dashboard
// - Building interactions
// - Building progression and upgrades
