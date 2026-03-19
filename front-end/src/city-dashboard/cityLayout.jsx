
import "./cityLayout.css";

import BudgetHeader from "./BudgetHeader";
import { BuildingManager } from "./BuildingManager";
import { useState } from "react";
import { DisplayMenu } from "./building";

function CityLayout() {
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    return (
        <div className="city-layout">
            {selectedBuilding ? (
                <DisplayMenu building={selectedBuilding} onClose={() => setSelectedBuilding(null)} />
            ) : (
                <BudgetHeader />
            )}
            <BuildingManager 
                onBuildingClick={setSelectedBuilding} 
                onCloseMenu={selectedBuilding ? () => setSelectedBuilding(null) : undefined} 
                showBudget={!selectedBuilding}
            />
        </div>
    );
}

export default CityLayout;