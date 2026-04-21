import React, { useEffect, useState } from "react";
import "./Building.css";
import { useAuth } from "../context/Auth_Context";
import { getBudgetGoals, updateBudgetGoal, updateBudgetDates } from "../api/budgetApi";

// Maps building.healthCategory ("houses", "restaurant", ...) to the backend
// budget category key ("housing", "food", ...). Duplicated from
// BuildingManager.jsx to avoid a circular import (BuildingManager imports
// BuildingBox from this file).
const HEALTH_TO_BUDGET_CATEGORY = {
  cityhall: "total",
  houses: "housing",
  restaurant: "food",
  hospital: "health",
  cinema: "entertainment",
};

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

// Shared editor for the user's total budget goal and budget period dates.
// Used by City Hall (DisplayMenu) and by the BudgetHeader progress bar.
export function TotalBudgetEditor({
  username,
  initialGoal,
  initialStartDate,
  initialEndDate,
  minGoal = 0,
  onSaved,
  onCancel,
}) {
  const [goal, setGoal] = useState(String(initialGoal ?? ""));
  const [startDate, setStartDate] = useState(initialStartDate || "");
  const [endDate, setEndDate] = useState(initialEndDate || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const inputStyle = {
    width: "100%",
    height: 42,
    background: "#cfbda5",
    border: "1px solid #b39f86",
    outline: "none",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 16,
    color: "#2f241b",
    boxSizing: "border-box",
  };

  const handleSave = async () => {
    const numericGoal = Number(goal);
    if (!Number.isFinite(numericGoal)) {
      setError("Enter a valid number");
      return;
    }
    if (numericGoal < minGoal) {
      setError(`Total must be at least $${minGoal}`);
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both dates");
      return;
    }
    if (startDate > endDate) {
      setError("Start date must be before end date");
      return;
    }
    try {
      setSaving(true);
      await updateBudgetGoal(username, "total", numericGoal);
      await updateBudgetDates(username, startDate, endDate);
      setError("");
      if (typeof window.refreshBuildingHealth === "function") {
        window.refreshBuildingHealth();
      }
      window.dispatchEvent(new Event("budget:refresh"));
      onSaved?.({ goal: numericGoal, startDate, endDate });
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: "#6b5d4d", marginBottom: 4 }}>
          Total budget goal
        </div>
        <input
          type="number"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "#6b5d4d", marginBottom: 4 }}>
            Start
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "#6b5d4d", marginBottom: 4 }}>
            End
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontWeight: 700,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          style={{
            flex: 1,
            background: "#bfa88c",
            color: "#2f241b",
            border: "1px solid #b39f86",
            borderRadius: 8,
            padding: "10px 16px",
            fontWeight: 700,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          Cancel
        </button>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "#6b5d4d" }}>
        Minimum total: ${minGoal}
      </div>
      {error && (
        <div style={{ marginTop: 6, fontSize: 13, color: "#ff6b6b" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export function BuildingBox({ building, onClick }) {
  const { i, budget, spent, name, type, showBudget, sprite, level = 1 } = building;
  const isPrimary = type === "primary";
  const boxSize = isPrimary ? 280 : 200;
  const barWidth = boxSize;
  const fontSize = isPrimary ? "1.35rem" : "1.1rem";
  const upgradeTier = level >= 10 ? 2 : level >= 5 ? 1 : 0;
  const tierLabel = upgradeTier === 2 ? "Tier III" : upgradeTier === 1 ? "Tier II" : null;
  const placeholderTheme =
    upgradeTier === 2
      ? {
          background: "linear-gradient(160deg, #f6e7b6 0%, #d6a84f 42%, #6e4a1f 100%)",
          border: "3px solid #f5d36a",
          boxShadow: "0 18px 30px rgba(91, 58, 14, 0.42)",
          accent: "#fff4be",
          labelBg: "rgba(87, 48, 6, 0.82)",
          subtitle: "Skyline upgrade ready",
        }
      : upgradeTier === 1
        ? {
            background: "linear-gradient(160deg, #d9ecff 0%, #78aef5 45%, #294f80 100%)",
            border: "3px solid #d6ecff",
            boxShadow: "0 14px 24px rgba(24, 54, 96, 0.36)",
            accent: "#edf7ff",
            labelBg: "rgba(17, 52, 96, 0.8)",
            subtitle: "Neighborhood upgrade ready",
          }
        : null;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: boxSize,
        height: boxSize,
        overflow: "visible",
      }}
    >
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
        className={sprite && upgradeTier === 0 ? undefined : "building-box"}
        style={{
          width: boxSize,
          height: boxSize,
          fontSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: sprite && upgradeTier === 0 ? "none" : upgradeTier > 0 ? placeholderTheme.background : undefined,
          boxShadow: sprite && upgradeTier === 0 ? "none" : upgradeTier > 0 ? placeholderTheme.boxShadow : undefined,
          border: upgradeTier > 0 ? placeholderTheme.border : "none",
          borderRadius: upgradeTier > 0 ? 20 : undefined,
          padding: 0,
          margin: 0,
          position: "relative",
          overflow: "visible",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        {sprite && upgradeTier === 0 ? (
          <img
            src={sprite}
            alt={name}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: boxSize * 2,
              height: boxSize * 2,
              transform: "translate(-50%, -50%)",
              objectFit: "contain",
              pointerEvents: "none",
            }}
          />
        ) : upgradeTier > 0 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 18,
              position: "relative",
              overflow: "hidden",
              color: placeholderTheme.accent,
              padding: isPrimary ? 18 : 14,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "left",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 10,
                borderRadius: 14,
                border: `1px solid ${placeholderTheme.accent}55`,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: isPrimary ? "6px 12px" : "5px 10px",
                  borderRadius: 999,
                  background: placeholderTheme.labelBg,
                  fontSize: isPrimary ? 14 : 12,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                {tierLabel}
              </div>
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  fontSize: isPrimary ? 34 : 26,
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 8,
                  textShadow: "0 4px 12px rgba(0,0,0,0.24)",
                }}
              >
                {name || `Building ${i}`}
              </div>
              <div
                style={{
                  fontSize: isPrimary ? 16 : 13,
                  fontWeight: 700,
                  opacity: 0.92,
                  marginBottom: 12,
                }}
              >
                {placeholderTheme.subtitle}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  height: isPrimary ? 82 : 64,
                }}
              >
                {[0.45, 0.65, 0.9, 0.72].map((height, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: `${height * 100}%`,
                      borderRadius: "10px 10px 4px 4px",
                      background: "rgba(255,255,255,0.22)",
                      border: `1px solid ${placeholderTheme.accent}33`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontWeight: "bold" }}>{name || `Building ${i}`}</div>
        )}
      </div>
    </div>
  );
}

