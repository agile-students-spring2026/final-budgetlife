import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PlayerContext } from "../context/Player_Context";
import {
    PLAYER_CUSTOMIZATION_SLOTS,
} from "../data/playerCustomization";
import "./Player_Customization.css";

function PlayerCustomization() {
    const navigate = useNavigate();
    const { equippedItems, equipItem, ownsItem } = useContext(PlayerContext);
    const [activeTab, setActiveTab] = useState(PLAYER_CUSTOMIZATION_SLOTS[0].id);

    const activeSlot = useMemo(
        () =>
            PLAYER_CUSTOMIZATION_SLOTS.find((slot) => slot.id === activeTab) ||
            PLAYER_CUSTOMIZATION_SLOTS[0],
        [activeTab]
    );

    return (
        <div className="customization-page">
            <div className="customization-screen">
                <div className="customization-header">
                    <h1 className="customization-title">Customization</h1>
                    <button
                        className="close-button"
                        onClick={() => navigate("/city-layout")}
                    >
                        ×
                    </button>
                </div>

                <div className="preview-panel">
                    <div className="preview-stage">
                        <PlayerAvatar
                            width={220}
                            height={420}
                            alt="Customized player avatar"
                            imageScale={1.55}
                            imageOffsetY={-18}
                        />
                    </div>
                </div>

                <div className="container">
                    <div className="tabs">
                        {PLAYER_CUSTOMIZATION_SLOTS.map((slot) => (
                            <button
                                key={slot.id}
                                className={`tab ${activeTab === slot.id ? "active" : ""}`}
                                onClick={() => setActiveTab(slot.id)}
                            >
                                {slot.label}
                            </button>
                        ))}
                    </div>

                    <div className="item-grid">
                        {activeSlot.items.map((item) => {
                            const selected = equippedItems[activeSlot.id] === item.id;
                            const owned = ownsItem(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className={`item-card ${selected ? "active" : ""} ${owned ? "" : "locked"}`}
                                >
                                    <div className="item-card-icon-wrap">
                                        <img src={item.iconSrc} alt={item.label} className="item-card-icon" />
                                    </div>
                                    <div className="item-card-title">{item.label}</div>
                                    <button
                                        type="button"
                                        className={`item-card-action-btn ${selected ? "equipped" : ""}`}
                                        onClick={() =>
                                            owned
                                                ? equipItem(activeSlot.id, selected ? null : item.id)
                                                : navigate("/shop")
                                        }
                                    >
                                        {selected ? "Unequip" : owned ? "Equip" : "Go to Shop"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlayerCustomization;