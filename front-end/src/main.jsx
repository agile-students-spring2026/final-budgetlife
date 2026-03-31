import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PlayerProvider } from "./context/Player_Context.jsx"
import { BuildingProvider } from "./context/Building_Context";

createRoot(document.getElementById('root')).render(
 <StrictMode>
    <PlayerProvider>
      <BuildingProvider>
        <App />
      </BuildingProvider>
    </PlayerProvider>
  </StrictMode>
)