import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Home from "./screens/Home";
import Friends_List from "./screens/Friends_List";
import Shop from "./screens/Shop";
import BudgetHeader from "./city-dashboard/cityLayout.jsx";
import { BuildingManager } from "./city-dashboard/BuildingManager";
import Account from "./screens/Account.jsx";
import Login from "./screens/login.jsx";
import Login_In from "./screens/Login_In.jsx";
import Sign_up from "./screens/Sign_up.jsx";

function App() {
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