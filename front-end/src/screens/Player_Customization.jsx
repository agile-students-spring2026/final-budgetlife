import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "../assets/customization_temp_data";
import "./Player_Customization.css";

const categories = ["hairstyle", "nose", "eyes"];

const mockData = {
    hairstyle: [
        data.hairstyle[0].img,
        data.hairstyle[1].img,
        data.hairstyle[2].img,
        data.hairstyle[3].img,
    ],
    nose: [
        data.nose[0].img,
        data.nose[1].img,
    ],
    eyes: [
        data.eyes[0].img,
        data.eyes[1].img,
    ],
};

function PlayerCustomization() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("hairstyle");
    const [selected, setSelected] = useState(null);

    return (
        <div className="customization-page">
        <div className="customization-screen">

            {/* Header */}
            <div className="customization-header">
            <h1 className="customization-title">Customization</h1>
            <button
                className="close-button"
                onClick={() => navigate("/city-layout")}
            >
                ×
            </button>
            </div>

            <div className="preview-section">
            {selected ? (
                <img src={selected} className="main-preview" />
            ) : (
                <img src={data.hairstyle[0].img} className="main-preview" />
            )}
            </div>

            <div className="container">
            <div className="tabs">
            {categories.map((tab) => (
                <button
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => {
                    setActiveTab(tab);
                    setSelected(null);
                }}
                >
                {tab}
                </button>
            ))}
            </div>

            <div className="circle-row">
            {mockData[activeTab].map((img, i) => (
                <img
                key={i}
                src={img}
                className={`circle-item ${
                    selected === img ? "active" : ""
                }`}
                onClick={() => setSelected(img)}
                />
            ))}
            </div>

            <div className="item_list">
            <div className="grid">
            {mockData[activeTab].map((img, i) => (
                <img
                key={i}
                src={img}
                className="grid-item"
                onClick={() => setSelected(img)}
                />
            ))}
            </div>
            </div>
        </div>
        </div>
        </div>
    );
}

export default PlayerCustomization;