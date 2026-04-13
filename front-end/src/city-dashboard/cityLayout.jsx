
import GrassBackground from "../../ArtAssets/GrassBackground.png";
import "./cityLayout.css";

import BudgetHeader from "./BudgetHeader";
import { BuildingManager } from "./BuildingManager";
import { useState } from "react";
import { DisplayMenu } from "./building";
import TransactionPanel from "../components/TransactionPanel";

function CityLayout() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // NEW STATE
  const [showPopup, setShowPopup] = useState(false);
  const [showSlide, setShowSlide] = useState(false);

  return (
    <div
      className="city-layout"
      style={{
        backgroundImage: `url(${GrassBackground})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        minHeight: "100vh",
        width: "100vw"
      }}
    >

      {selectedBuilding ? (
        <DisplayMenu
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      ) : (
        <BudgetHeader />
      )}

   
      <BuildingManager
        onBuildingClick={setSelectedBuilding}
        onCloseMenu={selectedBuilding ? () => setSelectedBuilding(null) : undefined}
        showBudget={!selectedBuilding}
      />

     
      {showSlide && !selectedBuilding && (
  <TransactionPanel
    mode="slide"
    onClose={() => setShowSlide(false)}  
    onSubmit={(data) => {
      console.log(data);
      setShowSlide(false);
    }}
  />
)}

  
      {showPopup && (
        <TransactionPanel
          mode="popup"
          onClose={() => setShowPopup(false)}
          onSubmit={(data) => {
            console.log(data);
            setShowPopup(false);
          }}
        />
      )}

      {!selectedBuilding && (
        <button
          className="add-transaction-btn"
          onClick={() => setShowPopup(true)}
        >
          +
        </button>
      )}

      {!selectedBuilding && (
        <button
          className="slide-trigger-btn"
          onClick={() => setShowSlide(true)}
        >
          Test Notificaton
        </button>
      )}

    </div>
  );
}

export default CityLayout;