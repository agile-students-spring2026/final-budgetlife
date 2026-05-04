const BASE_URL = "/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function signup({ username, email, password }) {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function login({ usernameOrEmail, password }) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usernameOrEmail, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function updateUsername(currentUsername, newUsername) {
  const response = await fetch(`${BASE_URL}/username`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentUsername, newUsername }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update username");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function updateEmail(currentUsername, newEmail) {
  const response = await fetch(`${BASE_URL}/email`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentUsername, newEmail }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update email");
  }

  return data;
}

export async function changePassword(currentUsername, oldPassword, newPassword) {
  const response = await fetch(`${BASE_URL}/password`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentUsername, oldPassword, newPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to change password");
  }

  return data;
}

export async function deleteAccount(currentUsername) {
  const response = await fetch(`${BASE_URL}/account`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentUsername }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete account");
  }

  localStorage.removeItem("token");

  return data;
}

export async function getPlayerState(currentUsername) {
  const response = await fetch(
    `${BASE_URL}/player-state?currentUsername=${encodeURIComponent(currentUsername)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load player state");
  }

  return data.playerState;
}

export async function updatePlayerState(currentUsername, playerState) {
  const response = await fetch(`${BASE_URL}/player-state`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentUsername, playerState }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save player state");
  }

  return data.playerState;
  }

export function logout() {
  localStorage.removeItem("token");
}
