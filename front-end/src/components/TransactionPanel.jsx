import React, { useState, useRef, useEffect } from "react";
import "./TransactionPanel.css";
import { useAuth } from "../context/Auth_Context";
import { addTransaction as apiAddTransaction } from "../api/budgetApi";

// Each option's id is a backend budget category (food/housing/health/entertainment).
const buildingOptions = [
  { id: "food",          name: "Restaurant" },
  { id: "housing",       name: "Houses" },
  { id: "health",        name: "Hospital" },
  { id: "entertainment", name: "Cinema" },
];

function TransactionPanel({ mode = "popup", onClose = () => {}, onSubmit }) {
  const { currentUser } = useAuth();
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("+");
  const [closing, setClosing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const panelRef = useRef(null);
  const handleRef = useRef(null);

  
  const closePanel = () => {
  if (mode === "slide") {
    setClosing(true);

    setTimeout(() => {
      onClose(); 
    }, 250);
  } else {
    onClose();
  }
};

  // ---------------- CLICK OUTSIDE ----------------
  const handleOverlayClick = (e) => {
    if (!panelRef.current.contains(e.target)) {
      closePanel();
    }
  };

 
  useEffect(() => {
    if (mode !== "slide") return;

    const handle = handleRef.current;
    const panel = panelRef.current;

    let startY = 0;
    let currentY = 0;
    let dragging = false;

    const getY = (e) =>
      e.touches ? e.touches[0].clientY : e.clientY;

    const onStart = (e) => {
      dragging = true;
      startY = getY(e);
      panel.style.transition = "none";
    };

    const onMove = (e) => {
      if (!dragging) return;

      currentY = getY(e);
      const delta = currentY - startY;

      if (delta < 0) {
        panel.style.transform = `translateY(${delta}px)`;
      }
    };

    const onEnd = () => {
  if (!dragging) return;
  dragging = false;

  const delta = currentY - startY;

  if (delta < -40) {
    closePanel();
  } else {
    panel.style.transition = "transform 0.2s ease";
    panel.style.transform = "translateY(0)";
  }


  currentY = 0;
  startY = 0;
};

    handle.addEventListener("mousedown", onStart);
    handle.addEventListener("touchstart", onStart);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);

    return () => {
      handle.removeEventListener("mousedown", onStart);
      handle.removeEventListener("touchstart", onStart);

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);

      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [mode]);

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!selectedBuilding || !amount) return;
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    // "+" = expense (adds to spending), "-" = refund / income (subtracts).
    const signedAmount = type === "+" ? Number(amount) : -Number(amount);

    try {
      if (currentUser?.username) {
        await apiAddTransaction({
          currentUsername: currentUser.username,
          category: selectedBuilding,
          amount: signedAmount,
        });

        // Tell BuildingManager to re-fetch building health.
        if (typeof window.refreshBuildingHealth === "function") {
          window.refreshBuildingHealth();
        }
      }

      if (typeof onSubmit === "function") {
        onSubmit({
          building: selectedBuilding,
          amount: Number(amount),
          type,
        });
      }

      if (mode === "slide") closePanel();
    } catch (err) {
      console.error("Failed to submit transaction:", err);
      setError(err.message || "Failed to submit transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`transaction-overlay ${mode} ${
        closing ? "hidden" : ""
      }`}
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        className={`transaction-panel ${mode} ${
          closing ? "closing" : "open"
        }`}
      >
        {/* SLIDE HEADER */}
        {mode === "slide" && (
          <div className="transaction-slide-header">
            <span>BudgetLife</span>
            <span>Add Transaction</span>
          </div>
        )}

        {/* POPUP HEADER */}
        {mode === "popup" && (
          <div className="transaction-header-row">
            <div className="transaction-title">Add Transaction</div>
            <button className="transaction-close" onClick={closePanel}>
              ×
            </button>
          </div>
        )}

        {/* INPUT ROW */}
        <div className="transaction-row">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            <option value="">Building</option>
            {buildingOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* +/- ROW */}
        <div className="transaction-type-row">
          <button
            className={type === "+" ? "active" : "inactive"}
            onClick={() => setType("+")}
          >
            +
          </button>
          <button
            className={type === "-" ? "active" : "inactive"}
            onClick={() => setType("-")}
          >
            −
          </button>
        </div>

        {/* SUBMIT */}
        <button
          className="transaction-submit"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
        {error && (
          <div style={{ color: "#ff6b6b", marginTop: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* BOTTOM HANDLE */}
        {mode === "slide" && (
          <div ref={handleRef} className="drag-handle bottom" />
        )}
      </div>
    </div>
  );
}

export default TransactionPanel;