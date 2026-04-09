import React, { useEffect, useState } from "react";
import "./BudgetHeader.css";
import DropdownMenu from "../components/Dropdown";
import { useAuth } from "../context/Auth_Context";
import { getBudgetGoals } from "../api/budgetApi";

function BudgetHeader() {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [total, setTotal] = useState({ goal: 0, current: 0 });

  useEffect(() => {
    if (!currentUser?.username) return;
    let cancelled = false;

    const load = async () => {
      try {
        const goals = await getBudgetGoals(currentUser.username);
        if (cancelled) return;
        if (goals && goals.total) {
          setTotal({
            goal: goals.total.goal || 0,
            current: goals.total.current || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch budget total:", err);
      }
    };

    load();

    // Re-fetch whenever a transaction is submitted (BuildingManager bumps this).
    const refresh = () => load();
    window.addEventListener("budget:refresh", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("budget:refresh", refresh);
    };
  }, [currentUser?.username]);

  const left = Math.max(0, total.goal - total.current);

  return (
    <div className="budget-header">
      <div className="header-row">
        <div className="player-menu-wrapper">
          <button
            className="player-icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="player-icon">
              <span>Player</span>
              <span>Icon</span>
            </div>
          </button>

          <DropdownMenu isOpen={menuOpen} />
        </div>

        <div className="budget-panel">
          <div className="budget-title">Budget Balance:</div>

          <div className="budget-values">
            <div className="budget-left">${left} left</div>
            <div className="budget-right">-${total.current}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetHeader;