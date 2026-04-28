import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { PlayerContext } from "../context/Player_Context";
import {
    getCustomizationItem,
    PLAYER_CUSTOMIZATION_SLOTS,
} from "../data/playerCustomization";
import "./Player_Customization.css";

function PlayerCustomization() {
    const navigate = useNavigate();
    const { equippedItems, equipItem, ownsItem, isHydrated } = useContext(PlayerContext);
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
                    <div className="preview-copy">
                        <div className="preview-kicker">Live Preview</div>
                        <h2>Build the alien in layers</h2>
                        <p>
                            Each item is rendered as a full-size transparent overlay on top of the base sprite.
                        </p>
                    </div>

                    <div className="preview-stage">
                        <PlayerAvatar width={220} height={440} alt="Customized player avatar" />
                    </div>

                    <div className="slot-summary">
                        {PLAYER_CUSTOMIZATION_SLOTS.map((slot) => {
                            const equippedItem = getCustomizationItem(equippedItems[slot.id]);
                            return (
                                <div key={slot.id} className="slot-chip">
                                    <span className="slot-chip-label">{slot.label}</span>
                                    <span className="slot-chip-value">{equippedItem?.label || "None"}</span>
                                </div>
                            );
                        })}
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

                    <div className="section-header">
                        <div>
                            <div className="section-title">{activeSlot.label}</div>
                            <div className="section-subtitle">
                                {isHydrated
                                    ? "Choose one overlay for this slot."
                                    : "Loading your owned items..."}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="clear-btn"
                            onClick={() => equipItem(activeSlot.id, null)}
                            disabled={!equippedItems[activeSlot.id]}
                        >
                            Clear Slot
                        </button>
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
                                    <div className="item-card-price">${item.price}</div>
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