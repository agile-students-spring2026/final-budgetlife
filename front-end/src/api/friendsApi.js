const BASE_URL = "http://localhost:3000/api/friends";

export async function getFriends() {
  const response = await fetch(BASE_URL);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch friends");
  }

  return data;
}

export async function searchFriends(query) {
  const response = await fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to search friends");
  }

  return data;
}

export async function addFriend(username) {
  const response = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add friend");
  }

  return data;
}

export async function removeFriend(username) {
  const response = await fetch(`${BASE_URL}/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to remove friend");
  }

  return data;
}