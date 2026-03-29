import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";

function Account() {
    
    const navigate = useNavigate();

    const [name, setName] = useState("Just A Lonely farmer");
    const [email, setEmail] = useState("JustALonlyEmail@gmail.com");


    return (
        <div className="account-page">
            <div className="account-screen">
            <div className="account-header">
            <h1 className="account-title">Edit Profile</h1>
            <button className="close-button" onClick={() => navigate("/home")}>
                ×
            </button>
            </div>

            <div className="profile-row">
                <button
                    className="user-icon-button"
                    >
                    <div className="shop-player-icon">Player Icon</div>
                </button>

                <div className="info-column">
                        <input
                        className="info"
                        type="text"
                        placeholder="Just A Lonely farmer"
                        value={name}
                        onChange={(n) => setName(n.target.value)}
                        />
                        <input
                        className="info"
                        type="text"
                        placeholder="JustALonelyEmail@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                </div>
            </div>

            <button
                    className="big">
                        Save Changes
            </button>

            <button
                className="big"
                onClick={() => navigate("/login")}>
                    Log Out
            </button>

            <button
                className="small"
                onClick={() => navigate("/login")}>
                    Delete Account
            </button>
            </div>
        </div>
    );
}


export default Account;