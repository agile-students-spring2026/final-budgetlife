import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

import CityLayout from "./city-dashboard/cityLayout.jsx";
import BudgetSetupModal from "./components/BudgetSetupModal.jsx";
import { useAuth } from "./context/Auth_Context.jsx";
import Account from "./screens/Account.jsx";
import Add_Friends from "./screens/Add_Friends";
import Friends_List from "./screens/Friends_List";
import Home from "./screens/Home";
import Login from "./screens/Login.jsx";
import Login_In from "./screens/Login_In.jsx";
import PlayerCustomization from "./screens/Player_Customization.jsx";
import Shop from "./screens/Shop";
import Sign_up from "./screens/Sign_up.jsx";

const AUTH_PATHS = new Set(["/", "/login", "/signup"]);

function AppRoutes() {
  const location = useLocation();
  const { currentUser, needsBudgetSetup, markBudgetSetupComplete } = useAuth();
  const onAuthPage = AUTH_PATHS.has(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login_In />} />
        <Route path="/signup" element={<Sign_up />} />
        <Route path="/home" element={<Home />} />
        <Route path="/friends" element={<Friends_List />} />
        <Route path="/add-friends" element={<Add_Friends />} />
        <Route path="/city-layout" element={<CityLayout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/player_customization" element={<PlayerCustomization />} />
      </Routes>
      {currentUser && needsBudgetSetup && !onAuthPage && (
        <BudgetSetupModal
          username={currentUser.username}
          onComplete={markBudgetSetupComplete}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </Router>
  );
}

export default App;
