import React, { useMemo, useState } from "react";
import { initBudgetGoals } from "../api/budgetApi";
import "./BudgetSetupModal.css";

const CATEGORIES = [
    { id: "food", label: "Food (Restaurant)" },
    { id: "housing", label: "Housing (Houses)" },
    { id: "health", label: "Health (Hospital)" },
    { id: "entertainment", label: "Entertainment (Cinema)" },
];

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function plus30DaysISO() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
}

function BudgetSetupModal({ username, onComplete }) {
    const [values, setValues] = useState({
        food: "",
        housing: "",
        health: "",
        entertainment: "",
    });
    const [startDate, setStartDate] = useState(todayISO());
    const [endDate, setEndDate] = useState(plus30DaysISO());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const total = useMemo(() => {
        return CATEGORIES.reduce((sum, c) => {
            const n = Number(values[c.id]);
            return sum + (Number.isFinite(n) && n > 0 ? n : 0);
        }, 0);
    }, [values]);

    const handleChange = (id, raw) => {
        setValues((prev) => ({ ...prev, [id]: raw }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        for (const c of CATEGORIES) {
            const n = Number(values[c.id]);
            if (!Number.isFinite(n) || n < 0) {
                setError(`Please enter a non-negative number for ${c.label}`);
                return;
            }
        }
        if (!startDate || !endDate || endDate < startDate) {
            setError("End date must be on or after start date");
            return;
        }

        setSubmitting(true);
        try {
            await initBudgetGoals({
                currentUsername: username,
                food: Number(values.food),
                housing: Number(values.housing),
                health: Number(values.health),
                entertainment: Number(values.entertainment),
                startDate,
                endDate,
            });
            onComplete();
        } catch (err) {
            setError(err.message || "Failed to save");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="budget-setup-overlay">
            <div className="budget-setup-modal">
                <h2>Set Up Your Budget</h2>
                <p className="budget-setup-hint">
                    Tell us how much you want to spend in each category for this period.
                </p>
                <form onSubmit={handleSubmit}>
                    {CATEGORIES.map((c) => (
                        <label key={c.id} className="budget-setup-row">
                            <span>{c.label}</span>
                            <span className="budget-setup-input-wrap">
                                <span className="dollar">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={values[c.id]}
                                    onChange={(e) => handleChange(c.id, e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </span>
                        </label>
                    ))}

                    <div className="budget-setup-dates">
                        <label>
                            Start Date
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            End Date
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </label>
                    </div>

                    <div className="budget-setup-total">
                        Total: <strong>${total.toLocaleString()}</strong>
                    </div>

                    {error && <div className="budget-setup-error">{error}</div>}

                    <button type="submit" className="budget-setup-submit" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Budget"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BudgetSetupModal;
