import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [error, setError] = useState("");

  const currentUsername = currentUser?.username || "";

  const loadFriends = async () => {
    if (!currentUsername) {
      setFriends([]);
      return;
    }

    const data = await getFriends(currentUsername);
    setFriends(data.friends);
  };

  const loadIncomingRequests = async () => {
    if (!currentUsername) {
      setIncomingRequests([]);
      return;
    }

    const data = await getIncomingRequestsApi(currentUsername);
    setIncomingRequests(data.requests);
  };

  const loadOutgoingRequests = async () => {
    if (!currentUsername) {
      setOutgoingRequests([]);
      return;
    }

    const data = await getOutgoingRequestsApi(currentUsername);
    setOutgoingRequests(data.requests);
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
    try {
      setSearchLoading(true);
      setError("");

      if (!currentUsername) {
        setSearchResults([]);
        return;
      }

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const data = await searchFriendsApi(currentUsername, query);
      setSearchResults(data.results);
    } catch (err) {
      setError(err.message || "Failed to search users");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (username) => {
    try {
      setError("");

      if (!currentUsername) {
        throw new Error("No logged-in user");
      }

      await sendFriendRequestApi(currentUsername, username);
      await loadAllFriendData();
      setSearchResults((prev) =>
        prev.filter(
          (user) => user.username.toLowerCase() !== username.toLowerCase()
        )
      );
    } catch (err) {
      setError(err.message || "Failed to send friend request");
      throw err;
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      setError("");

      if (!currentUsername) {
        throw new Error("No logged-in user");
      }

      await acceptFriendRequestApi(currentUsername, requestId);
      await loadAllFriendData();
    } catch (err) {
      setError(err.message || "Failed to accept friend request");
      throw err;
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      setError("");

      if (!currentUsername) {
        throw new Error("No logged-in user");
      }

      await declineFriendRequestApi(currentUsername, requestId);
      await loadAllFriendData();
    } catch (err) {
      setError(err.message || "Failed to decline friend request");
      throw err;
    }
  };

  const handleRemoveFriend = async (username) => {
    try {
      setError("");

      if (!currentUsername) {
        throw new Error("No logged-in user");
      }

      await removeFriendApi(currentUsername, username);
      await loadAllFriendData();
    } catch (err) {
      setError(err.message || "Failed to remove friend");
      throw err;
    }
  };

  useEffect(() => {
    loadAllFriendData();
  }, [currentUsername]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        searchResults,
        incomingRequests,
        outgoingRequests,
        loading,
        searchLoading,
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