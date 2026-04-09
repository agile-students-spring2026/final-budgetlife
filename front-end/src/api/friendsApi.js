const BASE_URL = "http://localhost:3000/api/friends";

export async function getFriends(currentUsername) {
  const response = await fetch(
    `${BASE_URL}?currentUsername=${encodeURIComponent(currentUsername)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch friends");
  }

  return data;
}

export async function searchFriends(currentUsername, query) {
  const response = await fetch(
    `${BASE_URL}/search?currentUsername=${encodeURIComponent(
      currentUsername
    )}&q=${encodeURIComponent(query)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to search users");
  }

  return data;
}

export async function sendFriendRequest(currentUsername, username) {
  const response = await fetch(`${BASE_URL}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentUsername, username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send friend request");
  }

  return data;
}

export async function getIncomingRequests(currentUsername) {
  const response = await fetch(
    `${BASE_URL}/requests/incoming?currentUsername=${encodeURIComponent(
      currentUsername
    )}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch incoming requests");
  }

  return data;
}

export async function getOutgoingRequests(currentUsername) {
  const response = await fetch(
    `${BASE_URL}/requests/outgoing?currentUsername=${encodeURIComponent(
      currentUsername
    )}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch outgoing requests");
  }

  return data;
}

export async function acceptFriendRequest(currentUsername, requestId) {
  const response = await fetch(`${BASE_URL}/requests/${requestId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentUsername }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to accept friend request");
  }

  return data;
}

export async function declineFriendRequest(currentUsername, requestId) {
  const response = await fetch(`${BASE_URL}/requests/${requestId}/decline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentUsername }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to decline friend request");
  }

  return data;
}

export async function removeFriend(currentUsername, username) {
  const response = await fetch(`${BASE_URL}/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentUsername, username }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to remove friend");
  }

  return data;
}