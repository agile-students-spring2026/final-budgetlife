const BASE_URL = "/api/budget";

export async function getBudgetGoals(currentUsername) {
    const response = await fetch(
        `${BASE_URL}/goals?currentUsername=${encodeURIComponent(currentUsername)}`
    );
    if (response.status === 404) {
        return null;
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch budget goals");
    }
    return data.goals;
}

export async function initBudgetGoals({
    currentUsername,
    food,
    housing,
    health,
    entertainment,
    startDate,
    endDate,
}) {
    const response = await fetch(`${BASE_URL}/goals/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            currentUsername,
            food,
            housing,
            health,
            entertainment,
            startDate,
            endDate,
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to initialize budget goals");
    }
    return data.goals;
}

export async function getBuildingHealth(currentUsername) {
    const response = await fetch(
        `${BASE_URL}/buildings?currentUsername=${encodeURIComponent(currentUsername)}`
    );
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch building health");
    }
    return data.health;
}

export async function getTransactions(currentUsername) {
    const response = await fetch(
        `${BASE_URL}/transactions?currentUsername=${encodeURIComponent(currentUsername)}`
    );
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transactions");
    }
    return data.transactions;
}

export async function addTransaction({
    currentUsername,
    category,
    amount,
    description,
    date,
}) {
    const response = await fetch(`${BASE_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            currentUsername,
            category,
            amount,
            description,
            date,
        }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to add transaction");
    }
    return data; // { message, health, goals }
}

export async function updateBudgetGoal(currentUsername, category, goal) {
    const response = await fetch(`${BASE_URL}/goals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUsername, category, goal }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to update goal");
    }
    return data;
}

export async function updateBudgetDates(currentUsername, startDate, endDate) {
    const response = await fetch(`${BASE_URL}/dates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUsername, startDate, endDate }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to update dates");
    }
    return data;
}

export async function claimReward(currentUsername) {
    const response = await fetch(`${BASE_URL}/reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentUsername }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to claim reward");
    }
    return data;
}
