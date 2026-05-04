const BASE_URL = "/api/city-state";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getCityState() {
  const response = await fetch(`${BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch city state");
  }

  return data;
}

export async function saveCityState(city) {
  const response = await fetch(`${BASE_URL}/me`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(city),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save city state");
  }

  return data;
}
