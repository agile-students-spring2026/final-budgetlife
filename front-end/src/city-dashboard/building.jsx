import React, { useContext, useEffect, useState } from "react";
import "./Building.css";
import { BuildingContext } from "../context/Building_Context";

// Building class definition
class Building {
  constructor({ type, level, name, category, budget, location }) {
    this.type = type;
    this.level = level;
    this.name = name;
    this.category = category;
    this.budget = budget;
    this.location = location;
  }
}

export function BuildingBox({ building, onClick }) {
  const { i, budget, spent, name, type, showBudget } = building;
  const isPrimary = type === "primary";
  const boxSize = isPrimary ? 280 : 200;
  const barWidth = boxSize;
  const fontSize = isPrimary ? "1.35rem" : "1.1rem";

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {showBudget && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: isPrimary ? "-44px" : "-32px",
            transform: "translateX(-50%)",
            zIndex: 10,
            minWidth: isPrimary ? 180 : 120,
            pointerEvents: "none",
          }}
        >
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

export function DisplayMenu({ building, onClose }) {
  const { updateBuilding } = useContext(BuildingContext);
  const [savingGoal, setSavingGoal] = useState("");
  const [showExpBar, setShowExpBar] = useState(false);

  useEffect(() => {
    if (building) {
      setSavingGoal(building.savingGoal || "");
      setShowExpBar(false);
    }
  }, [building]);

  if (!building) return null;

  const header = document.querySelector(".budget-header");
  if (header) header.style.display = "none";

  const handleClose = () => {
    const header = document.querySelector(".budget-header");
    if (header) header.style.display = "";
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("display-menu-overlay")) {
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          maxWidth: 600,
          width: "90vw",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 16,
            fontSize: 32,
            wordBreak: "break-word",
            maxWidth: "100%",
          }}
        >
          {building.name || `Building ${building.i}`}
        </h2>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <span
            style={{
              background: "#333",
              borderRadius: 8,
              padding: "4px 12px",
              fontWeight: 700,
            }}
          >
            Level {building.level}
          </span>

          <span
            style={{
              background: "#333",
              borderRadius: 8,
              padding: "4px 12px",
              fontWeight: 700,
            }}
          >
            {building.category}
          </span>
        </div>

        <div
          style={{
            marginBottom: 18,
            width: "100%",
            maxWidth: 400,
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowExpBar((prev) => !prev);
          }}
        >
          {showExpBar
            ? displayExp({
                currentExp: building.currentExp,
                expToNextLevel: building.expToNextLevel,
                width: 400,
                isPrimary: building.type === "primary",
              })
            : displayBudget({
                budget: building.budget,
                spent: building.spent,
                width: 400,
                isPrimary: building.type === "primary",
              })}
        </div>

        <div style={{ marginBottom: 18, width: "100%", maxWidth: 400 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
            Savings goal
          </div>
          <input
            type="text"
            value={savingGoal}
            onChange={(e) => {
              const value = e.target.value;
              setSavingGoal(value);
              updateBuilding(building.i, { savingGoal: value });
            }}
            placeholder="No goal set"
            style={{
              width: "100%",
              height: 42,
              background: "#333",
              border: "none",
              outline: "none",
              borderRadius: 8,
              padding: "0 16px",
              fontSize: 16,
              color: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: 18, width: "100%", maxWidth: 400 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
            History
          </div>
          <div
            style={{
              background: "#222",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#fff",
              fontSize: 15,
            }}
          >
            {building.history && building.history.length > 0 ? (
              building.history.map((entry, index) => <div key={index}>{entry}</div>)
            ) : (
              <div>No history yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function displayBudget({ budget, spent, width = 200, isPrimary = false }) {
  const left = Math.max(0, budget - spent);
  const total = Math.max(1, budget);
  const leftPercent = (left / total) * 100;
  const spentPercent = (spent / total) * 100;
  const barHeight = isPrimary ? 32 : 18;
  const fontSize = isPrimary ? 18 : 14;

  return (
    <div style={{ width, marginBottom: 8 }}>
      <div
        className="budget-values"
        style={{
          display: "flex",
          width: "100%",
          borderRadius: 8,
          overflow: "hidden",
          height: barHeight,
        }}
      >
        <div
          className="budget-left"
          style={{
            width: spent > 0 ? `${leftPercent}%` : "100%",
            background: "#111",
            color: "#fff",
            padding: isPrimary ? "10px 16px" : "6px 10px",
            fontSize,
            fontWeight: 800,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            borderTopRightRadius: spent > 0 ? 0 : 8,
            borderBottomRightRadius: spent > 0 ? 0 : 8,
            transition: "width 0.5s",
            textAlign: "left",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          ${left} left
        </div>

        {spent > 0 && (
          <div
            className="budget-right"
            style={{
              width: `${spentPercent}%`,
              background: "#8d8d8d",
              color: "#fff",
              padding: isPrimary ? "10px 16px" : "6px 10px",
              fontSize,
              fontWeight: 800,
              minWidth: 30,
              textAlign: "center",
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              transition: "width 0.5s",
              boxSizing: "border-box",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            -${spent}
          </div>
        )}
      </div>
    </div>
  );
}

export function displayExp({
  currentExp = 0,
  expToNextLevel = 100,
  width = 200,
  isPrimary = false,
}) {
  const total = Math.max(1, expToNextLevel);
  const clampedExp = Math.min(currentExp, total);
  const expPercent = (clampedExp / total) * 100;
  const remainingPercent = 100 - expPercent;
  const barHeight = isPrimary ? 32 : 18;
  const fontSize = isPrimary ? 18 : 14;

  return (
    <div style={{ width, marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          borderRadius: 8,
          overflow: "hidden",
          height: barHeight,
        }}
      >
        <div
          style={{
            width: `${expPercent}%`,
            background: "#1f4d99",
            color: "#fff",
            padding: isPrimary ? "10px 16px" : "6px 10px",
            fontSize,
            fontWeight: 800,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            height: "100%",
            whiteSpace: "nowrap",
          }}
        >
          {currentExp} EXP
        </div>

        <div
          style={{
            width: `${remainingPercent}%`,
            background: "#8aa9d6",
            color: "#fff",
            padding: isPrimary ? "10px 16px" : "6px 10px",
            fontSize,
            fontWeight: 800,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            whiteSpace: "nowrap",
          }}
        >
            {expToNextLevel} EXP
        </div>
      </div>
    </div>
  );
}