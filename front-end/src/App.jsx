import React, { useState } from "react";

import Home from "./screens/Home";
import Friends_List from "./screens/Friends_List";
import Shop from "./screens/Shop";
import BudgetHeader from "./city-dashboard/cityLayout.jsx";
import { BuildingManager } from "./city-dashboard/BuildingManager";

function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      {page === "home" && (
        <Home
          goToFriends={() => setPage("friends")}
          goToShop={() => setPage("shop")}
          goToCityLayout={() => setPage("cityLayout")}
        />
      )}

      {page === "friends" && (
        <Friends_List goHome={() => setPage("home")} />
      )}

      {page === "shop" && (
        <Shop goHome={() => setPage("home")} />
      )}

      {page === "cityLayout" && (
        <>
          <BudgetHeader />
          <BuildingManager />
        </>
      )}
    </>
  );
}

export default App;