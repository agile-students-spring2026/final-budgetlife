const BASE_URL = "http://localhost:3000/api/city-state";

export async function getCityState(username) {
  const response = await fetch(`${BASE_URL}/${username}`);

  if (!response.ok) {
    throw new Error("Failed to fetch city state");
  }

  return response.json();
}

export async function saveCityState(username, city) {
  const response = await fetch(`${BASE_URL}/${username}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(city),
  });

  if (!response.ok) {
    throw new Error("Failed to save city state");
  }

  return response.json();
}