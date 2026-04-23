const BASE_URL = "http://localhost:3000/api/friends";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getFriends() {
  const response = await fetch(`${BASE_URL}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch friends");
  }

  return data;
}

export async function searchFriends(query) {
  const response = await fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to search users");
  }

  return data;
}

export async function sendFriendRequest(username) {
  const response = await fetch(`${BASE_URL}/request`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send friend request");
  }

  return data;
}

export async function getIncomingRequests() {
  const response = await fetch(`${BASE_URL}/requests/incoming`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch incoming requests");
  }

  return data;
}

export async function getOutgoingRequests() {
  const response = await fetch(`${BASE_URL}/requests/outgoing`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch outgoing requests");
  }

  return data;
}

export async function acceptFriendRequest(requestId) {
  const response = await fetch(`${BASE_URL}/requests/${requestId}/accept`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to accept friend request");
  }

  return data;
}

export async function declineFriendRequest(requestId) {
  const response = await fetch(`${BASE_URL}/requests/${requestId}/decline`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to decline friend request");
  }

  return data;
}

export async function removeFriend(username) {
  const response = await fetch(`${BASE_URL}/remove`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to remove friend");
  }

  return data;
}