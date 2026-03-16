import React, { useState } from "react";
import Home from "./screens/Home";
import Friends_List from "./screens/Friends_List";

function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      {page === "home" && <Home goToFriends={() => setPage("friends")} />}
      {page === "friends" && <Friends_List goHome={() => setPage("home")} />}
    </>
  );
}

export default App;