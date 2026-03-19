import React, { useState } from "react";

import Home from "./screens/Home";
import Friends_List from "./screens/Friends_List";
import BudgetHeader from "./city-dashboard/cityLayout.jsx";


function App() {
  const [page, setPage] = useState("home");

  return (
    <>
      {page === "home" && <Home goToFriends={() => setPage("friends")} goToCityLayout={() => setPage("cityLayout")} />}
      {page === "friends" && <Friends_List goHome={() => setPage("home")} />}
      {page === "cityLayout" && <BudgetHeader />}
    </>
  );
}

export default App;