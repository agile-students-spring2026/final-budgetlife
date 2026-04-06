import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getFriends,
  searchFriends as searchFriendsApi,
  addFriend as addFriendApi,
  removeFriend as removeFriendApi,
} from "../api/friendsApi";

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getFriends();
      setFriends(data.friends);
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

  const handleAddFriend = async (username) => {
    try {
      setError("");
      await addFriendApi(username);
      await loadFriends();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleRemoveFriend = async (username) => {
    try {
      setError("");
      await removeFriendApi(username);
      await loadFriends();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        searchResults,
        loading,
        searchLoading,
        error,
        loadFriends,
        handleSearch,
        handleAddFriend,
        handleRemoveFriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => useContext(FriendsContext);