export function DisplayMenu({ building, onClose }) {
  const { currentUser } = useAuth();
  const [showExpBar, setShowExpBar] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [draftGoal, setDraftGoal] = useState("");
  const [goalError, setGoalError] = useState("");
  const [goalsSnapshot, setGoalsSnapshot] = useState(null);
  const [localBudget, setLocalBudget] = useState(building?.budget ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (building) {
      setShowExpBar(false);
      setEditingGoal(false);
      setGoalError("");
      setLocalBudget(building.budget ?? 0);
    }
  }, [building]);

  // Pull a fresh snapshot of all goals when entering edit mode so the cap
  // (total - sum of other categories) reflects the latest backend state.
  useEffect(() => {
    if (!editingGoal || !currentUser?.username) return;
    let cancelled = false;
    (async () => {
      try {
        const goals = await getBudgetGoals(currentUser.username);
        if (!cancelled) setGoalsSnapshot(goals);
      } catch (err) {
        if (!cancelled) setGoalError("Failed to load budget data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editingGoal, currentUser?.username]);

  if (!building) return null;

  const budgetCategory = HEALTH_TO_BUDGET_CATEGORY[building.healthCategory];
  // School has no healthCategory mapping so it's non-editable; everything
  // else (including City Hall / total) is editable.
  const isEditable = !!budgetCategory;
  const isTotal = budgetCategory === "total";

  const minAllowed = Math.max(0, building.spent || 0);
  let maxAllowed = null;
  let totalMinAllowed = minAllowed;
  if (goalsSnapshot && budgetCategory) {
    const totalGoal = goalsSnapshot.total?.goal || 0;
    let othersSum = 0;
    for (const [cat, entry] of Object.entries(goalsSnapshot)) {
      if (cat === "total" || cat === budgetCategory) continue;
      othersSum += entry?.goal || 0;
    }
    maxAllowed = Math.max(0, totalGoal - othersSum);

    // Total must be at least (sum of all category goals) and at least
    // what has already been spent overall.
    let allCategoriesSum = 0;
    for (const [cat, entry] of Object.entries(goalsSnapshot)) {
      if (cat === "total") continue;
      allCategoriesSum += entry?.goal || 0;
    }
    totalMinAllowed = Math.max(minAllowed, allCategoriesSum);
  }

  const handleStartEdit = () => {
    if (!isEditable) return;
    setDraftGoal(String(localBudget));
    setGoalError("");
    setEditingGoal(true);
  };

  const handleCancelEdit = () => {
    setEditingGoal(false);
    setGoalError("");
  };

  const handleSaveGoal = async () => {
    const value = Number(draftGoal);
    if (!Number.isFinite(value)) {
      setGoalError("Enter a valid number");
      return;
    }
    if (value < minAllowed) {
      setGoalError(`Cannot be less than current spent ($${minAllowed})`);
      return;
    }
    if (maxAllowed !== null && value > maxAllowed) {
      setGoalError(`Cannot exceed $${maxAllowed} (total budget cap)`);
      return;
    }
    try {
      setSaving(true);
      await updateBudgetGoal(currentUser.username, budgetCategory, value);
      setLocalBudget(value);
      setEditingGoal(false);
      setGoalError("");
      // Tell BuildingManager + BudgetHeader to re-fetch.
      if (typeof window.refreshBuildingHealth === "function") {
        window.refreshBuildingHealth();
      }
    } catch (err) {
      setGoalError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

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
          background: "linear-gradient(180deg, #e2d6c6, #e0c7a6)",
          color: "#2f241b",
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
          border: "1px solid #b39f86",
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
              background: "#cfbda5",
              borderRadius: 8,
              padding: "4px 12px",
              fontWeight: 700,
              color: "#2f241b",
              border: "1px solid #b39f86",
            }}
          >
            Level {building.level}
          </span>

          <span
            style={{
              background: "#cfbda5",
              borderRadius: 8,
              padding: "4px 12px",
              fontWeight: 700,
              color: "#2f241b",
              border: "1px solid #b39f86",
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
                width: "100%",
                isPrimary: building.type === "primary",
              })
            : displayBudget({
                budget: localBudget,
                spent: building.spent,
                width: "100%",
                isPrimary: building.type === "primary",
              })}
        </div>

        <div style={{ marginBottom: 18, width: "100%", maxWidth: 400 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
            Budget goal
          </div>

          {!isEditable ? (
            <div
              style={{
                background: "#cfbda5",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 16,
                color: "#6b5d4d",
                boxSizing: "border-box",
                border: "1px solid #b39f86",
              }}
            >
              ${localBudget}{" "}
              <span style={{ opacity: 0.7, fontSize: 13 }}>
                (not editable)
              </span>
            </div>
          ) : isTotal && editingGoal ? (
            <TotalBudgetEditor
              username={currentUser?.username}
              initialGoal={localBudget}
              initialStartDate={goalsSnapshot?.total?.startDate || ""}
              initialEndDate={goalsSnapshot?.total?.endDate || ""}
              minGoal={totalMinAllowed}
              onSaved={({ goal }) => {
                setLocalBudget(goal);
                setEditingGoal(false);
              }}
              onCancel={handleCancelEdit}
            />
          ) : !editingGoal ? (
            <button
              type="button"
              onClick={handleStartEdit}
              style={{
                width: "100%",
                background: "#cfbda5",
                border: "1px solid #b39f86",
                outline: "none",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 16,
                color: "#2f241b",
                textAlign: "left",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              ${localBudget}{" "}
              <span style={{ opacity: 0.6, fontSize: 13 }}>
                — tap to edit
              </span>
            </button>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  value={draftGoal}
                  onChange={(e) => setDraftGoal(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    minWidth: 0,
                    height: 42,
                    background: "#cfbda5",
                    border: "1px solid #b39f86",
                    outline: "none",
                    borderRadius: 8,
                    padding: "0 16px",
                    fontSize: 16,
                    color: "#2f241b",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveGoal}
                  disabled={saving}
                  style={{
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0 16px",
                    fontWeight: 700,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{
                    background: "#bfa88c",
                    color: "#2f241b",
                    border: "1px solid #b39f86",
                    borderRadius: 8,
                    padding: "0 16px",
                    fontWeight: 700,
                    cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: "#6b5d4d" }}>
                {maxAllowed === null
                  ? "Loading limits…"
                  : `Allowed range: $${minAllowed} – $${maxAllowed}`}
              </div>
              {goalError && (
                <div
                  style={{ marginTop: 6, fontSize: 13, color: "#ff6b6b" }}
                >
                  {goalError}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 18, width: "100%", maxWidth: 400 }}>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
            History
          </div>
          <div
            style={{
              background: "#cfbda5",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#2f241b",
              fontSize: 15,
              border: "1px solid #b39f86",
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
    <div style={{ width, marginBottom: 8, fontFamily: 'Poppins, Segoe UI, Arial, sans-serif', letterSpacing: 0.2, userSelect: 'none' }}>
      <div
        className="budget-values"
        style={{
          display: "flex",
          width: "100%",
          borderRadius: 14,
          overflow: "visible",
          height: barHeight,
          boxShadow: "0 2px 12px rgba(80,0,120,0.10)",
          border: "2px solid #3a185a",
          background: "#23202e",
          position: "relative"
        }}
      >
        <div
          className="budget-left"
          style={{
            width: spent > 0 ? `${leftPercent}%` : "100%",
            background: "linear-gradient(90deg, #b47bff 0%, #7c3aed 100%)",
            color: "#fff",
            padding: isPrimary ? "10px 18px" : "7px 12px",
            fontSize: fontSize + 2,
            fontWeight: 600,
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            borderTopRightRadius: spent > 0 ? 0 : 12,
            borderBottomRightRadius: spent > 0 ? 0 : 12,
            transition: "width 0.5s cubic-bezier(.77,0,.18,1)",
            textAlign: "left",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            height: "100%",
            boxShadow: "0 0 12px 0 #b47bff55 inset"
          }}
        >
          <span style={{
            textShadow: "0 2px 8px #3a185a99, 0 0 8px #fff2",
            fontWeight: 700,
            fontFamily: 'Poppins, Segoe UI, Arial, sans-serif',
            fontSize: fontSize + 2,
            letterSpacing: 0.3
          }}>{left} <span style={{fontWeight:400, fontSize: fontSize-2, opacity:0.8}}>left</span></span>
        </div>

        {spent > 0 && (
          <div
            className="budget-right"
            style={{
              width: `${spentPercent}%`,
              background: "linear-gradient(90deg, #ffb347 0%, #ff5252 100%)",
              color: "#fff",
              padding: isPrimary ? "10px 18px" : "7px 12px",
              fontSize: fontSize + 2,
              fontWeight: 600,
              minWidth: 30,
              textAlign: "center",
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              transition: "width 0.5s cubic-bezier(.77,0,.18,1)",
              boxSizing: "border-box",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              height: "100%",
              boxShadow: "0 0 12px 0 #ffb34755 inset"
            }}
          >
            <span style={{
              textShadow: "0 2px 8px #7c3aed99, 0 0 8px #fff2",
              fontWeight: 700,
              fontFamily: 'Poppins, Segoe UI, Arial, sans-serif',
              fontSize: fontSize + 2,
              letterSpacing: 0.3
            }}>-${spent}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function displayHealth({ health = 100, width = 200, isPrimary = false }) {
  const clamped = Math.max(0, Math.min(100, health));
  const barHeight = isPrimary ? 16 : 12;
  const fontSize = isPrimary ? 12 : 10;

  // Color goes from green (full) → yellow (mid) → red (empty)
  const color =
    clamped >= 66 ? "#3cb371" : clamped >= 33 ? "#e6b800" : "#cc3b2a";

  return (
    <div
      style={{
        width,
        marginTop: 8,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: barHeight,
          background: "#222",
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid #444",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            background: color,
            transition: "width 0.4s, background 0.4s",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize,
            fontWeight: 800,
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          {clamped}% HP
        </div>
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