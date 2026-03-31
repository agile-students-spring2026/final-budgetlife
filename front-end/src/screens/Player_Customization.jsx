import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "../assets/customization_temp_data";
import "./Player_Customization.css";

const categories = ["head", "shirts", "pants"];

const mockData = {
    head: [
        data.head[0].img,
        data.head[1].img,
        data.head[2].img,
        data.head[3].img,
    ],
    shirts: [
        data.shirts[0].img,
        data.shirts[1].img,
    ],
    pants: [
        data.pants[0].img,
        data.pants[1].img,
    ],
};

function PlayerCustomization() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("head");
    const [selectedHead, setSelectedHead] = useState(null);
    const [selectedShirt, setSelectedShirt] = useState(null);
    const [selectedPant, setSelectedPant] = useState(null);

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
                <div className="head">
                    <img src={selectedHead || data.head[0].img} className="main-preview h" />
                </div>

                <div className="shirt">
                    <img src={selectedShirt || data.shirts[0].img} className="main-preview s" />
                </div>

                <div className="pant">
                    <img src={selectedPant || data.pants[0].img} className="main-preview p" />
                </div>
            </div>

            <div className="container">
            <div className="tabs">
            {categories.map((tab) => (
                <button
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => {
                    setActiveTab(tab);
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
                    (activeTab === "head" && selectedHead === img) ||
                    (activeTab === "shirts" && selectedShirt === img) ||
                    (activeTab === "pants" && selectedPant === img)
                        ? "active"
                        : ""
                }`}
                onClick={() => {
                    if (activeTab === "head") {
                        setSelectedHead(img);
                    } else if (activeTab === "shirts") {
                        setSelectedShirt(img);
                    } else if (activeTab === "pants") {
                        setSelectedPant(img);
                    }
                }}
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
                onClick={() => {
                    if (activeTab === "head") {
                        setSelectedHead(img);
                    } else if (activeTab === "shirts") {
                        setSelectedShirt(img);
                    } else if (activeTab === "pants") {
                        setSelectedPant(img);
                    }
                }}
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