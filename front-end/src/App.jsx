import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import CityLayout from "./city-dashboard/cityLayout.jsx";
import Account from "./screens/Account.jsx";
import Add_Friends from "./screens/Add_Friends";
import Friends_List from "./screens/Friends_List";
import Home from "./screens/Home";
import Login from "./screens/login.jsx";
import Login_In from "./screens/Login_In.jsx";
import PlayerCustomization from "./screens/Player_Customization.jsx";
import Shop from "./screens/Shop";
import Sign_up from "./screens/Sign_up.jsx";

function App() {
  return (
      <Router basename={import.meta.env.BASE_URL}>
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
      </Router>
  );
}

export default App;