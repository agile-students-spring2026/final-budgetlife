
import "./cityLayout.css";

import BudgetHeader from "./BudgetHeader";
import { BuildingManager } from "./BuildingManager";

function CityLayout() {
    return (
        <div className="city-layout">
            <BudgetHeader />
            <BuildingManager />
        </div>
    );
}

export default CityLayout;