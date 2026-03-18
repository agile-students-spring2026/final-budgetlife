import React, { useState } from "react";
import Home from "./screens/Home";
import Friends_List from "./screens/Friends_List";
import Shop from "./screens/Shop";

function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      {page === "home" && (
        <Home
          goToFriends={() => setPage("friends")}
          goToShop={() => setPage("shop")}
        />
      )}
      {page === "friends" && <Friends_List goHome={() => setPage("home")} />}
      {page === "shop" && <Shop goHome={() => setPage("home")} />}
    </>
  );
}

export default App;