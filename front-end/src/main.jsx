import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/Auth_Context.jsx";
import { BuildingProvider } from "./context/Building_Context.jsx";
import { FriendsProvider } from "./context/Friends_Context.jsx";
import { PlayerProvider } from "./context/Player_Context.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PlayerProvider>
        <BuildingProvider>
          <FriendsProvider>
            <App />
          </FriendsProvider>
        </BuildingProvider>
      </PlayerProvider>
    </AuthProvider>
  </StrictMode>
);
