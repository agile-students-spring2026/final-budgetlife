import "./BudgetHeader.css";

function BudgetHeader() {
  return (
    <div className="budget-header">
      <div className="header-row">
        
        <div className="player-icon">
          <span>Player</span>
          <span>Icon</span>
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