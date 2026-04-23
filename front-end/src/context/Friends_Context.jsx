import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/Auth_Context";
import {
  getFriends,
  searchFriends as searchFriendsApi,
  sendFriendRequest as sendFriendRequestApi,
  getIncomingRequests as getIncomingRequestsApi,
  getOutgoingRequests as getOutgoingRequestsApi,
  acceptFriendRequest as acceptFriendRequestApi,
  declineFriendRequest as declineFriendRequestApi,
  removeFriend as removeFriendApi,
} from "../api/friendsApi";

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [removingUsernames, setRemovingUsernames] = useState(new Set());
  const [error, setError] = useState("");
  const searchTimeoutRef = useRef(null);

  const currentUserId = currentUser?.id || "";
  const currentUsername = currentUser?.username || "";

  const loadFriends = async () => {
    if (!currentUsername) {
      setFriends([]);
      return;
    }

    const data = await getFriends();
    setFriends(data.friends || []);
  };

  const loadIncomingRequests = async () => {
    if (!currentUsername) {
      setIncomingRequests([]);
      return;
    }

    const data = await getIncomingRequestsApi();
    setIncomingRequests(data.requests || []);
  };

  const loadOutgoingRequests = async () => {
    if (!currentUsername) {
      setOutgoingRequests([]);
      return;
    }

    const data = await getOutgoingRequestsApi();
    setOutgoingRequests(data.requests || []);
  };

  const loadAllFriendData = async () => {
    try {
      setLoading(true);
      setError("");

      if (!currentUsername) {
        setFriends([]);
        setIncomingRequests([]);
        setOutgoingRequests([]);
        return;
      }

      await Promise.all([
        loadFriends(),
        loadIncomingRequests(),
        loadOutgoingRequests(),
      ]);
    } catch (err) {
      setError(err.message || "Failed to load friend data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setError("");

    if (!currentUsername) {
      setSearchResults([]);
      return;
    }

    const trimmedQuery = query.trim();

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchFriendsApi(trimmedQuery);
        setSearchResults(data.results || []);
      } catch (err) {
        setError(err.message || "Failed to search users");
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSendFriendRequest = async (username) => {
    if (!currentUsername) {
      const err = new Error("No logged-in user");
      setError(err.message);
      throw err;
    }

    const normalizedUsername = (username || "").toLowerCase();

    setError("");
    setActionLoading(true);

    const previousOutgoing = outgoingRequests;
    const previousSearchResults = searchResults;

    const optimisticRequest = {
      id: `temp-${normalizedUsername}`,
      toUsername: username,
      fromUsername: currentUsername,
      status: "pending",
    };

    setOutgoingRequests((prev) => {
      const alreadyExists = prev.some(
        (request) =>
          (request.toUsername || "").toLowerCase() === normalizedUsername
      );

      if (alreadyExists) return prev;
      return [...prev, optimisticRequest];
    });

    setSearchResults((prev) =>
      prev.filter(
        (user) => (user.username || "").toLowerCase() !== normalizedUsername
      )
    );

    try {
      const data = await sendFriendRequestApi(username);

      if (data?.request) {
        setOutgoingRequests((prev) => {
          const withoutTemp = prev.filter(
            (request) =>
              (request.toUsername || "").toLowerCase() !== normalizedUsername
          );

          return [...withoutTemp, data.request];
        });
      }
    } catch (err) {
      setOutgoingRequests(previousOutgoing);
      setSearchResults(previousSearchResults);
      setError(err.message || "Failed to send friend request");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    if (!currentUsername) {
      const err = new Error("No logged-in user");
      setError(err.message);
      throw err;
    }

    setError("");
    setActionLoading(true);

    const requestToAccept = incomingRequests.find(
      (request) => String(request.id || request._id) === String(requestId)
    );

    const previousIncoming = incomingRequests;
    const previousFriends = friends;

    if (requestToAccept) {
      setIncomingRequests((prev) =>
        prev.filter(
          (request) => String(request.id || request._id) !== String(requestId)
        )
      );

      const optimisticFriend = {
        id:
          requestToAccept.fromUser?.id ||
          requestToAccept.fromUser?._id ||
          requestToAccept.fromUsername,
        _id:
          requestToAccept.fromUser?._id ||
          requestToAccept.fromUser?.id ||
          requestToAccept.fromUsername,
        username: requestToAccept.fromUsername,
        name:
          requestToAccept.fromUser?.name ||
          requestToAccept.fromUsername ||
          "Unknown",
        info: "Friends for less than a day",
      };

      setFriends((prev) => {
        const alreadyExists = prev.some(
          (friend) =>
            (friend.username || "").toLowerCase() ===
            optimisticFriend.username.toLowerCase()
        );

        if (alreadyExists) return prev;
        return [...prev, optimisticFriend];
      });
    }

    try {
      const data = await acceptFriendRequestApi(requestId);

      if (data?.friend) {
        setFriends((prev) => {
          const withoutTemp = prev.filter(
            (friend) =>
              (friend.username || "").toLowerCase() !==
              (data.friend.username || "").toLowerCase()
          );

          return [...withoutTemp, data.friend];
        });
      }
    } catch (err) {
      setIncomingRequests(previousIncoming);
      setFriends(previousFriends);
      setError(err.message || "Failed to accept friend request");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      setActionLoading(true);
      setError("");

      if (!currentUsername) {
        throw new Error("No logged-in user");
      }

      await declineFriendRequestApi(requestId);

      setIncomingRequests((prev) =>
        prev.filter(
          (request) => String(request.id || request._id) !== String(requestId)
        )
      );
    } catch (err) {
      setError(err.message || "Failed to decline friend request");
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async (username) => {
    if (!currentUsername) {
      const err = new Error("No logged-in user");
      setError(err.message);
      throw err;
    }

    const normalizedUsername = (username || "").toLowerCase();

    if (removingUsernames.has(normalizedUsername)) {
      return;
    }

    setError("");
    setActionLoading(true);
    setRemovingUsernames((prev) => new Set(prev).add(normalizedUsername));

    const previousFriends = friends;

    setFriends((prev) =>
      prev.filter(
        (friend) =>
          (friend.username || "").toLowerCase() !== normalizedUsername
      )
    );

    try {
      await removeFriendApi(username);
    } catch (err) {
      setFriends(previousFriends);
      setError(err.message || "Failed to remove friend");
      throw err;
    } finally {
      setRemovingUsernames((prev) => {
        const next = new Set(prev);
        next.delete(normalizedUsername);
        return next;
      });
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadAllFriendData();
  }, [currentUserId]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        searchResults,
        incomingRequests,
        outgoingRequests,
        loading,
        searchLoading,
        actionLoading,
        removingUsernames,
        error,
        loadAllFriendData,
        handleSearch,
        handleSendFriendRequest,
        handleAcceptFriendRequest,
        handleDeclineFriendRequest,
        handleRemoveFriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => useContext(FriendsContext);