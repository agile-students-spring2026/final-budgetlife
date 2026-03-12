import React, { useState } from "react";
import Home from "./screens/Home";
import Friends from "./screens/Friends_List";

function App() {
  const [page, setPage] = useState("home");

  if (page === "home") {
    return <Home goToFriends={() => setPage("friends")} />;
  }

  if (page === "friends") {
    return <Friends goHome={() => setPage("home")} />;
  }
}

export default App;