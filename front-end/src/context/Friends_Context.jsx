import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFriends = async () => {
    const data = await getFriends();
    setFriends(data.friends);
  };

  const loadIncomingRequests = async () => {
    const data = await getIncomingRequestsApi();
    setIncomingRequests(data.requests);
  };

  const loadOutgoingRequests = async () => {
    const data = await getOutgoingRequestsApi();
    setOutgoingRequests(data.requests);
  };

  const loadAllFriendData = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([
        loadFriends(),
        loadIncomingRequests(),
        loadOutgoingRequests(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
        setSearchLoading(true);
        setError("");

        if (!query.trim()) {
        setSearchResults([]);
        return;
        }

        const data = await searchFriendsApi(query);
        setSearchResults(data.results);
    } catch (err) {
        setError(err.message);
    } finally {
        setSearchLoading(false);
    }
    };
    
  const handleSendFriendRequest = async (username) => {
    try {
      setError("");
      await sendFriendRequestApi(username);
      await loadAllFriendData();
      await handleSearch("");
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      setError("");
      await acceptFriendRequestApi(requestId);
      await loadAllFriendData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      setError("");
      await declineFriendRequestApi(requestId);
      await loadAllFriendData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleRemoveFriend = async (username) => {
    try {
      setError("");
      await removeFriendApi(username);
      await loadAllFriendData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadAllFriendData();
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