import React, { useState } from "react";
import "./BudgetHeader.css";
import DropdownMenu from "../components/Dropdown";

function BudgetHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <div className="budget-left">$500 left</div>
            <div className="budget-right">-$20</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetHeader;