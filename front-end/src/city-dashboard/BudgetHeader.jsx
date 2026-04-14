import { useEffect, useState } from "react";
import { getBudgetGoals } from "../api/budgetApi";
import DropdownMenu from "../components/Dropdown";
import { useAuth } from "../context/Auth_Context";
import "./BudgetHeader.css";
import { TotalBudgetEditor } from "./building";

// Parses "YYYY-MM-DD" as a local date (avoids the UTC shift that
// `new Date("2026-12-31")` causes). The end date is inclusive, so on
// the last day of the period the result is 1, not 0. Returns 0 for
// missing/invalid input and for dates already in the past
function getDaysLeft(endDateStr) {
  if (!endDateStr) return 0;
  const [y, m, d] = endDateStr.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const end = new Date(y, m - 1, d);
  end.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((end - today) / 86400000) + 1;
  return Math.max(0, diff);
}

function formatDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return str;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BudgetHeader() {
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [total, setTotal] = useState({
    goal: 0,
    current: 0,
    startDate: "",
    endDate: "",
  });
  const [categoriesSum, setCategoriesSum] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showDates, setShowDates] = useState(false);

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
            startDate: goals.total.startDate || "",
            endDate: goals.total.endDate || "",
          });
        }
        if (goals) {
          let sum = 0;
          for (const [cat, entry] of Object.entries(goals)) {
            if (cat === "total") continue;
            sum += entry?.goal || 0;
          }
          setCategoriesSum(sum);
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
  const minGoal = Math.max(total.current, categoriesSum);

  const daysLeft = getDaysLeft(total.endDate);

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

          <div
            className="budget-values"
            role="button"
            tabIndex={0}
            onClick={() => setEditing(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setEditing(true);
            }}
            style={{ cursor: "pointer" }}
            title="Tap to edit total budget and dates"
          >
            <div className="budget-left">${left} left</div>
            <div className="budget-right">-${total.current}</div>
          </div>

          {(total.startDate || total.endDate) && (
            <div className="budget-period-row">
              <div
                className="budget-period"
                role="button"
                tabIndex={0}
                onClick={() => setShowDates(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setShowDates(true);
                }}
                title="Tap to see full dates"
              >
                {total.startDate || "—"} → {total.endDate || "—"}
              </div>
              <div className="budget-days-left">
                {daysLeft} days left
              </div>
            </div>
          )}
        </div>
      </div>

      {showDates && (
        <div
          className="budget-edit-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("budget-edit-overlay")) {
              setShowDates(false);
            }
          }}
        >
          <div className="budget-edit-modal">
            <h3 className="budget-edit-title">Budget period</h3>
            <div className="budget-date-detail">
              <div className="budget-date-label">Start</div>
              <div className="budget-date-value">{formatDate(total.startDate)}</div>
            </div>
            <div className="budget-date-detail">
              <div className="budget-date-label">End</div>
              <div className="budget-date-value">{formatDate(total.endDate)}</div>
            </div>
            <div className="budget-date-detail">
              <div className="budget-date-label">Remaining</div>
              <div className="budget-date-value">{daysLeft} days</div>
            </div>
            <button
              type="button"
              className="budget-date-close"
              onClick={() => setShowDates(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="budget-edit-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("budget-edit-overlay")) {
              setEditing(false);
            }
          }}
        >
          <div className="budget-edit-modal">
            <h3 className="budget-edit-title">Edit total budget</h3>
            <TotalBudgetEditor
              username={currentUser?.username}
              initialGoal={total.goal}
              initialStartDate={total.startDate}
              initialEndDate={total.endDate}
              minGoal={minGoal}
              onSaved={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetHeader;
